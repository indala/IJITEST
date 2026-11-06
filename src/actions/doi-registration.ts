"use server";
import "server-only";

import { db } from "@/lib/db";
import { submissions, publications, volumesIssues } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getPaperById } from "@/actions/archives";
import { getSubmissionById } from "@/actions/submissions";
import { getSettingsData } from "@/actions/settings";
import { generateCrossRefXml } from "@/lib/crossref-generator";
import { getCrossrefConfig, getZenodoConfig } from "@/lib/doi-config";
import { isValidDoi, normalizeDoi } from "@/lib/doi-config";
import { logSubmissionEvent } from "@/actions/event-log";
import { downloadFileFromStorage, triggerPdfBranding } from "@/lib/fs-utils";
import { revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { purgeCacheTags } from "@/lib/cache-invalidation";
import type { DoiRegistrationStatus } from "@/db/types";
import { rebrandPublishedPaperWithDoi } from "@/lib/publication-branding";

const CROSSREF_REQUEST_TIMEOUT_MS = 60_000;
const ZENODO_REQUEST_TIMEOUT_MS = 60_000;
const ZENODO_UPLOAD_TIMEOUT_MS = 120_000;

export async function markCrossrefDepositRejected(
    submissionId: number,
    batchId: string,
): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const [publication] = await db.select()
            .from(publications)
            .where(eq(publications.submissionId, submissionId))
            .limit(1);
        if (
            !publication ||
            publication.doiRegistrationStatus !== 'pending' ||
            publication.doiRegistrationBatchId !== batchId
        ) {
            return actionError("The Crossref batch is no longer pending or its batch ID changed. Refresh and verify the current status.");
        }

        const update = await db.update(publications)
            .set({ doiRegistrationStatus: 'failed' })
            .where(and(
                eq(publications.id, publication.id),
                eq(publications.doiRegistrationStatus, 'pending'),
                eq(publications.doiRegistrationBatchId, batchId),
            ));
        if (update[0].affectedRows === 0) {
            return actionError("Crossref status changed while recording the rejection. Refresh the publication and verify its current status.");
        }

        await logSubmissionEvent({
            submissionId,
            eventType: 'doi_registration_failed',
            userId: session.user.id,
            description: `Crossref batch ${batchId} was marked rejected after reviewing its submission report.`,
            metadata: {
                batchId,
                ...(publication.doi ? { doi: publication.doi } : {}),
                provider: 'crossref',
            },
        });
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        purgeCacheTags(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.ARCHIVES, CACHE_TAGS.LATEST_ISSUE);
        await rebrandPublishedPaperWithDoi(submissionId, null);
        return actionSuccess();
    } catch (error) {
        console.error("markCrossrefDepositRejected error:", error);
        return serverError(error, "mark Crossref deposit rejected");
    }
}

// 1. Crossref Deposit
// ---------------------------------------------------------------------------

/**
 * Live CrossRef Deposit Server Action
 * Generates CrossRef Schema 5.3.1 XML and submits it to CrossRef servlet endpoint.
 * Claims the publication before sending to prevent duplicate batches. An ambiguous
 * network result stays pending until the Crossref batch is verified.
 * Crossref processes the XML asynchronously; use submission-log polling to confirm.
 */
export async function depositToCrossref(submissionId: number, requestedDoi?: string): Promise<ActionResponse<{
    batchId: string;
    status: Extract<DoiRegistrationStatus, 'pending' | 'registered' | 'failed'>;
    message: string;
}>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        // Fetch submission
        const subRows = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
        if (!subRows.length || !subRows[0]) {
            return actionError("Manuscript submission not found.");
        }
        const submission = subRows[0];

        // Fetch publication record
        const pubRows = await db.select().from(publications).where(eq(publications.submissionId, submissionId)).limit(1);
        if (!pubRows.length || !pubRows[0]) {
            return actionError("Publication record not found for this submission. Assign to issue first.");
        }
        const pub = pubRows[0];

        const depositDoi = requestedDoi?.trim()
            ? normalizeDoi(requestedDoi, 'crossref')
            : pub.doi;
        if (!depositDoi) {
            return actionError("Manuscript does not have an assigned DOI.");
        }

        if (pub.doiRegistrationStatus === 'pending') {
            if (!pub.doiRegistrationBatchId) {
                return actionError("A Crossref deposit is already pending without a batch ID. Review its status before trying again.");
            }
            return actionSuccess({
                batchId: pub.doiRegistrationBatchId,
                status: 'pending',
                message: `Crossref batch ${pub.doiRegistrationBatchId} is already pending. It was not submitted again.`,
            });
        }

        const config = getCrossrefConfig();
        const normalizedDoi = normalizeDoi(depositDoi);
        if (!isValidDoi(normalizedDoi) || !normalizedDoi.toLowerCase().startsWith(`${config.prefix.toLowerCase()}/`)) {
            return actionError(`DOI '${normalizedDoi}' does not match journal CrossRef prefix '${config.prefix}'. Only official CrossRef DOIs can be deposited.`);
        }

        const duplicateDoi = await db.select({
            id: publications.id,
            submissionId: publications.submissionId,
        })
            .from(publications)
            .where(eq(publications.doi, normalizedDoi))
            .limit(1);
        if (duplicateDoi[0] && duplicateDoi[0].submissionId !== submissionId) {
            return actionError("That DOI is already assigned to another publication.");
        }

        if (!config.username || !config.password) {
            return actionError("CrossRef credentials not configured. Please set CROSSREF_USERNAME and CROSSREF_PASSWORD in .env.");
        }

        if (!submission.paperId) {
            return actionError("Paper ID missing for this submission.");
        }

        // Fetch full paper payload & journal settings
        const [paperRes, settings] = await Promise.all([
            getPaperById(submission.paperId),
            getSettingsData()
        ]);

        if (!paperRes.success) return actionError(paperRes.error);
        if (!paperRes.data) return actionError("Failed to load paper metadata for CrossRef export.");

        const paper = paperRes.data;
        paper.doi = normalizedDoi;
        const batchId = `cr-${Date.now()}-${paper.paperId}`;

        // Generate CrossRef XML
        const xml = generateCrossRefXml({
            settings,
            papers: [paper],
            batchId,
        });

        const claim = await db.transaction(async (tx) => {
            const [currentPub] = await tx.select()
                .from(publications)
                .where(eq(publications.id, pub.id))
                .for("update");
            if (!currentPub) {
                throw new Error("Publication record disappeared before Crossref submission.");
            }
            if (currentPub.doiRegistrationStatus === 'pending') {
                return { claimed: false, batchId: currentPub.doiRegistrationBatchId };
            }
            if (currentPub.doiRegistrationStatus === 'registered') {
                return { claimed: false, batchId: null, stale: true as const };
            }
            await tx.update(publications)
                .set({
                    doi: normalizedDoi,
                    doiProvider: 'crossref',
                    doiRegistrationStatus: 'pending',
                    doiRegistrationBatchId: batchId,
                })
                .where(eq(publications.id, pub.id));
            return { claimed: true, batchId };
        });

        if (!claim.claimed) {
            if ('stale' in claim) {
                return actionError("The assigned Crossref DOI changed before deposit submission. Refresh and verify the current DOI.");
            }
            if (!claim.batchId) {
                return actionError("A Crossref deposit is already pending without a batch ID. Review its status before trying again.");
            }
            return actionSuccess({
                batchId: claim.batchId,
                status: 'pending',
                message: `Crossref batch ${claim.batchId} is already pending. It was not submitted again.`,
            });
        }

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        purgeCacheTags(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.ARCHIVES, CACHE_TAGS.LATEST_ISSUE, CACHE_TAGS.PAPER(paper.paperId));
        try {
            await rebrandPublishedPaperWithDoi(submissionId, null);
        } catch (error) {
            console.error(`Crossref DOI is pending for ${paper.paperId}, but removing it from the PDF failed:`, error);
        }

        // Prepare multipart form data
        const formData = new FormData();
        formData.append("operation", "doMDUpload");
        formData.append("login_id", config.username);
        formData.append("login_passwd", config.password);

        const xmlBlob = new Blob([xml], { type: "application/xml" });
        formData.append("fname", xmlBlob, `${batchId}.xml`);

        console.log(`[CrossRef Deposit] Submitting batch ${batchId} to ${config.depositUrl}...`);

        let responseText = "";
        let responseStatus = 0;

        try {
            const res = await fetch(config.depositUrl, {
                method: "POST",
                body: formData,
                signal: AbortSignal.timeout(CROSSREF_REQUEST_TIMEOUT_MS),
            });
            responseStatus = res.status;
            responseText = await res.text();
        } catch (fetchErr: unknown) {
            const errMessage = fetchErr instanceof Error ? fetchErr.message : "Network error";
            console.error("[CrossRef Deposit] Network error:", errMessage);

            return actionError(
                `Crossref did not confirm batch ${batchId} (${errMessage}). Its status remains pending to prevent a duplicate deposit; verify this batch before retrying.`
            );
        }

        // Crossref returns HTTP 200 to acknowledge queue receipt.
        // A non-2xx status means the submission itself was rejected (bad auth, malformed XML, etc.).
        // Final registration success/failure is determined asynchronously via the submission log.
        if (responseStatus < 200 || responseStatus >= 300) {
            console.error(`[CrossRef Deposit] HTTP error (${responseStatus}):`, responseText);

            await db.update(publications)
                .set({
                    doiRegistrationStatus: 'failed',
                    doiRegistrationBatchId: batchId,
                })
                .where(eq(publications.id, pub.id));

            await logSubmissionEvent({
                submissionId,
                eventType: 'doi_registration_failed',
                userId: session.user.id,
                description: `CrossRef deposit rejected (HTTP ${responseStatus}): ${responseText.slice(0, 200)}`,
                metadata: { batchId, responseStatus, responseExcerpt: responseText.slice(0, 300) }
            });

            return actionError(`CrossRef rejected deposit (${responseStatus}): ${responseText.slice(0, 200)}`);
        }

        await logSubmissionEvent({
            submissionId,
            eventType: 'doi_deposit_submitted',
            userId: session.user.id,
            description: `CrossRef deposit queued successfully (Batch ID: ${batchId}). Awaiting Crossref processing.`,
            metadata: { batchId, doi: normalizedDoi, provider: 'crossref' }
        });

        return actionSuccess({
            batchId,
            status: 'pending',
            message: `Deposit submitted to CrossRef. Batch ID: ${batchId}. The deposit is now pending Crossref processing (typically several minutes, but may take longer depending on queue load).`
        });

    } catch (error) {
        console.error("depositToCrossref error:", error);
        return serverError(error, "deposit to CrossRef");
    }
}

// ---------------------------------------------------------------------------
// 2. Zenodo Post-Publication Deposit
// ---------------------------------------------------------------------------

/**
 * Zenodo Post-Publication Deposit Server Action
 *
 * Performs the full three-step Zenodo deposit workflow:
 *   1. Create deposition (reserves DOI)
 *   2. Upload the published PDF to the deposition bucket
 *   3. Publish the deposition (registers the DOI with DataCite)
 *
 * The Zenodo DOI is stored in publications.zenodoDoi — completely separate
 * from publications.doi (which holds the canonical Crossref DOI) so neither
 * identifier ever overwrites the other.
 */
export async function depositToZenodo(submissionId: number): Promise<ActionResponse<{
    zenodoDoi: string;
    recordUrl: string;
}>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return actionError("Unauthorized. Authentication required.");
        }

        const subRows = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
        if (!subRows.length || !subRows[0]) {
            return actionError("Submission not found.");
        }
        const submission = subRows[0];

        // Access control: corresponding author or admin/editor
        const isAuthor = submission.correspondingAuthorId === session.user.id;
        const isStaff = ['admin', 'editor'].includes(session.user.role);
        if (!isAuthor && !isStaff) {
            return actionError("Unauthorized to deposit this manuscript.");
        }

        const pubRows = await db.select().from(publications).where(eq(publications.submissionId, submissionId)).limit(1);
        if (!pubRows.length || !pubRows[0]) {
            return actionError("Publication record not found. The paper must be published first.");
        }
        const pub = pubRows[0];

        // Require an actual published PDF — this also acts as a "is published" guard
        if (!pub.finalPdfUrl) {
            return actionError("Published PDF not found. The paper must have a galley PDF before depositing to Zenodo.");
        }

        if (pub.zenodoStatus === 'pending') {
            return actionError(
                `A Zenodo deposit is already pending${pub.zenodoRecordId ? ` for record ${pub.zenodoRecordId}` : ''}. It was not submitted again; verify its status before retrying.`
            );
        }
        if (pub.zenodoRecordId && pub.zenodoStatus !== 'published') {
            return actionError(
                `Zenodo record ${pub.zenodoRecordId} already exists in ${pub.zenodoStatus} state. Verify or complete that record before creating another deposit.`
            );
        }

        // Idempotency: if already deposited and published to Zenodo, avoid creating duplicate depositions
        if (pub.zenodoStatus === 'published' && pub.zenodoDoi) {
            const shouldSetAsPrimaryDoi = pub.doiProvider !== 'crossref';
            if (shouldSetAsPrimaryDoi && pub.doi !== pub.zenodoDoi) {
                await db.update(publications)
                    .set({
                        doi: pub.zenodoDoi,
                        doiProvider: 'zenodo',
                    })
                    .where(eq(publications.id, pub.id));
            }
            const tags = [
                CACHE_TAGS.SUBMISSION(submissionId),
                CACHE_TAGS.PUBLICATIONS,
                CACHE_TAGS.ARCHIVES,
                CACHE_TAGS.LATEST_ISSUE,
            ];
            if (submission.paperId) {
                tags.push(CACHE_TAGS.PAPER(submission.paperId));
            }
            purgeCacheTags(...tags);

            revalidatePath(`/author/submissions/${submissionId}`);
            revalidatePath(`/admin/submissions/${submissionId}`);
            revalidatePath('/admin/submissions');
            revalidatePath('/admin/publications');

            return actionSuccess({
                zenodoDoi: pub.zenodoDoi,
                recordUrl: pub.zenodoRecordUrl || `https://zenodo.org/records/${pub.zenodoRecordId || pub.zenodoDoi.replace('10.5281/zenodo.', '')}`,
            });
        }

        const config = getZenodoConfig();
        if (!config.accessToken) {
            return actionError("Zenodo access token not configured. Set ZENODO_ACCESS_TOKEN in .env.");
        }

        if (!submission.paperId) {
            return actionError("Paper ID missing.");
        }

        const [paperRes, settings] = await Promise.all([
            getPaperById(submission.paperId),
            getSettingsData()
        ]);

        if (!paperRes.success || !paperRes.data) {
            return actionError("Failed to load published paper metadata.");
        }

        const paper = paperRes.data;

        // The author list includes the corresponding author; do not append them twice.
        const creators = paper.coAuthors && paper.coAuthors.length > 0
            ? paper.coAuthors.map((author) => ({
                name: author.name,
                affiliation: author.institution || undefined,
                orcid: author.orcidId || undefined,
            }))
            : [{
                name: paper.authorName,
                affiliation: paper.affiliation || undefined,
            }];

        const publicationDate = paper.issueDatePublished || paper.publishedAt;
        const publicationDateValue = publicationDate ? new Date(publicationDate) : null;
        if (!publicationDateValue || Number.isNaN(publicationDateValue.getTime())) {
            return actionError("A valid publication date is required before depositing this paper to Zenodo.");
        }

        // -----------------------------------------------------------------------
        // Step 1: Create deposition
        // -----------------------------------------------------------------------
        const depositionPayload = {
            metadata: {
                title: paper.title,
                upload_type: "publication",
                publication_type: "article",
                description: paper.abstract,
                publication_date: publicationDateValue.toISOString().slice(0, 10),
                access_right: "open",
                license: "cc-by-4.0",
                keywords: paper.keywords
                    ? paper.keywords.split(",").map((k: string) => k.trim())
                    : [],
                creators,
                journal_title: settings['journalName'] || "IJITEST",
                journal_volume: paper.volumeNumber ? String(paper.volumeNumber) : undefined,
                journal_issue: paper.issueNumber ? String(paper.issueNumber) : undefined,
                // Link to the canonical Crossref DOI without overwriting it
                related_identifiers: pub.doi && pub.doiProvider === 'crossref' && pub.doiRegistrationStatus === 'registered'
                    ? [
                        {
                            identifier: `https://doi.org/${pub.doi}`,
                            relation: "isIdenticalTo",
                            scheme: "doi",
                        },
                    ]
                    : [],
            },
        };

        const claim = await db.transaction(async (tx) => {
            const [currentPub] = await tx.select()
                .from(publications)
                .where(eq(publications.id, pub.id))
                .for("update");
            if (!currentPub) {
                throw new Error("Publication record disappeared before Zenodo deposit.");
            }
            if (currentPub.zenodoStatus === 'pending' || currentPub.zenodoRecordId) {
                return {
                    claimed: false,
                    status: currentPub.zenodoStatus,
                    recordId: currentPub.zenodoRecordId,
                    zenodoDoi: currentPub.zenodoDoi,
                    recordUrl: currentPub.zenodoRecordUrl,
                };
            }
            await tx.update(publications)
                .set({ zenodoStatus: 'pending' })
                .where(eq(publications.id, pub.id));
            return { claimed: true as const };
        });

        if (!claim.claimed) {
            if (claim.status === 'published' && claim.zenodoDoi) {
                return actionSuccess({
                    zenodoDoi: claim.zenodoDoi,
                    recordUrl: claim.recordUrl || `https://zenodo.org/records/${claim.recordId || claim.zenodoDoi.replace('10.5281/zenodo.', '')}`,
                });
            }
            return actionError(
                `A Zenodo deposit is already ${claim.status}${claim.recordId ? ` for record ${claim.recordId}` : ''}. It was not submitted again; verify its status before retrying.`
            );
        }

        const zenodoHeaders = {
            Authorization: `Bearer ${config.accessToken}`,
            "User-Agent": "IJITEST-Publisher/1.0 (https://ijitest.org; mailto:support@ijitest.org)",
            Accept: "application/json",
        };

        let createRes: Response;
        try {
            createRes = await fetch(`${config.apiUrl}/deposit/depositions`, {
                method: "POST",
                headers: {
                    ...zenodoHeaders,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(depositionPayload),
                signal: AbortSignal.timeout(ZENODO_REQUEST_TIMEOUT_MS),
            });
        } catch (fetchErr: unknown) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
            return actionError(
                `Zenodo did not confirm deposition creation (${msg}). The request may have reached Zenodo; the submission is marked pending to prevent a duplicate. Verify the Zenodo account before retrying.`
            );
        }

        if (!createRes.ok) {
            const errText = await createRes.text();
            await db.update(publications)
                .set({ zenodoStatus: 'failed' })
                .where(eq(publications.id, pub.id));
            if (createRes.status === 403 || errText.includes("<html")) {
                return actionError(
                    "Zenodo blocked this request due to network rate-limiting or anti-bot protection (HTTP 403). " +
                    "Please contact Zenodo support to whitelist this server IP, or manually link the Zenodo DOI using the field below."
                );
            }
            return actionError(`Failed to create Zenodo deposition (${createRes.status}): ${errText}`);
        }

        const deposition = await createRes.json() as {
            id: number;
            links: { bucket: string; html: string };
            metadata?: { prereserve_doi?: { doi?: string } };
        };
        const depositionId = deposition.id;
        const bucketUrl = deposition.links.bucket;

        // Mark Zenodo as pending in DB before the upload/publish steps
        await db.update(publications)
            .set({
                zenodoRecordId: String(depositionId),
                zenodoStatus: 'pending',
            })
            .where(eq(publications.id, pub.id));

        await logSubmissionEvent({
            submissionId,
            eventType: 'zenodo_deposited',
            userId: session.user.id,
            description: `Zenodo deposition created (ID: ${depositionId}). Uploading PDF...`,
            metadata: { depositionId }
        });

        // -----------------------------------------------------------------------
        // Step 2: Upload the published PDF to the Zenodo bucket
        // -----------------------------------------------------------------------
        let pdfBuffer: Buffer;
        try {
            // Use the storage-service client directly — final_pdf_url is a relative
            // /api/files/... path, not an absolute URL, so fetch() cannot be used.
            pdfBuffer = await downloadFileFromStorage(pub.finalPdfUrl);
        } catch (fetchErr: unknown) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
            await db.update(publications)
                .set({ zenodoStatus: 'failed' })
                .where(eq(publications.id, pub.id));
            await logSubmissionEvent({
                submissionId,
                eventType: 'zenodo_failed',
                userId: session.user.id,
                description: `Failed to fetch published PDF for Zenodo upload: ${msg}`,
                metadata: { depositionId }
            });
            return actionError(`Failed to fetch published PDF for Zenodo upload: ${msg}`);
        }

        const fileName = `${paper.paperId}.pdf`;
        let uploadRes: Response;
        try {
            uploadRes = await fetch(`${bucketUrl}/${fileName}`, {
                method: "PUT",
                headers: {
                    ...zenodoHeaders,
                    "Content-Type": "application/octet-stream",
                    "Content-Length": String(pdfBuffer.byteLength),
                },
                // Buffer extends Uint8Array but fetch's BodyInit requires Uint8Array explicitly
                body: new Uint8Array(pdfBuffer),
                signal: AbortSignal.timeout(ZENODO_UPLOAD_TIMEOUT_MS),
            });
        } catch (fetchErr: unknown) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
            return actionError(
                `Zenodo upload did not complete (${msg}). Record ${depositionId} remains pending; verify it before retrying.`
            );
        }

        if (!uploadRes.ok) {
            const errText = await uploadRes.text();
            await db.update(publications)
                .set({ zenodoStatus: 'failed' })
                .where(eq(publications.id, pub.id));
            await logSubmissionEvent({
                submissionId,
                eventType: 'zenodo_failed',
                userId: session.user.id,
                description: `Zenodo PDF upload failed (${uploadRes.status}): ${errText.slice(0, 200)}`,
                metadata: { depositionId }
            });
            if (uploadRes.status === 403 || errText.includes("<html")) {
                return actionError(
                    "Zenodo blocked the PDF upload due to network rate-limiting or anti-bot protection (HTTP 403). " +
                    "Please manually link the Zenodo DOI using the field below."
                );
            }
            return actionError(`Failed to upload PDF to Zenodo (${uploadRes.status}): ${errText.slice(0, 200)}`);
        }

        // -----------------------------------------------------------------------
        // Step 3: Publish the deposition — this registers the DOI with DataCite
        // -----------------------------------------------------------------------
        let publishRes: Response;
        try {
            publishRes = await fetch(
                `${config.apiUrl}/deposit/depositions/${depositionId}/actions/publish`,
                {
                    method: "POST",
                    headers: zenodoHeaders,
                    signal: AbortSignal.timeout(ZENODO_REQUEST_TIMEOUT_MS),
                }
            );
        } catch (fetchErr: unknown) {
            const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
            return actionError(
                `Zenodo did not confirm publication (${msg}). Record ${depositionId} remains pending; verify it before retrying.`
            );
        }

        if (!publishRes.ok) {
            const errText = await publishRes.text();
            await db.update(publications)
                .set({ zenodoStatus: 'failed' })
                .where(eq(publications.id, pub.id));
            await logSubmissionEvent({
                submissionId,
                eventType: 'zenodo_failed',
                userId: session.user.id,
                description: `Zenodo publish action failed (${publishRes.status}): ${errText.slice(0, 200)}`,
                metadata: { depositionId }
            });
            if (publishRes.status === 403 || errText.includes("<html")) {
                return actionError(
                    "Zenodo blocked publication of the deposition (HTTP 403). " +
                    "Please log into Zenodo to publish the record, then link the DOI below."
                );
            }
            return actionError(`Failed to publish Zenodo deposition (${publishRes.status}): ${errText.slice(0, 200)}`);
        }

        // Use the DOI and record_url returned by Zenodo after publication — never fabricate them
        const published = await publishRes.json() as {
            doi: string;
            record_url?: string;
            id: number;
            links?: { record_html?: string };
        };

        const zenodoDoi = published.doi;
        const recordUrl =
            published.record_url ||
            published.links?.record_html ||
            (config.useSandbox
                ? `https://sandbox.zenodo.org/record/${depositionId}`
                : `https://zenodo.org/record/${depositionId}`);

        const shouldSetAsPrimaryDoi = pub.doiProvider !== 'crossref';

        await db.update(publications)
            .set({
                zenodoDoi,
                zenodoRecordId: String(depositionId),
                zenodoStatus: 'published',
                zenodoRecordUrl: recordUrl,
                ...(shouldSetAsPrimaryDoi ? {
                    doi: zenodoDoi,
                    doiProvider: 'zenodo',
                } : {}),
            })
            .where(eq(publications.id, pub.id));

        // Re-brand published PDF with the newly minted Zenodo DOI if primary
        if (shouldSetAsPrimaryDoi && pub.finalPdfUrl) {
            try {
                const subRes = await getSubmissionById(submissionId);
                if (subRes.success && subRes.data) {
                    const latestPdf = subRes.data.allFiles.find(f => f.fileType === 'pdfVersion');
                    if (latestPdf) {
                        const issueRows = await db.select().from(volumesIssues).where(eq(volumesIssues.id, pub.issueId)).limit(1);
                        const issue = issueRows[0];
                        if (issue) {
                            await triggerPdfBranding(latestPdf.fileUrl, pub.finalPdfUrl, {
                                journalName: settings['journalName'] || "International Journal of Innovative Trends in Engineering Science and Technology",
                                journalShortName: settings['journalShortName'] || "IJITEST",
                                volume: issue.volumeNumber,
                                issue: issue.issueNumber,
                                year: issue.year,
                                monthRange: issue.monthRange || "",
                                issn: settings['issnNumber'] || "3139-6887",
                                website: settings['journalWebsite'] || "https://ijitest.org",
                                paperId: submission.paperId,
                                startPage: pub.startPage,
                                endPage: pub.endPage,
                                doi: zenodoDoi,
                                license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
                            });
                        }
                    }
                }
            } catch (brandErr) {
                console.error("Failed to re-brand PDF with Zenodo DOI:", brandErr);
            }
        }

        await logSubmissionEvent({
            submissionId,
            eventType: 'zenodo_published',
            userId: session.user.id,
            description: `Paper published to Zenodo. DOI: ${zenodoDoi}. Record: ${recordUrl}`,
            metadata: { depositionId, zenodoDoi, recordUrl }
        });

        const tags = [
            CACHE_TAGS.SUBMISSION(submissionId),
            CACHE_TAGS.PUBLICATIONS,
            CACHE_TAGS.ARCHIVES,
            CACHE_TAGS.LATEST_ISSUE,
        ];
        if (submission.paperId) {
            tags.push(CACHE_TAGS.PAPER(submission.paperId));
        }
        purgeCacheTags(...tags);

        revalidatePath(`/author/submissions/${submissionId}`);
        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');

        return actionSuccess({
            zenodoDoi,
            recordUrl,
        });

    } catch (error) {
        console.error("depositToZenodo error:", error);
        return serverError(error, "deposit to Zenodo");
    }
}

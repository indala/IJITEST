"use server";
import "server-only";

import { db } from "@/lib/db";
import { submissions, publications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getPaperById } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generateCrossRefXml } from "@/lib/crossref-generator";
import { getCrossrefConfig, getZenodoConfig } from "@/lib/doi-config";
import { isValidDoi, normalizeDoi } from "@/lib/doi-config";
import { logSubmissionEvent } from "@/actions/event-log";
import { downloadFileFromStorage } from "@/lib/fs-utils";
import { revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { updateTag } from "next/cache";
import type { DoiRegistrationStatus } from "@/db/types";


// 1. Crossref Deposit
// ---------------------------------------------------------------------------

/**
 * Live CrossRef Deposit Server Action
 * Generates CrossRef Schema 5.3.1 XML and submits it to CrossRef servlet endpoint.
 * Sets doiRegistrationStatus = 'pending' after a successful queue submission.
 * Crossref processes the XML asynchronously; use submission-log polling to confirm.
 */
export async function depositToCrossref(submissionId: number): Promise<ActionResponse<{
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

        if (!pub.doi) {
            return actionError("Manuscript does not have an assigned DOI.");
        }

        const config = getCrossrefConfig();
        const normalizedDoi = normalizeDoi(pub.doi);
        if (!isValidDoi(normalizedDoi) || !normalizedDoi.toLowerCase().startsWith(`${config.prefix.toLowerCase()}/`)) {
            return actionError(`DOI '${pub.doi}' does not match journal CrossRef prefix '${config.prefix}'. Only official CrossRef DOIs can be deposited.`);
        }

        if (!config.username || !config.password) {
            await db.update(publications)
                .set({ doiRegistrationStatus: 'failed' })
                .where(eq(publications.id, pub.id));

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
        const batchId = `cr-${Date.now()}-${paper.paperId}`;

        // Generate CrossRef XML
        const xml = generateCrossRefXml({
            settings,
            papers: [paper],
            batchId,
        });

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
            });
            responseStatus = res.status;
            responseText = await res.text();
        } catch (fetchErr: unknown) {
            const errMessage = fetchErr instanceof Error ? fetchErr.message : "Network error";
            console.error("[CrossRef Deposit] Network error:", errMessage);

            await db.update(publications)
                .set({
                    doiRegistrationStatus: 'failed',
                    doiRegistrationBatchId: batchId,
                })
                .where(eq(publications.id, pub.id));

            return actionError(`Failed to reach CrossRef deposit endpoint: ${errMessage}`);
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

        // Update DB status to pending — Crossref will process asynchronously
        await db.update(publications)
            .set({
                doiProvider: 'crossref',
                doiRegistrationStatus: 'pending',
                doiRegistrationBatchId: batchId,
            })
            .where(eq(publications.id, pub.id));

        await logSubmissionEvent({
            submissionId,
            eventType: 'doi_deposit_submitted',
            userId: session.user.id,
            description: `CrossRef deposit queued successfully (Batch ID: ${batchId}). Awaiting Crossref processing.`,
            metadata: { batchId, doi: pub.doi, provider: 'crossref' }
        });

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${submissionId}`);
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.PAPER(paper.paperId));

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

        // Build creators list: always include the primary author, then co-authors
        const primaryCreator = {
            name: paper.authorName,
            affiliation: paper.affiliation || undefined,
        };
        const coCreators = paper.coAuthors && paper.coAuthors.length > 0
            ? paper.coAuthors.map((a) => ({
                name: a.name,
                affiliation: a.institution || undefined,
                orcid: a.orcidId || undefined,
            }))
            : [];
        const creators = [primaryCreator, ...coCreators];

        // -----------------------------------------------------------------------
        // Step 1: Create deposition
        // -----------------------------------------------------------------------
        const depositionPayload = {
            metadata: {
                title: paper.title,
                upload_type: "publication",
                publication_type: "article",
                description: paper.abstract,
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
                related_identifiers: pub.doi
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

        const createRes = await fetch(`${config.apiUrl}/deposit/depositions`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(depositionPayload),
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
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
        const uploadRes = await fetch(`${bucketUrl}/${fileName}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${config.accessToken}`,
                "Content-Type": "application/pdf",
                "Content-Length": String(pdfBuffer.byteLength),
            },
            // Buffer extends Uint8Array but fetch's BodyInit requires Uint8Array explicitly
            body: new Uint8Array(pdfBuffer),
        });

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
            return actionError(`Failed to upload PDF to Zenodo (${uploadRes.status}): ${errText.slice(0, 200)}`);
        }

        // -----------------------------------------------------------------------
        // Step 3: Publish the deposition — this registers the DOI with DataCite
        // -----------------------------------------------------------------------
        const publishRes = await fetch(
            `${config.apiUrl}/deposit/depositions/${depositionId}/actions/publish`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${config.accessToken}`,
                },
            }
        );

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

        // Store Zenodo identifiers separately — publications.doi (Crossref) is never touched
        await db.update(publications)
            .set({
                zenodoDoi,
                zenodoRecordId: String(depositionId),
                zenodoStatus: 'published',
                zenodoRecordUrl: recordUrl,
            })
            .where(eq(publications.id, pub.id));

        await logSubmissionEvent({
            submissionId,
            eventType: 'zenodo_published',
            userId: session.user.id,
            description: `Paper published to Zenodo. DOI: ${zenodoDoi}. Record: ${recordUrl}`,
            metadata: { depositionId, zenodoDoi, recordUrl }
        });

        if (submission.paperId) {
            updateTag(CACHE_TAGS.PAPER(submission.paperId));
        }
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.LATEST_ISSUE);

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

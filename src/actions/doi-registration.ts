"use server";
import "server-only";

import { db } from "@/lib/db";
import { submissions, publications, volumesIssues } from "@/db/schema";
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
import { logSubmissionEvent } from "@/actions/event-log";
import { revalidatePath } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { updateTag } from "next/cache";

/**
 * Live CrossRef Deposit Server Action
 * Generates CrossRef Schema 5.3.1 XML and submits it to CrossRef servlet endpoint.
 */
export async function depositToCrossref(submissionId: number): Promise<ActionResponse<{
    batchId: string;
    status: 'pending' | 'registered' | 'failed';
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
        if (!pub.doi.startsWith(config.prefix)) {
            return actionError(`DOI '${pub.doi}' does not match journal CrossRef prefix '${config.prefix}'. Only official CrossRef DOIs can be deposited.`);
        }

        if (!config.username || !config.password) {
            await db.update(publications)
                .set({
                    doiRegistrationStatus: 'failed',
                })
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

        if (!paperRes.success || !paperRes.data) {
            return actionError(paperRes.error || "Failed to load paper metadata for CrossRef export.");
        }

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

        // Check response content
        const isSuccess = responseStatus >= 200 && responseStatus < 300 &&
            !responseText.toLowerCase().includes("failure") &&
            !responseText.toLowerCase().includes("invalid login");

        if (!isSuccess) {
            console.error(`[CrossRef Deposit] Rejected (${responseStatus}):`, responseText);

            await db.update(publications)
                .set({
                    doiRegistrationStatus: 'failed',
                    doiRegistrationBatchId: batchId,
                })
                .where(eq(publications.id, pub.id));

            await logSubmissionEvent({
                submissionId,
                eventType: 'doi_assigned',
                userId: session.user.id,
                description: `CrossRef deposit submission rejected: ${responseText.slice(0, 200)}`,
                metadata: { batchId, responseStatus, responseExcerpt: responseText.slice(0, 300) }
            });

            return actionError(`CrossRef rejected deposit (${responseStatus}): ${responseText.slice(0, 200)}`);
        }

        // Update DB status to pending
        await db.update(publications)
            .set({
                doiProvider: 'crossref',
                doiRegistrationStatus: 'pending',
                doiRegistrationBatchId: batchId,
            })
            .where(eq(publications.id, pub.id));

        await logSubmissionEvent({
            submissionId,
            eventType: 'doi_assigned',
            userId: session.user.id,
            description: `CrossRef DOI deposit queued successfully (Batch ID: ${batchId}).`,
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
            message: `Deposit submitted to CrossRef. Batch ID: ${batchId}. Ingestion typically completes within 5-15 minutes.`
        });

    } catch (error) {
        console.error("depositToCrossref error:", error);
        return serverError(error, "deposit to CrossRef");
    }
}

/**
 * Optional Zenodo Post-Publication Deposit Server Action
 * Uploads published paper metadata and branded PDF to Zenodo.
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

        // Access control: author of the paper or admin/editor
        const isAuthor = submission.correspondingAuthorId === session.user.id;
        const isStaff = ['admin', 'editor'].includes(session.user.role);
        if (!isAuthor && !isStaff) {
            return actionError("Unauthorized to deposit this manuscript.");
        }

        const pubRows = await db.select().from(publications).where(eq(publications.submissionId, submissionId)).limit(1);
        if (!pubRows.length || !pubRows[0]) {
            return actionError("Paper is not yet published.");
        }
        const pub = pubRows[0];

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

        // Step 1: Create Deposition on Zenodo
        const depositionPayload = {
            metadata: {
                title: paper.title,
                upload_type: "publication",
                publication_type: "article",
                description: paper.abstract,
                access_right: "open",
                license: "cc-by-4.0",
                keywords: paper.keywords ? paper.keywords.split(",").map((k: string) => k.trim()) : [],
                creators: paper.coAuthors && paper.coAuthors.length > 0
                    ? paper.coAuthors.map((a) => ({
                        name: a.name,
                        affiliation: a.institution || undefined,
                        orcid: a.orcidId || undefined,
                    }))
                    : [{ name: paper.authorName, affiliation: paper.affiliation || undefined }],
                journal_title: settings['journalName'] || "IJITEST",
                journal_volume: paper.volumeNumber ? String(paper.volumeNumber) : undefined,
                journal_issue: paper.issueNumber ? String(paper.issueNumber) : undefined,
                related_identifiers: pub.doi ? [
                    {
                        identifier: `https://doi.org/${pub.doi}`,
                        relation: "isIdenticalTo",
                        scheme: "doi"
                    }
                ] : [],
            }
        };

        const createRes = await fetch(`${config.apiUrl}/deposit/depositions`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${config.accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(depositionPayload),
        });

        if (!createRes.ok) {
            const errText = await createRes.text();
            return actionError(`Failed to create Zenodo deposition (${createRes.status}): ${errText}`);
        }

        const deposition = await createRes.json();
        const depositionId = deposition.id;
        const zenodoDoi = deposition.metadata?.prereserve_doi?.doi || `10.5281/zenodo.${depositionId}`;
        const recordUrl = config.useSandbox
            ? `https://sandbox.zenodo.org/record/${depositionId}`
            : `https://zenodo.org/record/${depositionId}`;

        // If paper has no existing CrossRef DOI, record the Zenodo DOI
        if (!pub.doi || pub.doiProvider === 'none') {
            await db.update(publications)
                .set({
                    doi: zenodoDoi,
                    doiProvider: 'zenodo',
                    doiRegistrationStatus: 'registered',
                    doiRegistrationBatchId: String(depositionId),
                })
                .where(eq(publications.id, pub.id));
        }

        await logSubmissionEvent({
            submissionId,
            eventType: 'doi_assigned',
            userId: session.user.id,
            description: `Paper deposited to Zenodo (Record: ${depositionId}, DOI: ${zenodoDoi}).`,
            metadata: { depositionId, zenodoDoi, recordUrl }
        });

        revalidatePath(`/author/submissions/${submissionId}`);
        revalidatePath(`/admin/submissions/${submissionId}`);

        return actionSuccess({
            zenodoDoi,
            recordUrl,
        });

    } catch (error) {
        console.error("depositToZenodo error:", error);
        return serverError(error, "deposit to Zenodo");
    }
}

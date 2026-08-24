"use server";
import "server-only"

import { db } from "@/lib/db";
import {
    submissions,
    volumesIssues,
    publications,
    submissionVersions
} from "@/db/schema";
import {
    type ActionResponse,
    type Issue,
    actionSuccess,
    actionError,
    type PaperWithPublication,
    serverError
} from "@/db/types";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { getSettingsData } from "./settings";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { downloadFileFromStorage, triggerPdfBranding } from "@/lib/fs-utils";
import { getSubmissionById } from "./submissions";
import { createNotification } from "./notifications";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";
import { submitToIndexNow } from "@/lib/indexnow";


/**
 * Create a new volume/issue
 */
export async function createVolumeIssue(formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
        return actionError("Unauthorized");
    }

    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    if (isNaN(volume) || isNaN(issue) || isNaN(year)) {
        return actionError("Volume, Issue, and Year must be valid numbers");
    }

    try {
        // 1. Check for duplicates
        const existing = await db.select().from(volumesIssues).where(and(
            eq(volumesIssues.volumeNumber, volume),
            eq(volumesIssues.issueNumber, issue),
            eq(volumesIssues.year, year)
        )).limit(1);

        if (existing.length > 0) {
            return actionError("Volume/Issue already exists for this year.");
        }

        await db.insert(volumesIssues).values({
            volumeNumber: volume,
            issueNumber: issue,
            year: year,
            monthRange: monthRange,
            status: 'open'
        });
        revalidatePath('/admin/publications');
        revalidatePath('/', 'layout');
        cacheLogger.invalidation(CACHE_TAGS.PUBLICATIONS, "createVolumeIssue");
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        return actionSuccess();
    } catch (error) {
        console.error("Create Publication Error:", error);
        return serverError(error, "create publication");
    }
}

/**
 * Fetch all volumes and issues with paper counts
 */
export async function getVolumesIssues(): Promise<ActionResponse<(Issue & { paperCount: number })[]>> {
    'use cache'
    cacheLife('hours')
    cacheTag(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.PUBLIC_DATA)

    try {
        cacheLogger.miss(CACHE_TAGS.PUBLICATIONS, "getVolumesIssues");
        const rows = await db.select({
            vi: volumesIssues,
            paperCount: count(submissions.id)
        })
            .from(volumesIssues)
            .leftJoin(submissions, eq(submissions.issueId, volumesIssues.id))
            .groupBy(volumesIssues.id)
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber));

        const data = rows.map(r => ({
            ...r.vi,
            paperCount: r.paperCount
        }));
        return actionSuccess(data);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.PUBLICATIONS, error);
        return serverError<(Issue & { paperCount: number })[]>(error, "fetch issues");
    }
}

/**
 * Get the latest published issue
 */
export async function getLatestPublishedIssue(): Promise<ActionResponse<Issue>> {
    'use cache'
    cacheLife('hours')
    cacheTag(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.LATEST_ISSUE, CACHE_TAGS.PUBLIC_DATA)

    try {
        cacheLogger.miss(CACHE_TAGS.PUBLICATIONS, "getLatestPublishedIssue");
        const rows = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);
        if (!rows[0]) return actionError<Issue>("No published issues found");
        return actionSuccess(rows[0]);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.PUBLICATIONS, error);
        return serverError<Issue>(error, "fetch issue");
    }
}

/**
 * Assign a paper to an issue, brand its PDF, and update its status to 'published'
 */
export async function assignPaperToIssue(submissionId: number, issueId: number, startPage?: number, endPage?: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        // 1. Fetch Composite Submission Details OUTSIDE transaction
        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success || !subRes.data) {
            return actionError(subRes.error || "Submission not found");
        }
        const submission = subRes.data;

        // 2. Enforce status gate — only accepted/published papers can be assigned
        const allowedStatuses = ['accepted', 'published'];
        if (!allowedStatuses.includes(submission.status)) {
            return actionError(`Paper status is '${submission.status}'. Only accepted papers can be published.`);
        }

        const latestPdf = submission.allFiles.find(f => f.fileType === 'pdfVersion');
        if (!latestPdf) {
            return actionError("Final styled PDF must be uploaded before publication.");
        }

        // 3. Fetch Issue Details
        const issueRows = await db.select().from(volumesIssues).where(eq(volumesIssues.id, issueId)).limit(1);
        const issue = issueRows[0];
        if (!issue) return actionError("Issue not found");

        const settings = await getSettingsData();

        // 4. Auto-Page Numbering Logic (outside transaction)
        let finalStartPage = startPage;
        let finalEndPage = endPage;

        if (finalStartPage === undefined || finalEndPage === undefined) {
            const [maxPageRow] = await db.select({
                lastPage: sql<number>`MAX(${publications.endPage})`
            }).from(publications).where(eq(publications.issueId, issueId));

            const lastPage = maxPageRow?.lastPage || 0;
            if (finalStartPage === undefined) finalStartPage = lastPage + 1;
            const startNum = finalStartPage as number;
            if (finalEndPage === undefined) {
                try {
                    const pdfBytes = await downloadFileFromStorage(latestPdf.fileUrl);
                    const { PDFDocument } = await import('pdf-lib');
                    const pdfDoc = await PDFDocument.load(pdfBytes);
                    finalEndPage = startNum + pdfDoc.getPageCount() - 1;
                } catch (pdfErr) {
                    console.error("Failed to read PDF for page count:", pdfErr);
                    finalEndPage = startNum;
                }
            }
        }
        const confirmedStartPage = finalStartPage as number;
        const confirmedEndPage = finalEndPage as number;

        // 5. Generate Branded PDF OUTSIDE transaction (IO operation)
        const brandedFileName = `${submission.paperId}-published.pdf`;
        const brandedRelativePath = `/api/files/published/${brandedFileName}`;
        const cleanInput = latestPdf.fileUrl;

        const doiPrefix = settings['doiPrefix'] ? settings['doiPrefix'].trim() : "";
        const generatedDoi = doiPrefix.startsWith("10.") ? `${doiPrefix}/${submission.paperId}` : null;

        await triggerPdfBranding(cleanInput, brandedRelativePath, {
            journalName: settings['journalName'] || "IJITEST",
            journalShortName: "IJITEST",
            volume: issue.volumeNumber,
            issue: issue.issueNumber,
            year: issue.year,
            monthRange: issue.monthRange || "",
            issn: settings['issnNumber'] || "XXXX-XXXX",
            website: settings['journalWebsite'] || "https://ijitest.org",
            paperId: submission.paperId,
            startPage: confirmedStartPage,
            endPage: confirmedEndPage,
            doi: generatedDoi,
            license: "Creative Commons Attribution 4.0 International (CC BY 4.0)"
        });

        // 6. Database transaction — only pure DB ops
        await db.transaction(async (tx) => {
            await tx.insert(publications).values({
                submissionId,
                issueId,
                finalPdfUrl: brandedRelativePath,
                startPage: confirmedStartPage,
                endPage: confirmedEndPage,
                doi: generatedDoi,
                publishedAt: new Date()
            }).onDuplicateKeyUpdate({
                set: {
                    issueId,
                    finalPdfUrl: brandedRelativePath,
                    startPage: confirmedStartPage,
                    endPage: confirmedEndPage,
                    doi: generatedDoi,
                    publishedAt: new Date()
                }
            });

            await tx.update(submissions)
                .set({ status: 'published', issueId })
                .where(eq(submissions.id, submissionId));
        });

        // 7. Email notification AFTER transaction (fire-and-forget)
        const template = emailTemplates.manuscriptPublished(
            submission.authorName,
            submission.title,
            submission.paperId,
            issue.volumeNumber,
            issue.issueNumber,
            issue.year
        );
        sendEmail({ to: submission.authorEmail, subject: template.subject, html: template.html })
            .catch(e => console.error("Publication email failed:", e));

        // In-app Panel Notification
        createNotification({
            userId: submission.correspondingAuthorId,
            createdByUserId: session.user.id,
            type: "paper_published",
            priority: "high",
            message: `Congratulations! Your manuscript ${submission.paperId} has been successfully published in Vol ${issue.volumeNumber}, Issue ${issue.issueNumber}.`,
            actionLink: `/article/${submission.paperId}`,
            metadata: { submissionId, paperId: submission.paperId }
        }).catch(e => console.error("In-app publication notification failed:", e));

        // 8. IndexNow notification AFTER transaction (fire-and-forget)
        const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');
        const paperUrl = `${baseUrl}/current-issue/volume${issue.volumeNumber}/issue${issue.issueNumber}/${submission.paperId}`;
        submitToIndexNow([paperUrl])
            .catch((e: unknown) => console.error("IndexNow submission failed:", e));

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/', 'layout');
        cacheLogger.invalidation(CACHE_TAGS.PUBLICATIONS, `assignPaperToIssue ${submissionId}`);
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        if (submission?.paperId) {
            updateTag(CACHE_TAGS.PAPER(submission.paperId));
        }
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        updateTag(CACHE_TAGS.LATEST_ISSUE);
        return actionSuccess();
    } catch (error) {
        console.error("Assign Paper Error:", error);
        return serverError(error, "assign paper to issue");
    }
}



/**
 * Publish an entire issue
 */
export async function publishIssue(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        // 1. Fetch the previous latest published issue before publishing the new one
        const prevLatestIssueRows = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);
        const prevLatestIssue = prevLatestIssueRows[0];

        // 2. Publish the new issue
        await db.update(volumesIssues)
            .set({ status: 'published' })
            .where(eq(volumesIssues.id, id));

        // 3. Fetch papers for the newly published issue
        const issuePapers = await db.select({
            id: submissions.id,
            paperId: submissions.paperId
        })
            .from(submissions)
            .where(eq(submissions.issueId, id));

        const issueRows = await db.select().from(volumesIssues).where(eq(volumesIssues.id, id)).limit(1);
        const issue = issueRows[0];

        const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');
        const urlsToSubmit: string[] = [];

        // Add newly published issue papers (now in current-issue)
        if (issue && issuePapers.length > 0) {
            issuePapers.forEach(paper => {
                urlsToSubmit.push(`${baseUrl}/current-issue/volume${issue.volumeNumber}/issue${issue.issueNumber}/${paper.paperId}`);
            });
        }

        // 4. Fetch papers for the previous latest issue (which are now archived)
        if (prevLatestIssue && prevLatestIssue.id !== id) {
            const prevIssuePapers = await db.select({
                paperId: submissions.paperId
            })
                .from(submissions)
                .where(eq(submissions.issueId, prevLatestIssue.id));

            if (prevIssuePapers.length > 0) {
                prevIssuePapers.forEach(paper => {
                    urlsToSubmit.push(`${baseUrl}/archives/volume${prevLatestIssue.volumeNumber}/issue${prevLatestIssue.issueNumber}/${paper.paperId}`);
                });
            }
        }

        // 5. Submit all updated URLs to IndexNow (Bing, Yandex, Naver)
        if (urlsToSubmit.length > 0) {
            submitToIndexNow(urlsToSubmit)
                .catch((e: unknown) => console.error("IndexNow batch submission failed:", e));
        }

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/', 'layout');
        issuePapers.forEach(paper => {
            if (paper?.id) updateTag(CACHE_TAGS.SUBMISSION(paper.id));
            if (paper?.paperId) updateTag(CACHE_TAGS.PAPER(paper.paperId));
        });
        updateTag(CACHE_TAGS.SUBMISSIONS);
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        updateTag(CACHE_TAGS.LATEST_ISSUE);
        return actionSuccess();
    } catch (error) {
        console.error("Publish Issue Error:", error);
        return serverError(error, "publish issue");
    }
}

/**
 * Get papers assigned to a specific issue
 */
export async function getPapersByIssueId(issueId: number): Promise<ActionResponse<PaperWithPublication[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        // Return structured data for the issue listing
        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
            .from(submissionVersions)
            .groupBy(submissionVersions.submissionId)
            .as('lv');

        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            publication: publications,
            latestVersion: submissionVersions
        })
            .from(submissions)
            .where(eq(submissions.issueId, issueId))
            .leftJoin(publications, eq(submissions.id, publications.submissionId))
            .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
            .leftJoin(submissionVersions, and(
                eq(submissions.id, submissionVersions.submissionId),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion)
            ));

        const data = rows.map(r => ({
            id: r.id,
            paperId: r.paperId,
            title: r.latestVersion?.title || "Untitled",
            status: r.status,
            publication: r.publication
        }));

        return actionSuccess(data);
    } catch (error) {
        console.error("Get Papers By Issue Error:", error);
        return serverError<PaperWithPublication[]>(error, "fetch papers for issue");
    }
}

/**
 * Unassign a paper from an issue
 */
export async function unassignPaperFromIssue(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        await db.transaction(async (tx) => {
            await tx.delete(publications).where(eq(publications.submissionId, submissionId));
            await tx.update(submissions)
                .set({ issueId: null, status: 'accepted' })
                .where(eq(submissions.id, submissionId));
        });

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/', 'layout');
        cacheLogger.invalidation(CACHE_TAGS.PUBLICATIONS, `unassignPaperFromIssue ${submissionId}`);
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        updateTag(CACHE_TAGS.LATEST_ISSUE);
        return actionSuccess();
    } catch (error) {
        return serverError(error, "unassign paper from issue");
    }
}

/**
 * Update an existing volume/issue
 */
export async function updateVolumeIssue(id: number, formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        const volume = parseInt(formData.get('volume') as string);
        const issue = parseInt(formData.get('issue') as string);
        const year = parseInt(formData.get('year') as string);
        const monthRange = formData.get('monthRange') as string;

        if (isNaN(volume) || isNaN(issue) || isNaN(year)) {
            return actionError("Volume, Issue, and Year must be valid numbers");
        }

        await db.update(volumesIssues)
            .set({
                volumeNumber: volume,
                issueNumber: issue,
                year: year,
                monthRange: monthRange
            })
            .where(eq(volumesIssues.id, id));

        revalidatePath('/admin/publications');
        cacheLogger.invalidation(CACHE_TAGS.PUBLICATIONS, `updateVolumeIssue ${id}`);
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        return actionSuccess();
    } catch (error) {
        console.error("Update Publication Error:", error);
        return serverError(error, "update publication");
    }
}

/**
 * Delete a volume/issue (unassigns papers first)
 */
export async function deleteVolumeIssue(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Admin access required.");
        }

        await db.transaction(async (tx) => {
            // 1. Unassign all papers
            await tx.delete(publications).where(eq(publications.issueId, id));
            await tx.update(submissions)
                .set({ issueId: null, status: 'accepted' })
                .where(eq(submissions.issueId, id));

            // 2. Delete issue
            await tx.delete(volumesIssues).where(eq(volumesIssues.id, id));
        });

        return actionSuccess();
    } catch (error) {
        return serverError(error, "delete publication");
    } finally {
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        cacheLogger.invalidation(CACHE_TAGS.PUBLICATIONS, `deleteVolumeIssue ${id}`);
        updateTag(CACHE_TAGS.SUBMISSIONS);
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        updateTag(CACHE_TAGS.LATEST_ISSUE);
    }
}

/**
 * Increment view count for a published paper
 */
export async function incrementPaperViews(submissionId: number): Promise<ActionResponse> {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
        const limit = await checkRateLimit({
            key: `pub:views:${ip}:${submissionId}`,
            max: 5,
            windowMs: 60 * 1000
        });
        if (!limit.allowed) {
            return actionError("Too many view requests");
        }

        await db.update(publications)
            .set({ views: sql`views + 1` })
            .where(eq(publications.submissionId, submissionId));
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        return actionSuccess();
    } catch (error) {
        console.error("Increment Views Error:", error);
        return actionError("Failed to increment views");
    }
}

/**
 * Increment download count for a published paper
 */
export async function incrementPaperDownloads(submissionId: number): Promise<ActionResponse> {
    try {
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "127.0.0.1";
        const limit = await checkRateLimit({
            key: `pub:downloads:${ip}:${submissionId}`,
            max: 5,
            windowMs: 60 * 1000
        });
        if (!limit.allowed) {
            return actionError("Too many download requests");
        }

        await db.update(publications)
            .set({ downloads: sql`downloads + 1` })
            .where(eq(publications.submissionId, submissionId));
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        return actionSuccess();
    } catch (error) {
        console.error("Increment Downloads Error:", error);
        return actionError("Failed to increment downloads");
    }
}

/**
 * Re-runs the PDF branding for an already published paper using the latest settings.
 */
export async function rebrandPaperPdf(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        // 1. Fetch Publication & Issue Details
        const pubRows = await db.select({
            pub: publications,
            sub: submissions,
            issue: volumesIssues
        })
            .from(publications)
            .innerJoin(submissions, eq(publications.submissionId, submissions.id))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .where(eq(publications.submissionId, submissionId))
            .limit(1);

        const row = pubRows[0];
        if (!row) return actionError("Publication not found or not published yet.");
        const { pub, sub, issue } = row;

        // 2. Fetch Latest Versions of this submission to get the original unbranded pdf
        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success || !subRes.data) {
            return actionError(subRes.error || "Submission details not found");
        }
        const submission = subRes.data;

        const latestPdf = submission.allFiles.find(f => f.fileType === 'pdfVersion');
        if (!latestPdf) {
            return actionError("Original styled PDF is missing from the submission version records.");
        }

        const settings = await getSettingsData();
        const cleanInput = latestPdf.fileUrl;
        const brandedRelativePath = pub.finalPdfUrl; // Reuse the existing published URL path

        // 3. Trigger branding again on NestJS backend
        await triggerPdfBranding(cleanInput, brandedRelativePath, {
            journalName: settings['journalName'] || "IJITEST",
            journalShortName: "IJITEST",
            volume: issue.volumeNumber,
            issue: issue.issueNumber,
            year: issue.year,
            monthRange: issue.monthRange || "",
            issn: settings['issnNumber'] || "XXXX-XXXX",
            website: settings['journalWebsite'] || "https://ijitest.org",
            paperId: sub.paperId,
            startPage: pub.startPage,
            endPage: pub.endPage,
            doi: pub.doi,
            license: "Creative Commons Attribution 4.0 International (CC BY 4.0)"
        });

        // 4. Update the published date/time in the db or just revalidate
        await db.update(publications)
            .set({ publishedAt: new Date() })
            .where(eq(publications.submissionId, submissionId));

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath('/admin/submissions');
        revalidatePath('/archives');
        revalidatePath('/', 'layout');
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(submissionId), `rebrandPaperPdf ${submissionId}`);
        
        if (sub.paperId) {
            updateTag(CACHE_TAGS.PAPER(sub.paperId));
        }

        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        if (sub?.paperId) {
            updateTag(CACHE_TAGS.PAPER(sub.paperId));
        }
        updateTag(CACHE_TAGS.PUBLICATIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        updateTag(CACHE_TAGS.PUBLIC_DATA);
        updateTag(CACHE_TAGS.LATEST_ISSUE);

        return actionSuccess();
    } catch (error) {
        console.error("Re-brand Paper Error:", error);
        return serverError(error, "re-brand paper");
    }
}


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
    type PaperWithPublication
} from "@/db/types";
import { eq, and, sql, desc, count } from "drizzle-orm";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { getSettingsData } from "./settings";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { downloadFileFromStorage } from "@/lib/fs-utils";
import { brandPdf } from "@/lib/pdf-branding";
import { getSubmissionById } from "./submissions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";


/**
 * Create a new volume/issue
 */
export async function createVolumeIssue(formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
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
        updateTag('publications');
        updateTag('public-data');
        return actionSuccess();
    } catch (error) {
        console.error("Create Publication Error:", error);
        return actionError("Failed to create publication: " + (error instanceof Error ? error.message : String(error)));
    }
}

/**
 * Fetch all volumes and issues with paper counts
 */
export async function getVolumesIssues(): Promise<ActionResponse<(Issue & { paperCount: number })[]>> {
    'use cache'
    cacheLife('hours')
    cacheTag('publications', 'public-data')

    try {
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
        console.error("Get Publications Error:", error);
        return actionError<(Issue & { paperCount: number })[]>(error instanceof Error ? error.message : String(error));
    }
}

/**
 * Get the latest published issue
 */
export async function getLatestPublishedIssue(): Promise<ActionResponse<Issue>> {
    'use cache'
    cacheLife('hours')
    cacheTag('publications', 'latest-issue', 'public-data')

    try {
        const rows = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);
        if (!rows[0]) return actionError<Issue>("No published issues found");
        return actionSuccess(rows[0]);
    } catch (error) {
        console.error("Get Latest Published Issue Error:", error);
        return actionError<Issue>(error instanceof Error ? error.message : String(error));
    }
}

/**
 * Assign a paper to an issue, brand its PDF, and update its status to 'published'
 */
export async function assignPaperToIssue(submissionId: number, issueId: number, startPage?: number, endPage?: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
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

        await brandPdf(cleanInput, brandedRelativePath, {
            journalName: settings['journalName'] || "IJITEST",
            journalShortName: "IJITEST",
            volume: issue.volumeNumber,
            issue: issue.issueNumber,
            year: issue.year,
            monthRange: issue.monthRange || "",
            issn: settings['issnNumber'] || "XXXX-XXXX",
            website: settings['journalWebsite'] || "https://www.ijitest.org",
            paperId: submission.paperId,
            startPage: confirmedStartPage,
            endPage: confirmedEndPage
        });

        // 6. Database transaction — only pure DB ops
        await db.transaction(async (tx) => {
            await tx.insert(publications).values({
                submissionId,
                issueId,
                finalPdfUrl: brandedRelativePath,
                startPage: confirmedStartPage,
                endPage: confirmedEndPage,
                publishedAt: new Date()
            }).onDuplicateKeyUpdate({
                set: {
                    issueId,
                    finalPdfUrl: brandedRelativePath,
                    startPage: confirmedStartPage,
                    endPage: confirmedEndPage,
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

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/', 'layout');
        updateTag('publications');
        updateTag('archives');
        updateTag('public-data');
        updateTag('latest-issue');
        return actionSuccess();
    } catch (error) {
        console.error("Assign Paper Error:", error);
        return actionError("Failed to assign paper: " + (error instanceof Error ? error.message : String(error)));
    }
}



/**
 * Publish an entire issue
 */
export async function publishIssue(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized");
        }

        await db.update(volumesIssues)
            .set({ status: 'published' })
            .where(eq(volumesIssues.id, id));

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
        revalidatePath('/', 'layout');
        updateTag('publications');
        updateTag('archives');
        updateTag('public-data');
        updateTag('latest-issue');
        return actionSuccess();
    } catch (error) {
        console.error("Publish Issue Error:", error);
        return actionError("Failed to publish issue: " + (error instanceof Error ? error.message : String(error)));
    }
}

/**
 * Get papers assigned to a specific issue
 */
export async function getPapersByIssueId(issueId: number): Promise<ActionResponse<PaperWithPublication[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
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
        return actionError<PaperWithPublication[]>(error instanceof Error ? error.message : String(error));
    }
}

/**
 * Unassign a paper from an issue
 */
export async function unassignPaperFromIssue(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
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
        updateTag('publications');
        updateTag('archives');
        updateTag('public-data');
        updateTag('latest-issue');
        return actionSuccess();
    } catch (error) {
        return actionError("Failed to unassign paper: " + (error instanceof Error ? error.message : String(error)));
    }
}

/**
 * Update an existing volume/issue
 */
export async function updateVolumeIssue(id: number, formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
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
        updateTag('publications');
        updateTag('public-data');
        return actionSuccess();
    } catch (error) {
        console.error("Update Publication Error:", error);
        return actionError("Failed to update: " + (error instanceof Error ? error.message : String(error)));
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
        return actionError("Failed to delete: " + (error instanceof Error ? error.message : String(error)));
    } finally {
        revalidatePath('/admin/publications');
        updateTag('publications');
        updateTag('archives');
        updateTag('public-data');
        updateTag('latest-issue');
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
        return actionSuccess();
    } catch (error) {
        console.error("Increment Downloads Error:", error);
        return actionError("Failed to increment downloads");
    }
}

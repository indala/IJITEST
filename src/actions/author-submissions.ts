"use server";
import "server-only"

import { and, eq, sql, desc, inArray, notInArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { 
    submissions, 
    submissionVersions, 
    submissionFiles, 
    submissionAuthors, 
    publications, 
    volumesIssues, 
    payments, 
    users, 
    userProfiles,
    reviews,
    reviewAssignments,
    submissionEditors
} from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { invalidateSubmittedSubmissionsCount, invalidateAuthorActionsCount } from "./notifications";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { 
    type ActionResponse, 
    type AuthorDashboardSubmission, 
    type AuthorSubmissionDetail,
    actionSuccess,
    actionError
} from "@/db/types";
import { safeDeleteFile, uploadFileToStorage } from "@/lib/fs-utils";

/**
 * Utility to get the current authenticated author.
 */
async function getAuthorSession() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== 'author') return null;
    return session.user;
}

/**
 * Fetch all submissions belonging to the logged-in author.
 * Includes joined data for current title, publication info, and payment status.
 */
export async function getAuthorDashboard(): Promise<ActionResponse<{ submissions: AuthorDashboardSubmission[] }>> {
    try {
        const author = await getAuthorSession();
        if (!author) return actionError<{ submissions: AuthorDashboardSubmission[] }>("Unauthorized");

        // Unified query using JOINS to avoid multiple calls and raw SQL issues
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
            submittedAt: submissions.submittedAt,
            updatedAt: submissions.updatedAt,
            title: submissionVersions.title,
            paymentStatus: payments.status,
            paymentAmount: payments.amount,
            finalPdfUrl: publications.finalPdfUrl,
            volumeNumber: volumesIssues.volumeNumber,
            issueNumber: volumesIssues.issueNumber,
            issueYear: volumesIssues.year,
            views: publications.views,
            downloads: publications.downloads,
            citations: publications.citations
        })
        .from(submissions)
        .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion)
        ))
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
        .where(eq(submissions.correspondingAuthorId, author.id))
        .orderBy(desc(submissions.submittedAt));

        return actionSuccess({ submissions: rows as AuthorDashboardSubmission[] });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Author Dashboard Error:", error);
        return actionError<{ submissions: AuthorDashboardSubmission[] }>("Failed to load dashboard: " + message);
    }
}

/**
 * Fetch detailed view of a single submission for the author.
 */
export async function getAuthorSubmission(submissionId: number): Promise<ActionResponse<AuthorSubmissionDetail>> {
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized" };

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as('lv');

        // 1. Core Metadata
        const subData = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            updatedAt: submissions.updatedAt,
            versionId: submissionVersions.id,
            versionNumber: submissionVersions.versionNumber,
            title: submissionVersions.title,
            abstract: submissionVersions.abstract,
            keywords: submissionVersions.keywords,
            changelog: submissionVersions.changelog
        })
        .from(submissions)
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .innerJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion)
        ))
        .where(and(
            eq(submissions.id, submissionId),
            eq(submissions.correspondingAuthorId, author.id)
        ))
        .limit(1);

        if (!subData.length) return actionError<AuthorSubmissionDetail>("Submission not found");
        const sub = subData[0];
        if (!sub) return actionError<AuthorSubmissionDetail>("Submission not found");

        // 2-5. Parallel fetch: files, authors, payment, publication, reviews (all independent)
        const [files, authorsList, paymentData, publicationData, completedReviews] = await Promise.all([
            db.select()
                .from(submissionFiles)
                .where(and(
                    eq(submissionFiles.versionId, sub.versionId),
                    inArray(submissionFiles.fileType, ['mainManuscript', 'copyrightForm'])
                )),
            db.select()
                .from(submissionAuthors)
                .where(eq(submissionAuthors.submissionId, submissionId))
                .orderBy(submissionAuthors.orderIndex),
            db.select()
                .from(payments)
                .where(eq(payments.submissionId, submissionId))
                .limit(1),
            db.select({
                finalPdfUrl: publications.finalPdfUrl,
                doi: publications.doi,
                publishedAt: publications.publishedAt,
                volumeNumber: volumesIssues.volumeNumber,
                issueNumber: volumesIssues.issueNumber,
                year: volumesIssues.year
            })
                .from(publications)
                .leftJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
                .where(eq(publications.submissionId, submissionId))
                .limit(1),
            db.select({
                commentsToAuthor: reviews.commentsToAuthor,
                decision: reviews.decision,
                submittedAt: reviews.submittedAt,
                reviewRound: reviewAssignments.reviewRound,
                deadline: reviewAssignments.deadline
            })
                .from(reviews)
                .innerJoin(reviewAssignments, eq(reviews.assignmentId, reviewAssignments.id))
                .where(and(
                    eq(reviewAssignments.submissionId, submissionId),
                    eq(reviewAssignments.status, 'completed'),
                    sql`${reviews.commentsToAuthor} IS NOT NULL`
                )),
        ]);

        return actionSuccess({
            ...sub,
            files,
            authors: authorsList,
            reviewComments: completedReviews,
            payment: paymentData[0] || null,
            publication: publicationData[0] || null
        } as AuthorSubmissionDetail);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Author Submission Error:", error);
        return actionError<AuthorSubmissionDetail>("Failed to fetch submission details: " + message);
    }
}

/**
 * Check if the paper is eligible for resubmission (Window: 15 days).
 */
export async function checkResubmissionEligibility(submissionId: number): Promise<ActionResponse<{ eligible: boolean; daysRemaining: number }>> {
    try {
        const author = await getAuthorSession();
        if (!author) return actionError<{ eligible: boolean; daysRemaining: number }>("Unauthorized");

        const rows = await db.select({
            id: submissions.id,
            status: submissions.status,
            updatedAt: submissions.updatedAt,
            correspondingAuthorId: submissions.correspondingAuthorId
        })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

        if (!rows.length) return actionError<{ eligible: boolean; daysRemaining: number }>("Submission not found");
        const sub = rows[0];
        if (!sub) return actionError<{ eligible: boolean; daysRemaining: number }>("Submission not found");
        if (sub.correspondingAuthorId !== author.id) return actionError<{ eligible: boolean; daysRemaining: number }>("Unauthorized access");

        if (!['revisionRequested', 'rejected'].includes(sub.status)) {
            return actionError<{ eligible: boolean; daysRemaining: number }>(`Manuscript status '${sub.status}' does not allow resubmission.`);
        }

        const updatedAt = new Date(sub.updatedAt || new Date());
        const daysSinceUpdate = Math.floor((Date.now() - updatedAt.getTime()) / (1000 * 60 * 60 * 24));
        const daysRemaining = 15 - daysSinceUpdate;
        const eligible = daysRemaining >= 0;

        return actionSuccess({ eligible, daysRemaining });
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return actionError<{ eligible: boolean; daysRemaining: number }>(message);
    }
}

/**
 * Handle revised manuscript resubmission.
 * Transactional DB-first logic as per requirements.
 */
export async function resubmitPaper(submissionId: number, formData: FormData): Promise<ActionResponse> {
    const fileCleanup: string[] = [];
    try {
        const author = await getAuthorSession();
        if (!author) return { success: false, error: "Unauthorized" };

        const eligibility = await checkResubmissionEligibility(submissionId);
        if (!eligibility.success) {
            return actionError(eligibility.error);
        }
        if (!eligibility.data.eligible) {
            return actionError("Resubmission window expired or ineligible status.");
        }

        const manuscriptFile = formData.get("manuscript") as File;
        const changelog = formData.get("changelog") as string;

        if (!manuscriptFile || manuscriptFile.size === 0) return { success: false, error: "Revised manuscript is required." };

        // Enforce .docx only policy (same as original submission)
        const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isDocx = (f: File) => f.name.toLowerCase().endsWith(".docx") || f.type === docxMime;
        if (!isDocx(manuscriptFile)) return { success: false, error: "Strict Policy: Only .docx files are accepted for the revised manuscript." };

        // 1. DATABASE TRANSACTION (RECORD COMMIT)
        const result = await db.transaction(async (tx) => {
            // A. Get Latest Version to find current metadata
            const versionsArr = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);
            
            if (!versionsArr.length) throw new Error("Original version records not found.");
            const latest = versionsArr[0];
            if (!latest) throw new Error("Original version records not found.");
            const nextVersion = latest.versionNumber + 1;

            // B. Create New Version Record
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: nextVersion,
                title: latest.title,
                abstract: latest.abstract,
                keywords: latest.keywords,
                changelog: changelog || "Revised version submission",
            });
            const verId = versionInsert.insertId;

            // C. Predictable URLs (DB First)
            const timestamp = Date.now();
            const mName = `revised_manuscript_${submissionId}_v${nextVersion}_${timestamp}.${manuscriptFile.name.split('.').pop()}`;
            const mUrl = `/api/files/submissions/${mName}`;

            await tx.insert(submissionFiles).values([
                { versionId: verId, fileType: "mainManuscript", fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size }
            ]);

            // D. Set status back to 'submitted'
            await tx.update(submissions)
                .set({ status: 'submitted', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            return { mName, nextVersion, verId };
        });

        // 2. FILE SYSTEM OPERATIONS (POST-COMMIT)
        const relativeManuscriptPath = `submissions/${result.mName}`;
        try {
            const manuscriptBuffer = Buffer.from(await manuscriptFile.arrayBuffer());
            await uploadFileToStorage(relativeManuscriptPath, manuscriptBuffer, manuscriptFile.name);
            fileCleanup.push(relativeManuscriptPath);
        } catch (uploadError) {
            console.error("Upload revised paper failed:", uploadError);
            // IO failed — cleanup disk on storage service and rollback DB
            for (const filePath of fileCleanup) {
                try { await safeDeleteFile(filePath); } catch { /* ignore */ }
            }

            await db.transaction(async (tx) => {
                await tx.delete(submissionFiles).where(eq(submissionFiles.versionId, result.verId));
                await tx.delete(submissionVersions).where(
                    and(eq(submissionVersions.submissionId, submissionId), eq(submissionVersions.versionNumber, result.nextVersion))
                );
                await tx.update(submissions)
                    .set({ status: 'revisionRequested', updatedAt: new Date() })
                    .where(eq(submissions.id, submissionId));
            });
            throw new Error("Failed to save files on server. Please try again.");
        }

        // 3. Notifications to Staff
        try {
            const paperData = await db.select({ 
                paperId: submissions.paperId,
                title: submissionVersions.title,
                authorName: userProfiles.fullName
            })
            .from(submissions)
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .innerJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
            .where(and(eq(submissions.id, submissionId), eq(submissionVersions.versionNumber, result.nextVersion)))
            .limit(1);

            if (paperData.length > 0) {
                const paper = paperData[0];
                if (paper) {
                    const staff = await db.select({ email: users.email, role: users.role }).from(users).where(inArray(users.role, ['admin', 'editor']));
                    
                    await Promise.allSettled(staff.map((s) => {
                        const template = emailTemplates.resubmissionReceived(
                            paper.authorName || 'Author',
                            paper.title || 'Untitled',
                            paper.paperId || '',
                            submissionId,
                            s.role as 'admin' | 'editor'
                        );
                        return sendEmail({ to: s.email, subject: template.subject, html: template.html });
                    }));
                }
            }
        } catch (mailErr) {
            console.error("Resubmission Notification Error:", mailErr);
            // Non-blocking for the user
        }

        await invalidateSubmittedSubmissionsCount();
        await invalidateAuthorActionsCount(author.id);
        revalidatePath('/author');
        return actionSuccess(undefined);

    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Resubmission Failure:", error);
        return actionError(message || "Failed to process revision.");
    }
}

/**
 * Upload the signed copyright form after acceptance.
 * Enforces .docx format only.
 * Deletes all previous copyright files uploaded for this submission regardless of version.
 */
export async function uploadCopyrightFormAfterAcceptance(submissionId: number, formData: FormData): Promise<ActionResponse> {
    try {
        const author = await getAuthorSession();
        if (!author) return actionError("Unauthorized");

        const subQuery = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            correspondingAuthorId: submissions.correspondingAuthorId
        })
        .from(submissions)
        .where(eq(submissions.id, submissionId))
        .limit(1);

        if (!subQuery.length) return actionError("Submission not found");
        const sub = subQuery[0];
        if (!sub) return actionError("Submission not found");
        if (sub.correspondingAuthorId !== author.id) return actionError("Unauthorized access to submission");

        const allowedStatuses: string[] = ['accepted', 'paymentPending', 'published'];
        if (!allowedStatuses.includes(sub.status)) {
            return actionError(`Manuscript status '${sub.status}' does not allow copyright upload.`);
        }

        const copyrightFile = formData.get("copyrightForm") as File;
        if (!copyrightFile || copyrightFile.size === 0) {
            return actionError("Copyright form file is required.");
        }

        // Strict Policy: Only .docx format is accepted
        const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isDocx = copyrightFile.name.toLowerCase().endsWith(".docx") || copyrightFile.type === docxMime;
        if (!isDocx) {
            return actionError("Strict Policy: The Copyright Form must be a .docx file.");
        }

        // Find all previous copyright files associated with this submission across all versions
        const oldFiles = await db.select({
            fileId: submissionFiles.id,
            fileUrl: submissionFiles.fileUrl
        })
        .from(submissionFiles)
        .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
        .where(and(
            eq(submissionVersions.submissionId, submissionId),
            eq(submissionFiles.fileType, "copyrightForm")
        ));

        // Get the latest version to bind the file
        const versionsArr = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);
        
        if (!versionsArr.length) return actionError("Submission version records not found.");
        const latestVersion = versionsArr[0];
        if (!latestVersion) return actionError("Submission version records not found.");

        const timestamp = Date.now();
        const cName = `copyright_${submissionId}_${timestamp}.docx`;
        const cUrl = `/api/files/submissions/${cName}`;

        // 1. File System modifications (Proxy to storage service)
        const relativeCopyrightPath = `submissions/${cName}`;
        await uploadFileToStorage(relativeCopyrightPath, Buffer.from(await copyrightFile.arrayBuffer()), copyrightFile.name);

        try {
            // 2. Database modifications
            await db.transaction(async (tx) => {
                if (oldFiles.length > 0) {
                    const oldFileIds = oldFiles.map((f) => f.fileId);
                    await tx.delete(submissionFiles).where(inArray(submissionFiles.id, oldFileIds));
                }

                await tx.insert(submissionFiles).values({
                    versionId: latestVersion.id,
                    fileType: "copyrightForm",
                    fileUrl: cUrl,
                    originalName: copyrightFile.name,
                    fileSize: copyrightFile.size
                });
            });
        } catch (dbError) {
            // DB transaction failed - roll back file system upload
            try {
                await safeDeleteFile(cUrl);
            } catch (cleanupErr) {
                console.error("Failed to delete newly uploaded copyright file after DB transaction failure:", cleanupErr);
            }
            throw dbError;
        }

        // 3. Cleanup old files from disk on storage service
        for (const oldFile of oldFiles) {
            try {
                await safeDeleteFile(oldFile.fileUrl);
            } catch (cleanupErr) {
                console.error("Failed to delete old copyright file:", cleanupErr);
            }
        }

        // 3. Asynchronously email the staff (non-blocking)
        try {
            const paperInfo = await db.select({
                paperId: submissions.paperId,
                title: submissionVersions.title,
                authorName: userProfiles.fullName
            })
            .from(submissions)
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .innerJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
            .where(and(eq(submissions.id, submissionId), eq(submissionVersions.versionNumber, latestVersion.versionNumber)))
            .limit(1);

            if (paperInfo.length > 0) {
                const paper = paperInfo[0];
                if (paper) {
                    const staff = await db.select({ email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
                    const template = emailTemplates.copyrightSubmitted(
                        paper.authorName || 'Author',
                        paper.title || 'Untitled',
                        paper.paperId,
                        submissionId
                    );

                    const copyrightBuffer = Buffer.from(await copyrightFile.arrayBuffer());

                    await Promise.allSettled(staff.map((s) => sendEmail({
                        to: s.email,
                        subject: template.subject,
                        html: template.html,
                        attachments: [{
                            filename: copyrightFile.name,
                            content: copyrightBuffer
                        }]
                    })));
                }
            }
        } catch (mailErr) {
            console.error("Copyright upload email dispatch error:", mailErr);
        }

        revalidatePath('/author');
        revalidatePath(`/author/submissions/${submissionId}`);

        return actionSuccess(undefined);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Copyright upload failure:", error);
        return actionError("Failed to upload copyright transfer form: " + message);
    }
}

export async function getMySubmissions() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return [];

        const userId = session.user.id;

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as('lv');

        const query = db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            title: submissionVersions.title,
        })
        .from(submissions)
        .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion)
        ));

        // Authors only see their own. Admins/Editors see all? 
        // Actually this specific function is typically for the "My Papers" tab.
        const rows = await query.where(eq(submissions.correspondingAuthorId, userId))
            .orderBy(desc(submissions.submittedAt));

        return rows.map((r) => ({
            id: r.id,
            paperId: r.paperId,
            status: r.status,
            submittedAt: r.submittedAt,
            title: r.title || "Untitled Manuscript"
        }));
    } catch (error) {
        console.error("Consolidated getMySubmissions Error:", error);
        return [];
    }
}

/**
 * System Cleanup: Delete authors and their submissions if they are inactive for 15+ days 
 * after rejection or revision request, and have no other active papers.
 */
export async function runCleanupInactiveAuthors(): Promise<ActionResponse<{ deletedCount: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError<{ deletedCount: number }>("Unauthorized: Admin privileges required.");
        }

        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);

        // 1. Find submissions that are 'rejected' or 'revisionRequested' and not updated for 15 days
        const targetSubmissions = await db.select({
            id: submissions.id,
            authorId: submissions.correspondingAuthorId
        })
        .from(submissions)
        .where(and(
            inArray(submissions.status, ['rejected', 'revisionRequested']),
            sql`${submissions.updatedAt} < ${fifteenDaysAgo}`
        ));

        if (targetSubmissions.length === 0) {
            return actionSuccess({ deletedCount: 0 }, "No inactive submissions found.");
        }

        const authorIds = [...new Set(targetSubmissions.map((s) => s.authorId))];
        let deletedCount = 0;
        
        for (const aId of authorIds) {
            if (!aId) continue;
            
            // 1. Verify this user is strictly an 'author' role to protect staff accounts
            const userRecord = await db.select({ role: users.role })
                .from(users)
                .where(eq(users.id, aId))
                .limit(1);
            
            if (userRecord[0]?.role !== 'author') continue;
            
            // 2. Safety Check: Check if this author has ANY published or active papers
            // We MUST NOT delete authors who have successfully published or have ongoing work.
            const activeOrPublished = await db.select({ id: submissions.id })
                .from(submissions)
                .where(and(
                    eq(submissions.correspondingAuthorId, aId),
                    notInArray(submissions.status, ['rejected', 'revisionRequested'])
                ))
                .limit(1);

            if (activeOrPublished.length === 0) {
                // This author is purely inactive or rejected. Delete them.
                // We'll use a transaction for each user cleanup
                await db.transaction(async (tx) => {
                    // Get all submission IDs for this author to clean files
                    const authorSubs = await tx.select({ id: submissions.id }).from(submissions).where(eq(submissions.correspondingAuthorId, aId));
                    const subIds = authorSubs.map((s) => s.id);

                    if (subIds.length > 0) {
                        // 1. Fetch version IDs and assignment IDs
                        const versions = await tx.select({ id: submissionVersions.id })
                            .from(submissionVersions)
                            .where(inArray(submissionVersions.submissionId, subIds));
                        const versionIds = versions.map(v => v.id);

                        const assignments = await tx.select({ id: reviewAssignments.id })
                            .from(reviewAssignments)
                            .where(inArray(reviewAssignments.submissionId, subIds));
                        const assignmentIds = assignments.map(a => a.id);

                        // 2. Clean files from disk
                        if (versionIds.length > 0) {
                            const files = await tx.select()
                                .from(submissionFiles)
                                .where(inArray(submissionFiles.versionId, versionIds));
                            
                            for (const file of files) {
                                await safeDeleteFile(file.fileUrl);
                            }
                        }

                        // 3. Waterfall database deletions in reverse dependency order
                        await tx.delete(publications).where(inArray(publications.submissionId, subIds));

                        if (assignmentIds.length > 0) {
                            await tx.delete(reviews).where(inArray(reviews.assignmentId, assignmentIds));
                            await tx.delete(reviewAssignments).where(inArray(reviewAssignments.id, assignmentIds));
                        }

                        if (versionIds.length > 0) {
                            await tx.delete(submissionFiles).where(inArray(submissionFiles.versionId, versionIds));
                            await tx.delete(submissionVersions).where(inArray(submissionVersions.id, versionIds));
                        }

                        await tx.delete(submissionAuthors).where(inArray(submissionAuthors.submissionId, subIds));
                        await tx.delete(payments).where(inArray(payments.submissionId, subIds));
                        await tx.delete(submissionEditors).where(inArray(submissionEditors.submissionId, subIds));
                        await tx.delete(submissions).where(inArray(submissions.id, subIds));
                    }

                    // Delete Profile and User
                    await tx.delete(userProfiles).where(eq(userProfiles.userId, aId));
                    await tx.delete(users).where(eq(users.id, aId));
                });
                deletedCount++;
            }
        }

        revalidatePath('/admin/users');
        return actionSuccess({ deletedCount }, `Cleanup complete. Deleted ${deletedCount} inactive authors.`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Cleanup Error:", error);
        return actionError<{ deletedCount: number }>("Cleanup failed: " + message);
    }
}

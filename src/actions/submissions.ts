"use server";

import { db } from "@/lib/db";
import {
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
    payments,
    reviews,
    reviewAssignments,
    settings,
    volumesIssues,
    publications,
} from "@/db/schema";
import {
    type SubmissionDetail,
    type SubmissionUI,
    type ActionResponse,
    type UserWithProfile,
    type SubmissionFile,
    type ReviewWithReviewer,
} from "@/db/types";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import fs from 'fs/promises';
import path from 'path';
import { eq, desc, and, isNull, inArray, or, like, sql, SQL } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { resolveAbsolutePath, safeDeleteFile } from "@/lib/fs-utils";

/**
 * Fetch a unified submission object with all related data joined.
 * Resolves the structural mismatches between the legacy "flat" schema and the new normalized schema.
 */
export async function getSubmissionById(id: number): Promise<ActionResponse<SubmissionUI>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required" };

        // 1. Fetch Core Submission + Profile + Latest Version + Publication + Issue
        const submissionRows = await db.select({
            submission: submissions,
            author: users,
            authorProfile: userProfiles,
            issue: volumesIssues,
            publication: publications,
            payment: payments
        })
            .from(submissions)
            .where(and(eq(submissions.id, id), isNull(submissions.deletedAt)))
            .leftJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
            .leftJoin(publications, eq(submissions.id, publications.submissionId))
            .leftJoin(payments, eq(submissions.id, payments.submissionId))
            .limit(1);

        const row = submissionRows[0];
        if (!row) return { success: false, error: "Submission not found" };

        // RBAC: Verify user has permission to see this submission
        if (session.user.role === 'author' && row.submission.correspondingAuthorId !== session.user.id) {
            return { success: false, error: "Unauthorized access" };
        }
        if (session.user.role === 'reviewer') {
            const [assignment] = await db.select()
                .from(reviewAssignments)
                .where(and(
                    eq(reviewAssignments.submissionId, id),
                    eq(reviewAssignments.reviewerId, session.user.id)
                ))
                .limit(1);
            if (!assignment) return { success: false, error: "Unauthorized access: You are not assigned to this manuscript." };
        }

        // 2. Fetch Latest Version
        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, id))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const latestVersion = versionRows[0];

        // 3. Fetch Authors (Co-authors)
        const authors = await db.select()
            .from(submissionAuthors)
            .where(eq(submissionAuthors.submissionId, id))
            .orderBy(submissionAuthors.orderIndex);

        // 4. Fetch Review Assignments with Reviewer Profiles and Decisions
        const assignments = await db.select({
            ra: reviewAssignments,
            reviewer: users,
            profile: userProfiles,
            review: reviews
        })
            .from(reviewAssignments)
            .where(eq(reviewAssignments.submissionId, id))
            .leftJoin(users, eq(reviewAssignments.reviewerId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId));

        // 5. Fetch Files for the Latest Version
        const files = latestVersion
            ? await db.select().from(submissionFiles).where(eq(submissionFiles.versionId, latestVersion.id))
            : [];

        // 6. Map to Domain Types
        const typedAssignments: ReviewWithReviewer[] = assignments.map(a => ({
            ...a.ra,
            reviewer: (a.reviewer && a.profile) ? { ...a.reviewer, profile: a.profile } : ({} as UserWithProfile),
            review: a.review
        }));

        const submissionData: SubmissionDetail = {
            ...row.submission,
            correspondingAuthor: (row.author && row.authorProfile) ? { ...row.author, profile: row.authorProfile } as UserWithProfile : undefined,
            versions: latestVersion ? [{ ...latestVersion, files: files as SubmissionFile[] }] : [],
            authors,
            payment: row.payment,
            reviewAssignments: typedAssignments,
            issue: row.issue,
            publication: row.publication
        };

        // 7. Map to UI-Friendly Composite Object (Flat properties for historical compatibility)
        const mainManuscript = files.find(f => f.fileType === 'mainManuscript');
        const pdfVersion = files.find(f => f.fileType === 'pdfVersion');
        const finalPdf = row.publication?.finalPdfUrl;

        const data: SubmissionUI = {
            ...submissionData,
            title: latestVersion?.title || "Untitled Manuscript",
            abstract: latestVersion?.abstract || null,
            keywords: latestVersion?.keywords || null,
            filePath: mainManuscript?.fileUrl || "",
            pdfUrl: finalPdf || pdfVersion?.fileUrl || "", // Priority: Published PDF > Review PDF
            authorName: submissionData.correspondingAuthor?.profile?.fullName || "Unknown Author",
            authorEmail: submissionData.correspondingAuthor?.email || "",
            coAuthors: submissionData.authors,
            volumeNumber: submissionData.issue?.volumeNumber,
            issueNumber: submissionData.issue?.issueNumber,
            startPage: submissionData.publication?.startPage,
            endPage: submissionData.publication?.endPage,
            latestVersion: latestVersion ? { ...latestVersion, files: files as SubmissionFile[] } : undefined,
            allFiles: files as SubmissionFile[],
            allReviews: typedAssignments,
        };

        return { success: true, data };
    } catch (error) {
        console.error("Get Submission Detail Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Fetch all submissions formatted for Admin/Editor listing
 */
export async function getAllSubmissions(filters?: { status?: string, q?: string }): Promise<ActionResponse<SubmissionUI[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Fetch core data + latest versions in one JOIN query
        const conditions: SQL[] = [isNull(submissions.deletedAt)];
        if (filters?.status && filters.status !== 'all') {
            conditions.push(eq(submissions.status, filters.status as "submitted" | "editorAssigned" | "underReview" | "revisionRequested" | "accepted" | "rejected" | "paymentPending" | "published"));
        }
        if (filters?.q) {
            const searchVal = `%${filters.q}%`;
            const searchCondition = or(
                like(submissions.paperId, searchVal),
                like(submissionVersions.title, searchVal)
            ) as SQL;
            if (searchCondition) {
                conditions.push(searchCondition);
            }
        }

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
            .from(submissionVersions)
            .groupBy(submissionVersions.submissionId)
            .as('lv');

        const rows = await db.select({
            submission: submissions,
            author: users,
            authorProfile: userProfiles,
            latestVersion: submissionVersions,
            payment: payments,
            issue: volumesIssues,
            publication: publications
        })
            .from(submissions)
            .leftJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
            .leftJoin(submissionVersions, and(
                eq(submissions.id, submissionVersions.submissionId),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion)
            ))
            .leftJoin(payments, eq(submissions.id, payments.submissionId))
            .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
            .leftJoin(publications, eq(submissions.id, publications.submissionId))
            .where(and(...conditions))
            .orderBy(desc(submissions.submittedAt));

        if (rows.length === 0) return { success: true, data: [] };

        const subIds = rows.map(r => r.submission.id);
        const versionIds = rows.filter(r => r.latestVersion).map(r => r.latestVersion!.id);

        // 2. Bulk fetch Co-Authors
        const allCoAuthors = await db.select().from(submissionAuthors).where(inArray(submissionAuthors.submissionId, subIds));

        // 3. Bulk fetch Files
        const allFiles = versionIds.length > 0
            ? await db.select().from(submissionFiles).where(inArray(submissionFiles.versionId, versionIds))
            : [];

        // 4. Map everything to SubmissionUI
        const data: SubmissionUI[] = rows.map(row => {
            const subAuthors = allCoAuthors.filter(a => a.submissionId === row.submission.id);
            const subFiles = row.latestVersion ? allFiles.filter(f => f.versionId === row.latestVersion!.id) : [];

            const mainManuscript = subFiles.find(f => f.fileType === 'mainManuscript');
            const pdfVersion = subFiles.find(f => f.fileType === 'pdfVersion');
            const finalPdf = row.publication?.finalPdfUrl;

            return {
                ...row.submission,
                title: row.latestVersion?.title || "Untitled Manuscript",
                abstract: row.latestVersion?.abstract || "",
                keywords: row.latestVersion?.keywords || "",
                filePath: mainManuscript?.fileUrl || "",
                pdfUrl: finalPdf || pdfVersion?.fileUrl || "",
                authorName: row.authorProfile?.fullName || "Unknown Author",
                authorEmail: row.author?.email || "",
                coAuthors: subAuthors,
                volumeNumber: row.issue?.volumeNumber,
                issueNumber: row.issue?.issueNumber,
                startPage: row.publication?.startPage,
                endPage: row.publication?.endPage,
                latestVersion: row.latestVersion ? { ...row.latestVersion, files: subFiles as SubmissionFile[] } : undefined,
                allFiles: subFiles as SubmissionFile[],
                allReviews: [],
                payment: row.payment,
                correspondingAuthor: (row.author && row.authorProfile) ? { ...row.author, profile: row.authorProfile } : undefined,
                authors: subAuthors,
                versions: row.latestVersion ? [{ ...row.latestVersion, files: subFiles as SubmissionFile[] }] : [],
                reviewAssignments: [],
                issue: row.issue,
                publication: row.publication
            };
        });

        return { success: true, data };
    } catch (error) {
        console.error("Get All Submissions Error:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Admin/Editor: Final accept/reject decision
 */
export async function decideSubmission(id: number, decision: 'accepted' | 'rejected'): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const subRes = await getSubmissionById(id);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || "Submission not found" };
        const submission = subRes.data;

        const apcRows = await db.select().from(settings).where(eq(settings.settingKey, 'apcInr')).limit(1);
        const apcAmount = apcRows[0]?.settingValue || '0';
        const apcCurrency = 'INR';

        const isFree = parseFloat(apcAmount) === 0;

        await db.transaction(async (tx) => {
            const status = decision === 'accepted' ? 'accepted' : 'rejected';
            await tx.update(submissions).set({ status }).where(eq(submissions.id, id));

            if (decision === 'accepted' && parseFloat(apcAmount) > 0) {
                await tx.insert(payments).values({
                    submissionId: id,
                    amount: Number(apcAmount).toFixed(2),
                    currency: apcCurrency,
                    status: 'pending'
                }).onDuplicateKeyUpdate({ set: { status: 'pending' } });
            }
        });

        // Email is fire-and-forget — SMTP failure should not rollback the decision
        const template = decision === 'accepted'
            ? emailTemplates.manuscriptAcceptance(submission.authorName, submission.title, submission.paperId, isFree)
            : emailTemplates.manuscriptRejection(submission.authorName, submission.title, submission.paperId, "Does not meet editorial criteria.");

        sendEmail({ to: submission.authorEmail, subject: template.subject, html: template.html })
            .catch(e => console.error("Decision email failed:", e));

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to finalize decision: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Update submission status and notify author
 */
export async function updateSubmissionStatus(id: number, status: typeof submissions.$inferSelect.status): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        await db.update(submissions).set({ status }).where(eq(submissions.id, id));

        const subRes = await getSubmissionById(id);
        if (subRes.success && subRes.data) {
            const submission = subRes.data;
            const apcRows = await db.select().from(settings).where(eq(settings.settingKey, 'apcInr')).limit(1);
            const isFree = (apcRows[0]?.settingValue || '0') === '0';

            const template = emailTemplates.statusUpdate(
                submission.authorName,
                submission.title,
                status,
                submission.paperId,
                isFree
            );
            await sendEmail({ to: submission.authorEmail, subject: template.subject, html: template.html });
        }

        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to update status: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Request resubmission WITH comments
 */
export async function requestResubmissionWithComments(
    submissionId: number,
    comments: string
): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || 'Submission not found' };
        const submission = subRes.data;

        await db.update(submissions)
            .set({ status: 'revisionRequested' })
            .where(eq(submissions.id, submissionId));

        const emailData = emailTemplates.resubmissionRequest(
            submission.authorName,
            submission.title,
            submission.paperId,
            comments,
            submissionId
        );
        await sendEmail({ to: submission.authorEmail, subject: emailData.subject, html: emailData.html });

        revalidatePath(`/admin/submissions/${submissionId}`);
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Permanent Delete (Full Cleanup)
 */
export async function deleteSubmission(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const subRes = await getSubmissionById(id);
        if (!subRes.success || !subRes.data) return { success: false, error: subRes.error || "Submission not found" };
        // 1. Fetch ALL files for ALL versions of this submission
        const allSubmissionFiles = await db.select({
            fileUrl: submissionFiles.fileUrl
        })
            .from(submissionFiles)
            .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
            .where(eq(submissionVersions.submissionId, id));

        // 2. Database cleanup
        await db.transaction(async (tx) => {
            // Delete reviews before assignments (FK constraint)
            const assignmentRows = await tx
                .select({ id: reviewAssignments.id })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, id));

            if (assignmentRows.length > 0) {
                const aIds = assignmentRows.map(a => a.id);
                await tx.delete(reviews).where(inArray(reviews.assignmentId, aIds));
            }

            // Fetch version IDs to delete their files first
            const versionRows = await tx.select({ id: submissionVersions.id })
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, id));
            const vIds = versionRows.map(v => v.id);

            if (vIds.length > 0) {
                await tx.delete(submissionFiles).where(inArray(submissionFiles.versionId, vIds));
            }

            await tx.delete(submissionAuthors).where(eq(submissionAuthors.submissionId, id));
            await tx.delete(payments).where(eq(payments.submissionId, id));
            await tx.delete(reviewAssignments).where(eq(reviewAssignments.submissionId, id));
            await tx.delete(submissionVersions).where(eq(submissionVersions.submissionId, id));
            await tx.delete(submissions).where(eq(submissions.id, id));
        });

        // 3. File system cleanup (All versions)
        for (const file of allSubmissionFiles) {
            await safeDeleteFile(file.fileUrl);
        }

        revalidatePath('/admin/submissions');
        return { success: true };
    } catch (error) {
        return { success: false, error: "Failed to delete: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Admin/Editor: Upload a finalized PDF version of the manuscript
 */
export async function uploadManuscriptPdf(submissionId: number, formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const pdfFile = formData.get("pdfFile") as File;
        if (!pdfFile || pdfFile.size === 0) return { success: false, error: "PDF file is required." };

        // MIME Validation
        if (pdfFile.type !== 'application/pdf' && !pdfFile.name.toLowerCase().endsWith('.pdf')) {
            return { success: false, error: "Invalid file type. Only PDF files are allowed for the finalized manuscript." };
        }

        // 1. Get Latest Version
        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        if (!versionRows.length) return { success: false, error: "No version records found for this submission." };
        const latestVersion = versionRows[0];
        if (!latestVersion) return { success: false, error: "No version records found for this submission." };

        // 2. Prepare File Path
        const timestamp = Date.now();
        const fileName = `final_manuscript_${submissionId}_v${latestVersion.versionNumber}_${timestamp}.pdf`;
        const fileUrl = `/api/files/submissions/${fileName}`;
        const uploadDir = path.join(process.cwd(), "storage/submissions");

        // 3. Database Update (Insert File Record)
        await db.transaction(async (tx) => {
            // Check if a PDF version already exists for this version
            const existing = await tx.select().from(submissionFiles).where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'pdfVersion')
            )).limit(1);

            if (existing.length > 0) {
                const existingFile = existing[0];
                if (existingFile) {
                    await tx.delete(submissionFiles).where(eq(submissionFiles.id, existingFile.id));
                }
            }

            await tx.insert(submissionFiles).values({
                versionId: latestVersion.id,
                fileType: 'pdfVersion',
                fileUrl: fileUrl,
                originalName: pdfFile.name,
                fileSize: pdfFile.size
            });

            await tx.update(submissions).set({ updatedAt: new Date() }).where(eq(submissions.id, submissionId));
        });

        // 4. File System Operation
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(await pdfFile.arrayBuffer()));

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath('/admin/submissions');

        return { success: true };
    } catch (error) {
        console.error("Upload PDF Error:", error);
        return { success: false, error: "Failed to upload PDF: " + (error instanceof Error ? error.message : String(error)) };
    }
}

/**
 * Automated DOCX to PDF Conversion using iLovePDF
 */
import { convertDocxToPdf } from "@/lib/ilovepdf";

export async function autoSyncManuscriptToPdf(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        // 1. Fetch Latest Version & Main Manuscript (.docx)
        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const latestVersion = versionRows[0];
        if (!latestVersion) return { success: false, error: "No version records found." };

        const fileRows = await db.select()
            .from(submissionFiles)
            .where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'mainManuscript')
            ))
            .limit(1);

        if (!fileRows.length) return { success: false, error: "No DOCX manuscript found for conversion." };
        const docxFile = fileRows[0];
        if (!docxFile) return { success: false, error: "No DOCX manuscript found for conversion." };

        // 2. Read DOCX from disk
        const docxPath = resolveAbsolutePath(docxFile.fileUrl);
        const docxBuffer = await fs.readFile(docxPath);

        // 3. Convert to PDF
        const pdfBuffer = await convertDocxToPdf(docxBuffer, docxFile.originalName || "manuscript.docx");

        // 4. Save PDF to disk
        const timestamp = Date.now();
        const fileName = `auto_final_v${latestVersion.versionNumber}_${timestamp}.pdf`;
        const fileUrl = `/api/files/submissions/${fileName}`;
        const uploadDir = path.join(process.cwd(), "storage/submissions");

        await fs.mkdir(uploadDir, { recursive: true });
        await fs.writeFile(path.join(uploadDir, fileName), pdfBuffer);

        // 5. Update Database
        await db.transaction(async (tx) => {
            // Remove existing PDF version if it exists
            await tx.delete(submissionFiles).where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'pdfVersion')
            ));

            await tx.insert(submissionFiles).values({
                versionId: latestVersion.id,
                fileType: 'pdfVersion',
                fileUrl: fileUrl,
                originalName: fileName,
                fileSize: pdfBuffer.length
            });

            await tx.update(submissions).set({ updatedAt: new Date() }).where(eq(submissions.id, submissionId));
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/reviewer/submissions/${submissionId}`);

        return { success: true };
    } catch (error) {
        console.error("Auto Sync PDF Error:", error);
        return { success: false, error: "Conversion failed: " + (error instanceof Error ? error.message : String(error)) };
    }
}

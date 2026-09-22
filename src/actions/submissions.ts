"use server";
import "server-only"

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
} from "@/db/schema";
import { logSubmissionEvent } from "./event-log";
import type { SubmissionUI } from "@/db/contracts";
import type { EditorialDecision } from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError,
} from "@/lib/action-response";
import { revalidatePath, updateTag } from "next/cache";
import { invalidateSubmittedSubmissionsCount, invalidateAuthorActionsCount, invalidateReviewerAssignmentsCount, createNotification } from "./notifications";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { eq, desc, and, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
    safeDeleteFile, 
    uploadFileToStorage, 
    triggerDocxToPdfConversion 
} from "@/lib/fs-utils";
import {
    findSubmissionById,
    listSubmissions,
} from "@/features/submissions/server/submission.repository";
import {
    corrigendumSchema,
    editorialDecisionSchema,
    retractionSchema,
    resubmissionCommentsSchema,
    submissionIdSchema,
} from "@/features/submissions/schemas/submission.schema";

/**
 * Fetch a unified submission object with all related data joined.
 * Resolves the structural mismatches between the legacy "flat" schema and the new normalized schema.
 */
export async function getSubmissionById(id: number): Promise<ActionResponse<SubmissionUI>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required" };

        const data = await findSubmissionById(id);
        if (!data) return { success: false, error: "Submission not found" };

        // RBAC: Verify user has permission to see this submission
        if (session.user.role === 'author' && data.correspondingAuthorId !== session.user.id) {
            return { success: false, error: "Unauthorized access" };
        }
        if (session.user.role === 'reviewer') {
            const isAssigned = data.reviewAssignments.some(ra => ra.reviewerId === session.user.id);
            if (!isAssigned) {
                return { success: false, error: "Unauthorized access: You are not assigned to this manuscript." };
            }
        }

        return { success: true, data };
    } catch (error) {
        console.error("Get Submission Detail Error:", error);
        return serverError(error, "fetch submission");
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

        return { success: true, data: await listSubmissions(filters) };
    } catch (error) {
        console.error("Get All Submissions Error:", error);
        return serverError(error, "fetch submissions");
    }
}

/**
 * Admin/Editor: Final accept/reject decision
 */
export async function decideSubmission(id: number, decision: EditorialDecision): Promise<ActionResponse> {
    try {
        const idResult = submissionIdSchema.safeParse(id);
        const decisionResult = editorialDecisionSchema.safeParse(decision);
        if (!idResult.success || !decisionResult.success) {
            return actionError("Invalid submission decision input.");
        }

        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const subRes = await getSubmissionById(id);
        if (!subRes.success) return { success: false, error: subRes.error };
        if (!subRes.data) return { success: false, error: "Submission not found" };
        const submission = subRes.data;

        const apcRows = await db.select().from(settings).where(eq(settings.settingKey, 'apcInr')).limit(1);
        const apcAmount = apcRows[0]?.settingValue || '0';
        const apcCurrency = 'INR';

        const isFree = parseFloat(apcAmount) === 0;

        await db.transaction(async (tx) => {
            const status = decision === 'accepted' ? (isFree ? 'accepted' : 'paymentPending') : 'rejected';
            await tx.update(submissions).set({ status }).where(eq(submissions.id, id));

            if (decision === 'accepted' && !isFree) {
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
            ? await emailTemplates.manuscriptAcceptance(submission.authorName, submission.title, submission.paperId, isFree)
            : await emailTemplates.manuscriptRejection(submission.authorName, submission.title, submission.paperId, "Does not meet editorial criteria.");

        sendEmail({ to: submission.authorEmail, subject: template.subject, html: template.html })
            .catch(e => console.error("Decision email failed:", e));

        // Trigger in-app notification for the corresponding author
        const notifType = decision === 'accepted' 
            ? (isFree ? 'paper_accepted' : 'payment_pending') 
            : 'paper_rejected';

        const notifMessage = decision === 'accepted'
            ? (isFree 
                ? `Congratulations! Your manuscript ${submission.paperId} has been accepted for publication.` 
                : `Your manuscript ${submission.paperId} has been accepted. Processing charge payment is pending.`)
            : `Your manuscript ${submission.paperId} has been rejected after editorial review.`;

        await createNotification({
            userId: submission.correspondingAuthorId,
            createdByUserId: session.user.id,
            type: notifType,
            priority: "high",
            message: notifMessage,
            actionLink: `/author/submissions/${id}`,
            metadata: { submissionId: id, paperId: submission.paperId }
        });

        await logSubmissionEvent({
            submissionId: id,
            eventType: decision === 'accepted' ? 'paper_accepted' : 'paper_rejected',
            userId: session.user.id,
            description: `Editorial decision: ${decision === 'accepted' ? 'Accepted for publication' : 'Rejected'}.`,
            metadata: {
                decision,
                isFree,
                apcAmount: decision === 'accepted' ? apcAmount : undefined,
            }
        });

        await invalidateSubmittedSubmissionsCount();
        await invalidateAuthorActionsCount(submission.correspondingAuthorId);
        revalidatePath('/admin/submissions');
        revalidatePath(`/admin/submissions/${id}`);
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(id), "decideSubmission");
        updateTag(CACHE_TAGS.SUBMISSION(id));
        if (submission.paperId) {
            updateTag(CACHE_TAGS.PAPER(submission.paperId));
        }
        updateTag(CACHE_TAGS.SUBMISSIONS);
        return { success: true };
    } catch (error) {
        return serverError(error, "finalize decision");
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
        const idResult = submissionIdSchema.safeParse(submissionId);
        const commentsResult = resubmissionCommentsSchema.safeParse(comments);
        if (!idResult.success || !commentsResult.success) {
            return actionError("Invalid resubmission request input.");
        }

        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const subRes = await getSubmissionById(submissionId);
        if (!subRes.success) return { success: false, error: subRes.error };
        if (!subRes.data) return { success: false, error: "Submission not found" };
        const submission = subRes.data;

        await db.update(submissions)
            .set({ status: 'revisionRequested' })
            .where(eq(submissions.id, submissionId));

        const emailData = await emailTemplates.resubmissionRequest(
            submission.authorName,
            submission.title,
            submission.paperId,
            comments,
            submissionId
        );
        await sendEmail({ to: submission.authorEmail, subject: emailData.subject, html: emailData.html });

        await createNotification({
            userId: submission.correspondingAuthorId,
            createdByUserId: session.user.id,
            type: "revision_requested",
            priority: "high",
            message: `Revision requested for manuscript ${submission.paperId}: please review editorial comments.`,
            actionLink: `/author/submissions/${submissionId}`,
            metadata: { submissionId, paperId: submission.paperId }
        });

        await logSubmissionEvent({
            submissionId,
            eventType: 'revision_requested',
            userId: session.user.id,
            description: `Revision requested by editor. Comments provided: "${comments.slice(0, 180)}${comments.length > 180 ? '...' : ''}"`,
            metadata: { comments }
        });

        await invalidateSubmittedSubmissionsCount();
        await invalidateAuthorActionsCount(submission.correspondingAuthorId);
        revalidatePath(`/admin/submissions/${submissionId}`);
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(submissionId), "requestResubmissionWithComments");
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);
        return { success: true };
    } catch (error) {
        return serverError(error, "fetch submission");
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
        if (!subRes.success) return { success: false, error: subRes.error };
        if (!subRes.data) return { success: false, error: "Submission not found" };
        const authorId = subRes.data.correspondingAuthorId;
        // 1. Fetch ALL files for ALL versions of this submission
        const allSubmissionFiles = await db.select({
            fileUrl: submissionFiles.fileUrl
        })
            .from(submissionFiles)
            .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
            .where(eq(submissionVersions.submissionId, id));

        let reviewerIdsToInvalidate: string[] = [];

        // 2. Database cleanup
        await db.transaction(async (tx) => {
            // Delete reviews before assignments (FK constraint)
            const assignmentRows = await tx
                .select({ id: reviewAssignments.id, reviewerId: reviewAssignments.reviewerId })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, id));

            if (assignmentRows.length > 0) {
                reviewerIdsToInvalidate = Array.from(
                    new Set(assignmentRows.map(a => a.reviewerId).filter((rId): rId is string => Boolean(rId)))
                );
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

        await invalidateSubmittedSubmissionsCount();
        await invalidateAuthorActionsCount(authorId);
        if (reviewerIdsToInvalidate.length > 0) {
            await Promise.all(reviewerIdsToInvalidate.map(rId => invalidateReviewerAssignmentsCount(rId)));
        }
        revalidatePath('/admin/submissions');
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(id), "deleteSubmission");
        updateTag(CACHE_TAGS.SUBMISSION(id));
        if (subRes.data.paperId) {
            updateTag(CACHE_TAGS.PAPER(subRes.data.paperId));
        }
        updateTag(CACHE_TAGS.SUBMISSIONS);
        updateTag(CACHE_TAGS.ARCHIVES);
        return { success: true };
    } catch (error) {
        return serverError(error, "delete submission");
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

        // 3. File System Operation (Proxy to storage service)
        const relativePdfPath = `submissions/${fileName}`;
        try {
            const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
            await uploadFileToStorage(relativePdfPath, pdfBuffer, pdfFile.name);
        } catch (uploadError) {
            console.error("Upload PDF to storage service failed:", uploadError);
            return { success: false, error: "Failed to save file on the storage server." };
        }

        // 4. Database Update (Insert File Record)
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

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath('/admin/submissions');
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(submissionId), "uploadManuscriptPdf");
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);

        return { success: true };
    } catch (error) {
        console.error("Upload PDF Error:", error);
        return serverError(error, "upload PDF");
    }
}

/**
 * Automated DOCX to PDF Conversion using iLovePDF
 */
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

        const blindedRows = await db.select()
            .from(submissionFiles)
            .where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'blindedManuscript')
            ))
            .limit(1);

        const fileRows = blindedRows.length > 0 ? blindedRows : await db.select()
            .from(submissionFiles)
            .where(and(
                eq(submissionFiles.versionId, latestVersion.id),
                eq(submissionFiles.fileType, 'mainManuscript')
            ))
            .limit(1);

        if (!fileRows.length) return { success: false, error: "No DOCX manuscript found for conversion." };
        const docxFile = fileRows[0];
        if (!docxFile) return { success: false, error: "No DOCX manuscript found for conversion." };

        const timestamp = Date.now();
        const fileName = `auto_final_v${latestVersion.versionNumber}_${timestamp}.pdf`;
        const fileUrl = `/api/files/submissions/${fileName}`;

        // 2. Trigger conversion on storage service
        const fileSize = await triggerDocxToPdfConversion(docxFile.fileUrl, fileUrl);

        // 3. Update Database
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
                fileSize: fileSize
            });

            await tx.update(submissions).set({ updatedAt: new Date() }).where(eq(submissions.id, submissionId));
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/reviewer/submissions/${submissionId}`);
        cacheLogger.invalidation(CACHE_TAGS.SUBMISSION(submissionId), "autoSyncManuscriptToPdf");
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);

        return { success: true };
    } catch (error) {
        console.error("Auto Sync PDF Error:", error);
        return serverError(error, "convert document");
    }
}

/**
 * 4.4 Plagiarism & Similarity Report Tracking: Record score and optional Turnitin/iThenticate report
 */
export async function recordSimilarityScore(
    submissionId: number,
    percentage: number,
    reportFile?: File | null
): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized: Editor or Admin role required." };
        }

        if (percentage < 0 || percentage > 100) {
            return { success: false, error: "Similarity percentage must be between 0% and 100%." };
        }

        const versionRows = await db.select()
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const latestVersion = versionRows[0];
        if (!latestVersion) return { success: false, error: "Submission version not found." };

        let reportUrl = latestVersion.similarityReportUrl;
        if (reportFile && reportFile.size > 0) {
            const timestamp = Date.now();
            const ext = reportFile.name.split('.').pop();
            const fileName = `similarity_${submissionId}_v${latestVersion.versionNumber}_${timestamp}.${ext}`;
            reportUrl = `/api/files/submissions/${fileName}`;
            const relativePath = `submissions/${fileName}`;
            const buffer = Buffer.from(await reportFile.arrayBuffer());
            await uploadFileToStorage(relativePath, buffer, reportFile.name);
        }

        await db.update(submissionVersions)
            .set({
                similarityPercentage: percentage,
                similarityReportUrl: reportUrl
            })
            .where(eq(submissionVersions.id, latestVersion.id));

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/editor/submissions/${submissionId}`);
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        return { success: true };
    } catch (error) {
        console.error("Record Similarity Error:", error);
        return serverError(error, "record similarity report");
    }
}

/**
 * 5.3 Galley Proofing: Request author to review typeset galley proof
 */
export async function requestGalleyApproval(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized: Editor or Admin role required." };
        }

        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            authorId: submissions.correspondingAuthorId,
            authorEmail: users.email,
            authorName: userProfiles.fullName,
            title: submissionVersions.title,
        })
            .from(submissions)
            .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .where(eq(submissions.id, submissionId))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const sub = rows[0];
        if (!sub) return { success: false, error: "Submission not found." };

        await db.update(submissions)
            .set({
                galleyStatus: 'pendingApproval',
                updatedAt: new Date()
            })
            .where(eq(submissions.id, submissionId));

        // Send in-app notification
        await createNotification({
            userId: sub.authorId,
            createdByUserId: session.user.id,
            type: "revision_requested",
            priority: "high",
            message: `Galley Proof Ready for Review: Please review and approve your typeset article ${sub.paperId}.`,
            actionLink: `/author/submissions/${submissionId}`,
            metadata: { submissionId, paperId: sub.paperId }
        });

        // Send formal galley proof request email to corresponding author
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org';
        const proofUrl = `${baseUrl}/author/submissions/${submissionId}`;
        const proofEmail = await emailTemplates.galleyProofRequest(
            sub.authorName || 'Author',
            sub.title || 'Untitled',
            sub.paperId || '',
            proofUrl
        );
        sendEmail({
            to: sub.authorEmail,
            subject: proofEmail.subject,
            html: proofEmail.html,
        }).catch(e => console.error("Galley proof email failed:", e));

        await logSubmissionEvent({
            submissionId,
            eventType: 'galley_requested',
            userId: session.user.id,
            description: `Galley proof review requested from corresponding author for ${sub.paperId}.`,
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/author/submissions/${submissionId}`);
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        return { success: true };
    } catch (error) {
        console.error("Request Galley Error:", error);
        return serverError(error, "request galley approval");
    }
}

/**
 * 5.3 Galley Proofing: Author approves galley proof or submits correction notes
 */
export async function respondToGalleyProof(
    submissionId: number,
    approved: boolean,
    correctionNote?: string
): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required." };

        const subRows = await db.select()
            .from(submissions)
            .where(eq(submissions.id, submissionId))
            .limit(1);

        const sub = subRows[0];
        if (!sub) return { success: false, error: "Submission not found." };

        // Ensure current user is author or editor/admin
        if (sub.correspondingAuthorId !== session.user.id && !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized." };
        }

        if (approved) {
            await db.update(submissions)
                .set({
                    galleyStatus: 'approved',
                    galleyApprovedAt: new Date(),
                    updatedAt: new Date()
                })
                .where(eq(submissions.id, submissionId));
        } else {
            if (!correctionNote || !correctionNote.trim()) {
                return { success: false, error: "Please provide typographical correction notes." };
            }

            await db.update(submissions)
                .set({
                    galleyStatus: 'correctionsRequested',
                    galleyCorrectionsNote: correctionNote.trim(),
                    updatedAt: new Date()
                })
                .where(eq(submissions.id, submissionId));
        }

        // Notify Editors & Staff of author galley proof response
        try {
            const [version] = await db.select({ title: submissionVersions.title })
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            const [authorProfile] = await db.select({ fullName: userProfiles.fullName })
                .from(userProfiles)
                .where(eq(userProfiles.userId, sub.correspondingAuthorId))
                .limit(1);

            const staff = await db.select({ email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
            const alertEmail = await emailTemplates.galleyProofResponseAlert(
                authorProfile?.fullName || 'Author',
                version?.title || 'Untitled',
                sub.paperId || '',
                approved,
                correctionNote || '',
                submissionId
            );
            await Promise.allSettled(staff.map(s => sendEmail({
                to: s.email,
                subject: alertEmail.subject,
                html: alertEmail.html,
            })));
        } catch (mailErr) {
            console.error("Galley proof response notification failed:", mailErr);
        }

        await logSubmissionEvent({
            submissionId,
            eventType: approved ? 'galley_approved' : 'galley_corrections_requested',
            userId: session.user.id,
            description: approved 
                ? 'Galley proof approved by author for final production.' 
                : `Galley proof corrections requested: "${correctionNote?.slice(0, 180)}${correctionNote && correctionNote.length > 180 ? '...' : ''}"`,
            metadata: { approved, correctionNote }
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/author/submissions/${submissionId}`);
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        return { success: true };
    } catch (error) {
        console.error("Respond Galley Error:", error);
        return serverError(error, "respond to galley proof");
    }
}

/**
 * FORMAL MANUSCRIPT RETRACTION (COPE / OJS Standard)
 * Sets status to 'retracted', preserves the metadata record and records the official reasoning and notice URL.
 */
export async function retractPaper(
    submissionId: number,
    reason: string,
    noticeUrl?: string
): Promise<ActionResponse> {
    try {
        const inputResult = retractionSchema.safeParse({ submissionId, reason, noticeUrl });
        if (!inputResult.success) {
            return actionError(inputResult.error.issues[0]?.message || "Invalid retraction input.");
        }

        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Admin privileges required for retraction.");
        }

        if (!reason || !reason.trim()) {
            return actionError("A formal retraction rationale is required.");
        }

        const rows = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
        const sub = rows[0];
        if (!sub) return actionError("Submission not found.");

        await db.update(submissions)
            .set({
                status: 'retracted',
                retractionReason: reason.trim(),
                retractionNoticeUrl: noticeUrl?.trim() || null,
                retractedAt: new Date(),
                updatedAt: new Date()
            })
            .where(eq(submissions.id, submissionId));

        await logSubmissionEvent({
            submissionId,
            eventType: 'retraction_issued',
            userId: session.user.id,
            description: `Manuscript retracted: "${reason.slice(0, 180)}${reason.length > 180 ? '...' : ''}"`,
            metadata: { reason, noticeUrl }
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/archives`);
        if (sub.paperId) {
            updateTag(CACHE_TAGS.PAPER(sub.paperId));
        }
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.ARCHIVES);

        return actionSuccess();
    } catch (error) {
        console.error("Retract Paper Error:", error);
        return serverError(error, "retract paper");
    }
}

/**
 * FORMAL CORRIGENDUM / ERRATUM ISSUANCE (OJS Standard)
 * Sets status to 'corrigendum', displaying an amendment banner and notice link.
 */
export async function issueCorrigendum(
    submissionId: number,
    amendmentDetails: string,
    noticeUrl?: string
): Promise<ActionResponse> {
    try {
        const inputResult = corrigendumSchema.safeParse({ submissionId, amendmentDetails, noticeUrl });
        if (!inputResult.success) {
            return actionError(inputResult.error.issues[0]?.message || "Invalid corrigendum input.");
        }

        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user.role !== 'admin' && session.user.role !== 'editor')) {
            return actionError("Unauthorized: Editorial privileges required.");
        }

        if (!amendmentDetails || !amendmentDetails.trim()) {
            return actionError("Amendment details are required.");
        }

        const rows = await db.select().from(submissions).where(eq(submissions.id, submissionId)).limit(1);
        const sub = rows[0];
        if (!sub) return actionError("Submission not found.");

        await db.update(submissions)
            .set({
                status: 'corrigendum',
                retractionReason: amendmentDetails.trim(),
                retractionNoticeUrl: noticeUrl?.trim() || null,
                updatedAt: new Date()
            })
            .where(eq(submissions.id, submissionId));

        await logSubmissionEvent({
            submissionId,
            eventType: 'corrigendum_issued',
            userId: session.user.id,
            description: `Corrigendum/Erratum notice issued: "${amendmentDetails.slice(0, 180)}${amendmentDetails.length > 180 ? '...' : ''}"`,
            metadata: { amendmentDetails, noticeUrl }
        });

        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/archives`);
        if (sub.paperId) {
            updateTag(CACHE_TAGS.PAPER(sub.paperId));
        }
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.ARCHIVES);

        return actionSuccess();
    } catch (error) {
        console.error("Issue Corrigendum Error:", error);
        return serverError(error, "issue corrigendum");
    }
}

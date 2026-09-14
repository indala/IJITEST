"use server";
import "server-only";

import { db } from "@/lib/db";
import {
    submissions,
    submissionFiles,
    submissionVersions,
    submissionEditors,
    users,
    userProfiles,
    payments,
} from "@/db/schema";
import { type Submission } from "@/db/types";
import { eq, desc, inArray, sql } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { logSubmissionEvent } from "./event-log";
import { type ActionResponse, actionSuccess, actionError, serverError } from "@/lib/action-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { uploadFileToStorage, safeDeleteFile } from "@/lib/fs-utils";
import { createNotification } from "./notifications";
import { sendEmail, emailTemplates } from "@/lib/mail";

export interface ManuscriptVerificationResult {
    submissionId: number;
    paperId: string;
    title: string;
    authorName: string;
    authorEmail: string;
    status: Submission['status'];
    versionNumber: number;
    versionId?: number;
    hasCopyright?: boolean;
    hasPayment?: boolean;
}

/**
 * Verifies a manuscript's eligibility for a Revised Submission.
 * Checks that the paper exists, matching correspondent email, and is in 'revisionRequested' status.
 */
export async function verifyManuscriptForRevision(
    paperId: string,
    authorEmail: string
): Promise<ActionResponse<ManuscriptVerificationResult>> {
    try {
        const cleanPaperId = paperId?.trim();
        const cleanEmail = authorEmail?.trim().toLowerCase();

        if (!cleanPaperId || !cleanEmail) {
            return actionError("Please provide both Manuscript ID and Corresponding Author Email.");
        }

        const rate = await checkRateLimit({
            key: `verify-rev:${cleanPaperId}:${cleanEmail}`,
            max: 10,
            windowMs: 60_000,
        });
        if (!rate.allowed) {
            return actionError(`Too many attempts. Please wait ${rate.retryAfterSeconds} seconds.`);
        }

        // Query submission, latest version, author details
        const rows = await db.select({
            submissionId: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            authorName: userProfiles.fullName,
            authorEmail: users.email,
            versionNumber: submissionVersions.versionNumber,
            versionId: submissionVersions.id,
            title: submissionVersions.title,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
        .where(eq(submissions.paperId, cleanPaperId))
        .orderBy(desc(submissionVersions.versionNumber))
        .limit(1);

        if (!rows || rows.length === 0) {
            return actionError("No manuscript found matching this Manuscript ID. Please verify your ID.");
        }

        const manuscript = rows[0]!;

        if (manuscript.authorEmail.toLowerCase() !== cleanEmail) {
            return actionError("The entered email does not match the corresponding author on record for this paper.");
        }

        if (manuscript.status !== 'revisionRequested') {
            if (manuscript.status === 'accepted' || manuscript.status === 'paymentPending' || manuscript.status === 'published') {
                return actionError(`This manuscript is already ${manuscript.status}. If you are submitting camera-ready copy, please use 'Final Submission'.`);
            }
            if (manuscript.status === 'underReview' || manuscript.status === 'submitted' || manuscript.status === 'editorAssigned') {
                return actionError("This manuscript is currently undergoing peer review. Revisions can only be submitted once the editorial decision has been made.");
            }
            return actionError(`Manuscript status is '${manuscript.status}'. Revisions are not currently requested.`);
        }

        return actionSuccess({
            submissionId: manuscript.submissionId,
            paperId: manuscript.paperId,
            title: manuscript.title,
            authorName: manuscript.authorName,
            authorEmail: manuscript.authorEmail,
            status: manuscript.status,
            versionNumber: manuscript.versionNumber,
            versionId: manuscript.versionId,
        });
    } catch (error) {
        console.error("verifyManuscriptForRevision error:", error);
        return serverError(error, "verify manuscript for revision");
    }
}

/**
 * Verifies a manuscript's eligibility for a Final (Camera-Ready) Submission.
 * Checks that the paper exists, matching correspondent email, and is in 'accepted' or 'paymentPending' status.
 */
export async function verifyManuscriptForFinalSubmission(
    paperId: string,
    authorEmail: string
): Promise<ActionResponse<ManuscriptVerificationResult>> {
    try {
        const cleanPaperId = paperId?.trim();
        const cleanEmail = authorEmail?.trim().toLowerCase();

        if (!cleanPaperId || !cleanEmail) {
            return actionError("Please provide both Manuscript ID and Corresponding Author Email.");
        }

        const rate = await checkRateLimit({
            key: `verify-final:${cleanPaperId}:${cleanEmail}`,
            max: 10,
            windowMs: 60_000,
        });
        if (!rate.allowed) {
            return actionError(`Too many attempts. Please wait ${rate.retryAfterSeconds} seconds.`);
        }

        const rows = await db.select({
            submissionId: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            authorName: userProfiles.fullName,
            authorEmail: users.email,
            versionNumber: submissionVersions.versionNumber,
            versionId: submissionVersions.id,
            title: submissionVersions.title,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
        .where(eq(submissions.paperId, cleanPaperId))
        .orderBy(desc(submissionVersions.versionNumber))
        .limit(1);

        if (!rows || rows.length === 0) {
            return actionError("No manuscript found matching this Manuscript ID. Please check your acceptance letter.");
        }

        const manuscript = rows[0]!;

        if (manuscript.authorEmail.toLowerCase() !== cleanEmail) {
            return actionError("The entered email does not match the corresponding author on record for this paper.");
        }

        if (manuscript.status !== 'accepted' && manuscript.status !== 'paymentPending') {
            if (manuscript.status === 'published') {
                return actionError("This paper is already published and archived.");
            }
            if (manuscript.status === 'revisionRequested') {
                return actionError("This paper is pending reviewer revisions. Please use 'Revised Submission' to submit your revised draft.");
            }
            return actionError(`This manuscript is currently in '${manuscript.status}' status. Final camera-ready submission is only permitted for accepted papers.`);
        }

        // Check if copyright form or payment is already uploaded
        const existingFiles = await db.select({ fileType: submissionFiles.fileType })
            .from(submissionFiles)
            .where(eq(submissionFiles.versionId, manuscript.versionId));
        
        const existingPayments = await db.select({ status: payments.status })
            .from(payments)
            .where(eq(payments.submissionId, manuscript.submissionId))
            .limit(1);

        const hasCopyright = existingFiles.some(f => f.fileType === 'copyrightForm');
        const hasPayment = existingPayments.length > 0 && (existingPayments[0]!.status === 'paid' || existingPayments[0]!.status === 'verified');

        return actionSuccess({
            submissionId: manuscript.submissionId,
            paperId: manuscript.paperId,
            title: manuscript.title,
            authorName: manuscript.authorName,
            authorEmail: manuscript.authorEmail,
            status: manuscript.status,
            versionNumber: manuscript.versionNumber,
            versionId: manuscript.versionId,
            hasCopyright,
            hasPayment,
        });
    } catch (error) {
        console.error("verifyManuscriptForFinalSubmission error:", error);
        return serverError(error, "verify manuscript for final submission");
    }
}

/**
 * Handles public Revised Submission upload.
 * Validates files, increments version number, updates status, and logs submission event.
 */
export async function submitPublicRevision(formData: FormData): Promise<ActionResponse<{ paperId: string; version: number }>> {
    const fileCleanup: string[] = [];
    try {
        const paperId = (formData.get("paperId") as string)?.trim();
        const authorEmail = (formData.get("authorEmail") as string)?.trim().toLowerCase();
        const changelog = (formData.get("changelog") as string)?.trim() || "";
        const manuscriptFile = formData.get("manuscript") as File | null;
        const rebuttalFile = formData.get("rebuttalFile") as File | null;

        if (!paperId || !authorEmail) {
            return actionError("Missing Manuscript ID or Author Email.");
        }

        // Verify eligibility again
        const verifyRes = await verifyManuscriptForRevision(paperId, authorEmail);
        if (!verifyRes.success || !verifyRes.data) {
            return actionError(verifyRes.error || "Eligibility verification failed.");
        }

        const { submissionId } = verifyRes.data;

        if (!manuscriptFile || manuscriptFile.size === 0) {
            return actionError("Revised manuscript file is required.");
        }

        const isDocx = (f: File) => f.name.toLowerCase().endsWith(".docx");
        if (!isDocx(manuscriptFile)) {
            return actionError("Strict Policy: Only .docx files are accepted for the revised manuscript.");
        }

        if (rebuttalFile && rebuttalFile.size > 0) {
            const isDocxOrPdf = (f: File) => f.name.toLowerCase().endsWith(".docx") || f.name.toLowerCase().endsWith(".pdf");
            if (!isDocxOrPdf(rebuttalFile)) {
                return actionError("Rebuttal document must be a .docx or .pdf file.");
            }
        }

        // 1. Transactional DB commit
        const txResult = await db.transaction(async (tx) => {
            const versionsArr = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            if (!versionsArr.length) throw new Error("Previous manuscript version not found.");
            const latest = versionsArr[0]!;
            const nextVersion = latest.versionNumber + 1;

            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: nextVersion,
                title: latest.title,
                abstract: latest.abstract,
                keywords: latest.keywords,
                changelog: changelog || "Revised version submitted via author portal",
                rebuttalLetter: changelog || null,
            });
            const verId = versionInsert.insertId;

            const timestamp = Date.now();
            const mName = `revised_manuscript_${submissionId}_v${nextVersion}_${timestamp}.${manuscriptFile.name.split('.').pop()}`;
            const mUrl = `/api/files/submissions/${mName}`;

            const filesToInsert: (typeof submissionFiles.$inferInsert)[] = [
                {
                    versionId: verId,
                    fileType: "mainManuscript",
                    fileUrl: mUrl,
                    originalName: manuscriptFile.name,
                    fileSize: manuscriptFile.size,
                }
            ];

            let rName: string | null = null;
            if (rebuttalFile && rebuttalFile.size > 0) {
                rName = `rebuttal_letter_${submissionId}_v${nextVersion}_${timestamp}.${rebuttalFile.name.split('.').pop()}`;
                const rUrl = `/api/files/submissions/${rName}`;
                filesToInsert.push({
                    versionId: verId,
                    fileType: "rebuttalLetter",
                    fileUrl: rUrl,
                    originalName: rebuttalFile.name,
                    fileSize: rebuttalFile.size,
                });
            }

            await tx.insert(submissionFiles).values(filesToInsert);

            // Revert status to 'submitted' for editorial review
            await tx.update(submissions)
                .set({ status: 'submitted', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            return { mName, rName, nextVersion, verId };
        });

        // 2. Upload files to storage
        const relativeManuscriptPath = `submissions/${txResult.mName}`;
        const manuscriptBuffer = Buffer.from(await manuscriptFile.arrayBuffer());
        await uploadFileToStorage(relativeManuscriptPath, manuscriptBuffer, manuscriptFile.name);
        fileCleanup.push(relativeManuscriptPath);

        if (txResult.rName && rebuttalFile && rebuttalFile.size > 0) {
            const relativeRebuttalPath = `submissions/${txResult.rName}`;
            const rebuttalBuffer = Buffer.from(await rebuttalFile.arrayBuffer());
            await uploadFileToStorage(relativeRebuttalPath, rebuttalBuffer, rebuttalFile.name);
            fileCleanup.push(relativeRebuttalPath);
        }

        // 3. Log event
        await logSubmissionEvent({
            submissionId,
            eventType: "revision_submitted",
            description: `Author submitted revision version ${txResult.nextVersion}.`,
            metadata: { version: txResult.nextVersion, paperId }
        });

        // 4. Notify assigned editors and admin staff asynchronously
        try {
            const [adminUsers, assignedEd] = await Promise.all([
                db.select({ id: users.id, email: users.email }).from(users).where(eq(users.role, 'admin')),
                db.select({ editorId: submissionEditors.editorId }).from(submissionEditors).where(eq(submissionEditors.submissionId, submissionId))
            ]);

            const recipientIds = new Set<string>();
            adminUsers.forEach(a => recipientIds.add(a.id));
            assignedEd.forEach(e => recipientIds.add(e.editorId));

            const authorName = verifyRes.data.authorName || "Author";
            const paperTitle = verifyRes.data.title || "Untitled Manuscript";

            await Promise.allSettled(
                Array.from(recipientIds).map(userId =>
                    createNotification({
                        userId,
                        type: "submission_created",
                        priority: "high",
                        message: `Revision (v${txResult.nextVersion}) submitted for manuscript ${paperId}: "${paperTitle}"`,
                        actionLink: `/admin/submissions/${submissionId}`,
                        metadata: { submissionId, paperId }
                    })
                )
            );

            // Send email to admin
            const template = await emailTemplates.resubmissionReceived(
                authorName,
                paperTitle,
                paperId,
                submissionId,
                'admin'
            );
            await Promise.allSettled(
                adminUsers.map(a =>
                    sendEmail({
                        to: a.email,
                        subject: template.subject,
                        html: template.html
                    })
                )
            );
        } catch (notifErr) {
            console.error("Failed to notify staff of revision submission:", notifErr);
        }

        // 5. Invalidation
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);
        revalidatePath('/submit');
        revalidatePath('/track');
        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/editor/submissions/${submissionId}`);

        return actionSuccess({ paperId, version: txResult.nextVersion });
    } catch (error) {
        console.error("submitPublicRevision error:", error);
        for (const filePath of fileCleanup) {
            await safeDeleteFile(filePath).catch(() => {});
        }
        return serverError(error, "submit revision");
    }
}

/**
 * Handles public Final (Camera-Ready) Submission upload.
 * Accepts camera-ready .docx, signed copyright agreement, and optional payment receipt / UTR.
 */
export async function submitPublicFinalSubmission(formData: FormData): Promise<ActionResponse<{ paperId: string }>> {
    const fileCleanup: string[] = [];
    try {
        const paperId = (formData.get("paperId") as string)?.trim();
        const authorEmail = (formData.get("authorEmail") as string)?.trim().toLowerCase();
        const utrNumber = (formData.get("utrNumber") as string)?.trim() || "";
        const cameraReadyFile = formData.get("cameraReadyManuscript") as File | null;
        const copyrightFile = formData.get("copyrightForm") as File | null;
        const paymentReceiptFile = formData.get("paymentReceipt") as File | null;

        if (!paperId || !authorEmail) {
            return actionError("Missing Manuscript ID or Author Email.");
        }

        // Verify eligibility
        const verifyRes = await verifyManuscriptForFinalSubmission(paperId, authorEmail);
        if (!verifyRes.success || !verifyRes.data) {
            return actionError(verifyRes.error || "Eligibility verification failed.");
        }

        const { submissionId } = verifyRes.data;

        if (!cameraReadyFile || cameraReadyFile.size === 0) {
            return actionError("Final camera-ready manuscript (.docx) is required.");
        }

        const isDocx = (f: File) => f.name.toLowerCase().endsWith(".docx");
        if (!isDocx(cameraReadyFile)) {
            return actionError("Strict Policy: Camera-ready manuscript must be in .docx format.");
        }

        if (!copyrightFile || copyrightFile.size === 0) {
            return actionError("Signed copyright transfer form is mandatory for final publication.");
        }

        const isDocxOrPdf = (f: File) => f.name.toLowerCase().endsWith(".docx") || f.name.toLowerCase().endsWith(".pdf");
        if (!isDocxOrPdf(copyrightFile)) {
            return actionError("Copyright form must be a .docx or .pdf file.");
        }

        // 1. Transactional DB commit
        const txResult = await db.transaction(async (tx) => {
            const versionsArr = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            if (!versionsArr.length) throw new Error("Original manuscript version not found.");
            const latest = versionsArr[0]!;
            const nextVersion = latest.versionNumber + 1;

            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId,
                versionNumber: nextVersion,
                title: latest.title,
                abstract: latest.abstract,
                keywords: latest.keywords,
                changelog: "Camera-ready final manuscript package submitted.",
            });
            const verId = versionInsert.insertId;

            const timestamp = Date.now();
            const cReadyName = `cameraready_${submissionId}_v${nextVersion}_${timestamp}.${cameraReadyFile.name.split('.').pop()}`;
            const cReadyUrl = `/api/files/submissions/${cReadyName}`;

            const crName = `copyright_${submissionId}_${timestamp}.${copyrightFile.name.split('.').pop()}`;
            const crUrl = `/api/files/submissions/${crName}`;

            const filesToInsert: (typeof submissionFiles.$inferInsert)[] = [
                {
                    versionId: verId,
                    fileType: "mainManuscript",
                    fileUrl: cReadyUrl,
                    originalName: cameraReadyFile.name,
                    fileSize: cameraReadyFile.size,
                },
                {
                    versionId: verId,
                    fileType: "copyrightForm",
                    fileUrl: crUrl,
                    originalName: copyrightFile.name,
                    fileSize: copyrightFile.size,
                }
            ];

            let pReceiptName: string | null = null;
            if (paymentReceiptFile && paymentReceiptFile.size > 0) {
                pReceiptName = `payment_proof_${submissionId}_${timestamp}.${paymentReceiptFile.name.split('.').pop()}`;
                const pReceiptUrl = `/api/files/submissions/${pReceiptName}`;
                filesToInsert.push({
                    versionId: verId,
                    fileType: "paymentProof",
                    fileUrl: pReceiptUrl,
                    originalName: paymentReceiptFile.name,
                    fileSize: paymentReceiptFile.size,
                });
            }

            await tx.insert(submissionFiles).values(filesToInsert);

            // Handle payment transaction record if UTR or receipt is provided
            if (utrNumber || (paymentReceiptFile && paymentReceiptFile.size > 0)) {
                const existingPay = await tx.select({ id: payments.id })
                    .from(payments)
                    .where(eq(payments.submissionId, submissionId))
                    .limit(1);

                if (existingPay.length > 0) {
                    await tx.update(payments)
                        .set({
                            transactionId: utrNumber || sql`transaction_id`,
                            status: 'pending'
                        })
                        .where(eq(payments.id, existingPay[0]!.id));
                } else {
                    await tx.insert(payments).values({
                        submissionId,
                        amount: "2500.00",
                        currency: "INR",
                        status: "pending",
                        transactionId: utrNumber || null,
                    });
                }
            }

            // Update submission timestamp
            await tx.update(submissions)
                .set({ updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            return { cReadyName, crName, pReceiptName, nextVersion };
        });

        // 2. Storage operations
        const cReadyPath = `submissions/${txResult.cReadyName}`;
        const cReadyBuf = Buffer.from(await cameraReadyFile.arrayBuffer());
        await uploadFileToStorage(cReadyPath, cReadyBuf, cameraReadyFile.name);
        fileCleanup.push(cReadyPath);

        const crPath = `submissions/${txResult.crName}`;
        const crBuf = Buffer.from(await copyrightFile.arrayBuffer());
        await uploadFileToStorage(crPath, crBuf, copyrightFile.name);
        fileCleanup.push(crPath);

        if (txResult.pReceiptName && paymentReceiptFile && paymentReceiptFile.size > 0) {
            const pReceiptPath = `submissions/${txResult.pReceiptName}`;
            const pReceiptBuf = Buffer.from(await paymentReceiptFile.arrayBuffer());
            await uploadFileToStorage(pReceiptPath, pReceiptBuf, paymentReceiptFile.name);
            fileCleanup.push(pReceiptPath);
        }

        // 3. Log event
        await logSubmissionEvent({
            submissionId,
            eventType: "copyright_uploaded",
            description: "Final camera-ready manuscript and signed copyright agreement submitted by author.",
            metadata: { utrNumber: utrNumber || null }
        });

        // 4. Notify admin staff
        try {
            const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
            await Promise.allSettled(
                adminUsers.map(a =>
                    createNotification({
                        userId: a.id,
                        type: "submission_created",
                        priority: "high",
                        message: `Final camera-ready manuscript & copyright submitted for ${paperId}`,
                        actionLink: `/admin/submissions/${submissionId}`,
                        metadata: { submissionId, paperId }
                    })
                )
            );
        } catch (notifErr) {
            console.error("Failed to notify staff of final submission package:", notifErr);
        }

        // 5. Invalidation
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);
        revalidatePath('/submit');
        revalidatePath('/track');
        revalidatePath(`/admin/submissions/${submissionId}`);
        revalidatePath(`/editor/submissions/${submissionId}`);

        return actionSuccess({ paperId });
    } catch (error) {
        console.error("submitPublicFinalSubmission error:", error);
        for (const filePath of fileCleanup) {
            await safeDeleteFile(filePath).catch(() => {});
        }
        return serverError(error, "submit final camera-ready package");
    }
}

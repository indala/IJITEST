"use server";
import "server-only"

import { db } from "@/lib/db";
import { sql, eq, and, desc, inArray, count } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { invalidateReviewerAssignmentsCount, invalidateSubmittedSubmissionsCount, invalidateAuthorActionsCount, createNotification } from "./notifications";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { 
    reviewAssignments,
    reviews,
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
    userInvitations,
    sections,
    reviewerSuggestions,
} from "@/db/schema";
import { logSubmissionEvent } from "./event-log";

import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { 
    uploadFileToStorage, 
    triggerDocxToPdfConversion 
} from "@/lib/fs-utils";

import { type ActiveReview, type UnassignedPaper, type ReviewerPerformanceMetrics } from "@/db/types";
import { type ActionResponse, serverError } from "@/lib/action-response";

/**
 * Assign a reviewer to a submission.
 * Enforces a strict limit of 6 reviewers per submission.
 */
export async function assignReviewer(formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized: Admin or Editor access required." };
    }

    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerId = formData.get('reviewerId') as string;
    const deadline = formData.get('deadline') as string;
    const assignedBy = session.user.id;
    const pdfFile = formData.get('pdfFile') as File;

    try {
        const txResult = await db.transaction(async (tx) => {
            // 1. Max 6 reviewers check (Total assignments for this submission)
            const [totalAssignments] = await tx.select({ value: count() })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, submissionId));

            if ((totalAssignments?.value || 0) >= 6) {
                return { success: false, error: "Maximum of 6 reviewers have already been assigned to this submission." };
            }

            // 2. Conflict of interest check (Check reviewer institute against ALL co-authors)
            const [reviewerProfile] = await tx.select({ institute: userProfiles.institute })
                .from(userProfiles)
                .where(eq(userProfiles.userId, reviewerId))
                .limit(1);

            const authors = await tx.select({
                name: submissionAuthors.name,
                institution: submissionAuthors.institution
            })
                .from(submissionAuthors)
                .where(eq(submissionAuthors.submissionId, submissionId));

            if (reviewerProfile?.institute && reviewerProfile.institute.trim() !== '') {
                const reviewerInst = reviewerProfile.institute.trim().toLowerCase();
                const conflict = authors.find(a => a.institution && a.institution.trim().toLowerCase() === reviewerInst);
                if (conflict) {
                    return {
                        success: false,
                        error: `Conflict of Interest Detected: Reviewer belongs to the same institution ("${reviewerProfile.institute}") as author ${conflict.name}.`
                    };
                }
            }

            // 3. Version & Round Check
            const latestVersions = await tx.select()
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            if (!latestVersions.length) return { success: false, error: "Submission version not found." };
            const version = latestVersions[0];
            if (!version) return { success: false, error: "Submission version not found." };

            const currentRound = version.versionNumber || 1;

            // 4. Duplicate check in the current round
            const existing = await tx.select()
                .from(reviewAssignments)
                .where(and(
                    eq(reviewAssignments.submissionId, submissionId),
                    eq(reviewAssignments.reviewerId, reviewerId),
                    eq(reviewAssignments.reviewRound, currentRound)
                ));

            if (existing.length > 0) {
                return { success: false, error: `This reviewer is already assigned to Round ${currentRound} of this submission.` };
            }

            // 5. PDF copy for reviewer
            let pdfUrl: string | null = null;
            const existingPdfs = await tx.select()
                .from(submissionFiles)
                .where(and(
                    eq(submissionFiles.versionId, version.id),
                    eq(submissionFiles.fileType, 'pdfVersion')
                ))
                .limit(1);

            if (pdfFile && pdfFile.size > 0) {
                const bytes = await pdfFile.arrayBuffer();
                const fileName = `reviewer_copy_${submissionId}_${Date.now()}.pdf`;
                const relativePdfPath = `submissions/${fileName}`;
                await uploadFileToStorage(relativePdfPath, Buffer.from(bytes), pdfFile.name);
                pdfUrl = `/api/files/${relativePdfPath}`;

                await tx.insert(submissionFiles).values({
                    versionId: version.id,
                    fileType: 'pdfVersion',
                    fileUrl: pdfUrl,
                    originalName: 'reviewer_manuscript.pdf',
                    fileSize: pdfFile.size
                });
            } else if (existingPdfs.length > 0) {
                const existingPdf = existingPdfs[0];
                if (existingPdf) {
                    pdfUrl = existingPdf.fileUrl;
                }
            } else {
                // 3.4 Double-Blind Manuscript Anonymization: Prioritize blinded manuscript if present
                const blindedFiles = await tx.select()
                    .from(submissionFiles)
                    .where(and(
                        eq(submissionFiles.versionId, version.id),
                        eq(submissionFiles.fileType, 'blindedManuscript')
                    ))
                    .limit(1);

                const manuscript = blindedFiles[0] || (await tx.select()
                    .from(submissionFiles)
                    .where(and(
                        eq(submissionFiles.versionId, version.id),
                        eq(submissionFiles.fileType, 'mainManuscript')
                    ))
                    .limit(1))[0];

                if (!manuscript) return { success: false, error: "No manuscript file available." };

                if (manuscript.fileUrl.toLowerCase().endsWith('.pdf')) {
                    pdfUrl = manuscript.fileUrl;
                } else {
                    // Convert DOCX to PDF using iLovePDF via storage service
                    try {
                        const fileName = `converted_${submissionId}_${Date.now()}.pdf`;
                        pdfUrl = `/api/files/submissions/${fileName}`;
                        const fileSize = await triggerDocxToPdfConversion(manuscript.fileUrl, pdfUrl);

                        await tx.insert(submissionFiles).values({
                            versionId: version.id,
                            fileType: 'pdfVersion',
                            fileUrl: pdfUrl,
                            originalName: manuscript.fileType === 'blindedManuscript' ? 'blinded_reviewer_manuscript.pdf' : 'system_converted_pdf.pdf',
                            fileSize: fileSize
                        });
                    } catch (err: unknown) {
                        console.error("docx to pdf conversion error:", err);
                        return { success: false, error: "PDF Conversion failed. Please upload a PDF manually." };
                    }
                }
            }

            // 6. Record Assignment — all reviewers assigned together share the same review round
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const invitationExpires = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days

            await tx.insert(reviewAssignments).values({
                submissionId,
                reviewerId,
                versionId: version.id,
                assignedBy,
                reviewRound: currentRound,
                status: 'assigned',
                deadline: new Date(deadline),
                assignedAt: new Date(),
                invitationToken,
                invitationTokenExpiresAt: invitationExpires,
            });

            // 7. Update Submission Status
            await tx.update(submissions)
                .set({ status: 'underReview', updatedAt: new Date() })
                .where(eq(submissions.id, submissionId));

            // 8. Fetch notification data (no email inside transaction)
            const [staff] = await tx.select({
                email: users.email,
                name: userProfiles.fullName,
                isVerified: users.isEmailVerified,
                hasPassword: sql<boolean>`${users.passwordHash} IS NOT NULL`
            })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(eq(users.id, reviewerId))
                .limit(1);

            let setupUrl: string | undefined = undefined;
            if (staff && (!staff.isVerified || !staff.hasPassword)) {
                const invitationToken = crypto.randomBytes(32).toString('hex');
                const expires = new Date();
                expires.setHours(expires.getHours() + 168); // 7 days

                await tx.insert(userInvitations).values({
                    email: staff.email,
                    role: 'reviewer',
                    token: invitationToken,
                    expiresAt: expires,
                }).onDuplicateKeyUpdate({
                    set: { token: invitationToken, expiresAt: expires }
                });

                const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000';
                setupUrl = `${baseUrl}/auth/setup-password?token=${invitationToken}`;
            }

            const [paper] = await tx.select({ paperId: submissions.paperId, title: submissionVersions.title })
                .from(submissions)
                .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
                .where(eq(submissions.id, submissionId))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1);

            return { success: true, staff, paper, setupUrl };
        });

        if (!txResult.success) {
            return { success: false, error: txResult.error || "Failed to assign reviewer." };
        }

        // 9. Send email & in-app notification AFTER transaction commits (fire-and-forget)
        if (txResult.staff?.email && txResult.paper) {
            const template = await emailTemplates.reviewAssignment(
                txResult.staff.name || "Reviewer",
                txResult.paper.title,
                deadline,
                txResult.paper.paperId,
                txResult.setupUrl
            );
            sendEmail({ to: txResult.staff.email, subject: template.subject, html: template.html })
                .catch(e => console.error("Reviewer assignment email failed:", e));
        }

        if (txResult.paper) {
            await createNotification({
                userId: reviewerId,
                createdByUserId: assignedBy,
                type: "review_assigned",
                priority: "high",
                message: `You have been assigned to review manuscript ${txResult.paper.paperId}: "${txResult.paper.title}"`,
                actionLink: `/reviewer/reviews`,
                metadata: { submissionId, paperId: txResult.paper.paperId }
            });

            await logSubmissionEvent({
                submissionId,
                eventType: 'reviewer_invited',
                userId: session.user.id,
                description: `Reviewer invited: ${txResult.staff?.name || txResult.staff?.email || 'Reviewer'} (Deadline: ${deadline}).`,
                metadata: {
                    reviewerId,
                    deadline,
                }
            });
        }

        await invalidateReviewerAssignmentsCount(reviewerId);
        await invalidateSubmittedSubmissionsCount();
        updateTag(CACHE_TAGS.SUBMISSION(submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);
        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error) {
        console.error("Assign Reviewer Error:", error);
        return serverError(error, "assign reviewer");
    }
}

/**
 * Reviewer submits a completed review decision and comments.
 */
export async function submitReview(assignmentId: number, formData: FormData): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'reviewer') {
        return { success: false, error: "Unauthorized: Reviewer access required." };
    }

    const decision = formData.get('decision') as "accept" | "reject" | "minorRevision" | "majorRevision";
    const commentsToAuthor = formData.get('commentsToAuthor') as string;
    const commentsToEditor = formData.get('commentsToEditor') as string;
    const score = formData.get('score') ? parseInt(formData.get('score') as string) : null;
    const confidence = formData.get('confidence') ? parseInt(formData.get('confidence') as string) : null;
    const feedbackFile = formData.get('feedbackFile') as File | null;

    const rubricRaw = formData.get('rubricData') as string | null;
    let rubricData: {
        originality: number;
        methodology: number;
        clarity: number;
        literatureReview: number;
        remarks?: string;
    } | null = null;

    if (rubricRaw) {
        try {
            rubricData = JSON.parse(rubricRaw);
        } catch {}
    } else {
        const orig = parseInt(formData.get('rubricOriginality') as string);
        const meth = parseInt(formData.get('rubricMethodology') as string);
        const clar = parseInt(formData.get('rubricClarity') as string);
        const lit = parseInt(formData.get('rubricLiteratureReview') as string);
        const rem = formData.get('rubricRemarks') as string | null;
        if (!isNaN(orig) && !isNaN(meth) && !isNaN(clar) && !isNaN(lit)) {
            rubricData = {
                originality: orig,
                methodology: meth,
                clarity: clar,
                literatureReview: lit,
                ...(rem ? { remarks: rem } : {})
            };
        }
    }

    try {
        let fileUrl: string | null = null;
        if (feedbackFile && feedbackFile.size > 0) {
            const bytes = await feedbackFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `feedback_${Date.now()}_${feedbackFile.name.replaceAll(' ', '_')}`;
            const relativeFeedbackPath = `submissions/${fileName}`;
            await uploadFileToStorage(relativeFeedbackPath, buffer, feedbackFile.name);
            fileUrl = `/api/files/${relativeFeedbackPath}`;
        }

        const result = await db.transaction(async (tx) => {
            // 1. Get Assignment Details
            const rows = await tx.select({
                submissionId: reviewAssignments.submissionId,
                versionId: reviewAssignments.versionId,
                assignmentStatus: reviewAssignments.status,
                paperId: submissions.paperId,
                title: submissionVersions.title,
                authorEmail: users.email,
                authorName: userProfiles.fullName,
                reviewerId: reviewAssignments.reviewerId,
                correspondingAuthorId: submissions.correspondingAuthorId
            })
                .from(reviewAssignments)
                .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
                .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
                .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .where(eq(reviewAssignments.id, assignmentId))
                .limit(1);

            if (!rows.length) throw new Error("Review assignment not found.");
            const info = rows[0];
            if (!info) throw new Error("Review assignment not found.");

            // Verify this reviewer owns the assignment
            if (info.reviewerId !== session.user.id) {
                throw new Error("Unauthorized: This assignment does not belong to you.");
            }

            // Guard against double submission
            if (info.assignmentStatus === 'completed') {
                throw new Error("This review has already been submitted.");
            }

            // 2. Insert/Update Review
            await tx.insert(reviews).values({
                assignmentId,
                decision,
                score,
                confidence,
                rubricData,
                commentsToAuthor,
                commentsToEditor,
                submittedAt: new Date()
            }).onDuplicateKeyUpdate({
                set: {
                    decision,
                    score,
                    confidence,
                    rubricData,
                    commentsToAuthor,
                    commentsToEditor,
                    submittedAt: new Date()
                }
            });

            // 3. Update Assignment Status
            await tx.update(reviewAssignments)
                .set({ status: 'completed', respondedAt: new Date() })
                .where(eq(reviewAssignments.id, assignmentId));

            // 4. Handle Feedback File if exists
            if (fileUrl) {
                await tx.insert(submissionFiles).values({
                    versionId: info.versionId,
                    fileType: 'feedback',
                    fileUrl,
                    originalName: feedbackFile?.name || 'feedback.pdf',
                    fileSize: feedbackFile?.size || 0
                });
            }

            return { success: true, info };
        });

        // 6. Asynchronous Notifications (Outside Transaction)
        if (result.success && result.info) {
            const { info } = result;
            const admins = await db.select({ id: users.id, email: users.email }).from(users).where(inArray(users.role, ['admin', 'editor']));
            
            const decisionLabels: Record<string, string> = {
                accept: 'Accept',
                reject: 'Reject',
                minorRevision: 'Minor Revision',
                majorRevision: 'Major Revision'
            };
            const label = decisionLabels[decision] || decision;

            const staffAlert = await emailTemplates.reviewCompleted(
                "Editor",
                session.user.name || "Reviewer",
                info.title,
                info.paperId,
                label,
                info.submissionId
            );

            await Promise.allSettled(admins.map(async (a) => {
                // In-app Notification
                await createNotification({
                    userId: a.id,
                    createdByUserId: session.user.id,
                    type: "review_completed",
                    priority: "medium",
                    message: `Review completed for ${info.paperId}: recommendation of '${label}' by Reviewer`,
                    actionLink: `/admin/submissions/${info.submissionId}`,
                    metadata: { submissionId: info.submissionId, paperId: info.paperId }
                });

                // Email
                return sendEmail({
                    to: a.email,
                    subject: staffAlert.subject,
                    html: staffAlert.html
                });
            }));
            await logSubmissionEvent({
                submissionId: result.info.submissionId,
                eventType: 'review_submitted',
                userId: session.user.id,
                description: `Peer review evaluation submitted (${label}, Score: ${score}/10).`,
                metadata: {
                    decision,
                    score,
                    confidence,
                }
            });
        }

        await invalidateReviewerAssignmentsCount(result.info.reviewerId);
        if (result.info.correspondingAuthorId) {
            await invalidateAuthorActionsCount(result.info.correspondingAuthorId);
        }
        updateTag(CACHE_TAGS.SUBMISSION(result.info.submissionId));
        updateTag(CACHE_TAGS.SUBMISSIONS);
        revalidatePath('/admin/reviews');
        revalidatePath('/reviewer/reviews');
        return { success: true };

    } catch (error) {
        console.error("Submit Review Error:", error);
        return serverError(error, "submit review");
    }
}

/**
 * Fetch all review assignments with joined submission data.
 */
export async function getActiveReviews(reviewerId?: string): Promise<ActionResponse<ActiveReview[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required." };

        // If a specific reviewer is requested, ensure requester is admin/editor OR the reviewer themselves
        if (reviewerId && session.user.role !== 'admin' && session.user.role !== 'editor' && session.user.id !== reviewerId) {
            return { success: false, error: "Unauthorized" };
        }
        const manuscriptSubquery = db.select({
            manuscriptUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('manuscriptUrl'),
            versionId: submissionFiles.versionId
        })
            .from(submissionFiles)
            .where(eq(submissionFiles.fileType, 'pdfVersion'))
            .groupBy(submissionFiles.versionId)
            .as('ms');

        const feedbackSubquery = db.select({
            feedbackUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('feedbackUrl'),
            versionId: submissionFiles.versionId
        })
            .from(submissionFiles)
            .where(eq(submissionFiles.fileType, 'feedback'))
            .groupBy(submissionFiles.versionId)
            .as('fs');

        let query = db.select({
            id: reviewAssignments.id,
            status: reviewAssignments.status,
            assignedAt: reviewAssignments.assignedAt,
            deadline: reviewAssignments.deadline,
            reviewRound: reviewAssignments.reviewRound,
            submissionId: reviewAssignments.submissionId,
            paperId: submissions.paperId,
            submissionStatus: submissions.status,
            title: submissionVersions.title,
            reviewerName: userProfiles.fullName,
            reviewId: reviews.id,
            decision: reviews.decision,
            editorRating: reviews.editorRating,
            editorRatingRemarks: reviews.editorRatingRemarks,
            commentsToAuthor: reviews.commentsToAuthor,
            submittedAt: reviews.submittedAt,
            manuscriptPath: manuscriptSubquery.manuscriptUrl,
            feedbackFilePath: feedbackSubquery.feedbackUrl
        })
            .from(reviewAssignments)
            .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
            .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
            .leftJoin(userProfiles, eq(reviewAssignments.reviewerId, userProfiles.userId))
            .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId))
            .leftJoin(manuscriptSubquery, eq(reviewAssignments.versionId, manuscriptSubquery.versionId))
            .leftJoin(feedbackSubquery, eq(reviewAssignments.versionId, feedbackSubquery.versionId))
            .$dynamic();

        if (reviewerId) {
            query = query.where(eq(reviewAssignments.reviewerId, reviewerId));
        }

        const rows = await query.orderBy(desc(reviewAssignments.assignedAt)).limit(200);
        return { success: true, data: rows as ActiveReview[] };
    } catch (error) {
        console.error("Get Reviews Error:", error);
        return serverError(error, "fetch review assignments");
    }
}

/**
 * Get papers that are ready to be assigned to reviewers.
 */
export async function getUnassignedAcceptedPapers(): Promise<ActionResponse<UnassignedPaper[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
            .from(submissionVersions)
            .groupBy(submissionVersions.submissionId)
            .as('lv');

        const manuscriptPaths = db.select({
            versionId: submissionFiles.versionId,
            pdfUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('pdfUrl')
        })
            .from(submissionFiles)
            .where(eq(submissionFiles.fileType, 'pdfVersion'))
            .groupBy(submissionFiles.versionId)
            .as('mp');

        const blindedSubquery = db.select({
            versionId: submissionFiles.versionId,
            blindedCount: count().as('blinded_count')
        })
            .from(submissionFiles)
            .where(eq(submissionFiles.fileType, 'blindedManuscript'))
            .groupBy(submissionFiles.versionId)
            .as('bs');

        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            pdfUrl: manuscriptPaths.pdfUrl,
            isBlinded: sql<boolean>`COALESCE(${blindedSubquery.blindedCount}, 0) > 0`,
            sectionTitle: sections.title
        })
            .from(submissions)
            .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
            .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
            .leftJoin(manuscriptPaths, eq(submissionVersions.id, manuscriptPaths.versionId))
            .leftJoin(blindedSubquery, eq(submissionVersions.id, blindedSubquery.versionId))
            .where(and(
                inArray(submissions.status, ['submitted', 'editorAssigned', 'underReview', 'revisionRequested']),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion)
            ));

        // Fetch author reviewer suggestions for these papers
        const subIds = rows.map(r => r.id);
        const suggestions = subIds.length > 0 
            ? await db.select().from(reviewerSuggestions).where(inArray(reviewerSuggestions.submissionId, subIds))
            : [];

        const suggestionsMap = new Map<number, typeof suggestions>();
        for (const s of suggestions) {
            const list = suggestionsMap.get(s.submissionId) || [];
            list.push(s);
            suggestionsMap.set(s.submissionId, list);
        }

        const enriched: UnassignedPaper[] = rows.map(r => ({
            ...r,
            sectionTitle: r.sectionTitle || null,
            reviewerSuggestions: suggestionsMap.get(r.id) || []
        }));

        return { success: true, data: enriched };
    } catch (error) {
        console.error("Get Unassigned Error:", error);
        return serverError(error, "fetch review details");
    }
}

/**
 * Respond to a review invitation using a secure one-click token
 */
export async function respondToReviewInvitation(
    token: string,
    action: 'accept' | 'decline',
    declineReason?: string
): Promise<ActionResponse<{ paperId: string; title: string; deadline: string | null }>> {
    try {
        const rows = await db.select({
            id: reviewAssignments.id,
            status: reviewAssignments.status,
            expiresAt: reviewAssignments.invitationTokenExpiresAt,
            submissionId: reviewAssignments.submissionId,
            deadline: reviewAssignments.deadline,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            reviewerId: reviewAssignments.reviewerId,
            reviewerName: userProfiles.fullName,
            reviewerEmail: users.email
        })
            .from(reviewAssignments)
            .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
            .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
            .innerJoin(users, eq(reviewAssignments.reviewerId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(reviewAssignments.invitationToken, token))
            .limit(1);

        const assignment = rows[0];
        if (!assignment) {
            return { success: false, error: "Invalid or expired review invitation token." };
        }

        if (assignment.expiresAt && new Date() > new Date(assignment.expiresAt)) {
            return { success: false, error: "This review invitation has expired. Please contact the editorial office." };
        }

        if (assignment.status === 'completed') {
            return { success: false, error: "This review has already been submitted." };
        }

        const newStatus = action === 'accept' ? 'accepted' : 'declined';
        await db.update(reviewAssignments)
            .set({
                status: newStatus,
                respondedAt: new Date(),
                declineReason: action === 'decline' ? (declineReason || 'Declined by reviewer') : null
            })
            .where(eq(reviewAssignments.id, assignment.id));

        await logSubmissionEvent({
            submissionId: assignment.submissionId,
            eventType: action === 'accept' ? 'reviewer_accepted' : 'reviewer_declined',
            userId: assignment.reviewerId,
            description: action === 'accept'
                ? `Reviewer ${assignment.reviewerName || assignment.reviewerEmail} accepted the invitation.`
                : `Reviewer ${assignment.reviewerName || assignment.reviewerEmail} declined the invitation${declineReason ? `: "${declineReason}"` : '.'}`,
            metadata: {
                reviewerId: assignment.reviewerId,
                declineReason: action === 'decline' ? declineReason : undefined,
            }
        });

        return {
            success: true,
            data: {
                paperId: assignment.paperId,
                title: assignment.title,
                deadline: assignment.deadline ? String(assignment.deadline) : null
            }
        };
    } catch (error) {
        return serverError(error, "respond to review invitation");
    }
}

/**
 * Rate a completed review assignment (1-5 stars) and add confidential feedback.
 */
export async function rateReview(
    assignmentId: number,
    rating: number,
    remarks?: string
): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized: Editor or Admin role required." };
        }

        if (rating < 1 || rating > 5) {
            return { success: false, error: "Rating must be between 1 and 5 stars." };
        }

        const assignment = await db.select()
            .from(reviewAssignments)
            .where(eq(reviewAssignments.id, assignmentId))
            .limit(1);

        if (!assignment.length || !assignment[0]) {
            return { success: false, error: "Review assignment not found." };
        }

        await db.update(reviews)
            .set({
                editorRating: rating,
                editorRatingRemarks: remarks || null,
                ratedAt: new Date()
            })
            .where(eq(reviews.assignmentId, assignmentId));

        revalidatePath('/admin/reviews');
        revalidatePath('/editor/reviews');
        return { success: true };
    } catch (error) {
        console.error("Rate Review Error:", error);
        return serverError(error, "rate review");
    }
}

/**
 * Aggregate reviewer performance statistics (completed count, average rating, turnaround time).
 */
export async function getReviewerMetrics(): Promise<ActionResponse<Record<string, ReviewerPerformanceMetrics>>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Authentication required." };

        const rows = await db.select({
            reviewerId: reviewAssignments.reviewerId,
            completedCount: sql<number>`COUNT(CASE WHEN ${reviewAssignments.status} = 'completed' THEN 1 END)`,
            avgRating: sql<number | null>`AVG(${reviews.editorRating})`,
            avgDays: sql<number | null>`AVG(DATEDIFF(${reviews.submittedAt}, ${reviewAssignments.assignedAt}))`
        })
            .from(reviewAssignments)
            .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId))
            .groupBy(reviewAssignments.reviewerId);

        const metricsMap: Record<string, ReviewerPerformanceMetrics> = {};
        for (const row of rows) {
            metricsMap[row.reviewerId] = {
                userId: row.reviewerId,
                completedReviewsCount: Number(row.completedCount) || 0,
                averageRating: row.avgRating !== null ? Number(Number(row.avgRating).toFixed(1)) : null,
                averageTurnaroundDays: row.avgDays !== null ? Math.round(Number(row.avgDays)) : null
            };
        }

        return { success: true, data: metricsMap };
    } catch (error) {
        console.error("Get Reviewer Metrics Error:", error);
        return serverError(error, "fetch reviewer metrics");
    }
}

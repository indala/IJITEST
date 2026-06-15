import 'server-only'
import { db } from "./db";
import { reviewAssignments, submissions, submissionVersions, users, userProfiles } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { sendEmail, emailTemplates } from "./mail";
import { createNotification } from "@/actions/notifications";

/**
 * Scan all active peer review assignments and send email and in-app reminders/escalations
 * based on the deadline date set by editors/admins.
 */
export async function processReviewReminders() {
    console.log("Starting peer review deadline reminder scan...");
    
    // 1. Fetch pending review assignments for active papers
    const activeAssignments = await db.select({
        id: reviewAssignments.id,
        status: reviewAssignments.status,
        deadline: reviewAssignments.deadline,
        lastReminderSentAt: reviewAssignments.lastReminderSentAt,
        reminderCount: reviewAssignments.reminderCount,
        submissionId: reviewAssignments.submissionId,
        reviewerId: reviewAssignments.reviewerId,
        assignedById: reviewAssignments.assignedBy,
        
        reviewerEmail: users.email,
        reviewerName: userProfiles.fullName,
        
        paperId: submissions.paperId,
        paperTitle: submissionVersions.title,
    })
    .from(reviewAssignments)
    .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
    .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
    .innerJoin(users, eq(reviewAssignments.reviewerId, users.id))
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .where(
        and(
            inArray(reviewAssignments.status, ['assigned', 'accepted']),
            inArray(submissions.status, ['submitted', 'editorAssigned', 'underReview', 'revisionRequested'])
        )
    );

    console.log(`Found ${activeAssignments.length} active review assignments to evaluate.`);

    let remindersSentCount = 0;
    let escalationsSentCount = 0;
    
    const today = new Date();

    for (const assignment of activeAssignments) {
        if (!assignment.deadline) continue;
        
        const deadlineDate = new Date(assignment.deadline);

        // Normalize dates to midnight local time for accurate day-difference calculation
        const deadlineNormalized = new Date(deadlineDate.getFullYear(), deadlineDate.getMonth(), deadlineDate.getDate());
        const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // Calculate differences in days
        const diffTime = deadlineNormalized.getTime() - todayNormalized.getTime();
        const diffInDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Skip if a reminder was already sent today to prevent duplicate sends
        if (assignment.lastReminderSentAt) {
            const lastSent = new Date(assignment.lastReminderSentAt);
            const lastSentNormalized = new Date(lastSent.getFullYear(), lastSent.getMonth(), lastSent.getDate());
            if (lastSentNormalized.getTime() === todayNormalized.getTime()) {
                console.log(`Skipping assignment ID ${assignment.id} - reminder already sent today.`);
                continue;
            }
        }

        let sendReviewerReminder = false;
        let sendEditorEscalation = false;

        // Determine reminder triggers based on days remaining
        if (diffInDays === 3 || diffInDays === 1 || diffInDays === 0) {
            // Gentle reminders: 3 days remaining, 1 day remaining, or on the deadline day
            sendReviewerReminder = true;
        } else if (diffInDays < 0) {
            // Overdue review assignments
            const overdueDays = Math.abs(diffInDays);
            
            // Remind reviewer every 3 days late
            if (overdueDays % 3 === 0) {
                sendReviewerReminder = true;
            }
            
            // Escalate to editor at 3 days late and 7 days late
            if (overdueDays === 3 || overdueDays === 7) {
                sendEditorEscalation = true;
            }
        }

        if (sendReviewerReminder) {
            console.log(`Sending reminder to reviewer ${assignment.reviewerEmail} for paper ${assignment.paperId} (diff: ${diffInDays} days).`);
            
            // Send email
            const template = emailTemplates.reviewDeadlineReminder(
                assignment.reviewerName || "Reviewer",
                assignment.paperTitle,
                assignment.paperId,
                diffInDays,
                assignment.deadline
            );

            await sendEmail({
                to: assignment.reviewerEmail,
                subject: template.subject,
                html: template.html
            });

            // Create in-app notification
            await createNotification({
                userId: assignment.reviewerId,
                type: "review_reminder",
                priority: diffInDays < 0 ? "high" : "medium",
                message: `Reminder: Your review for ${assignment.paperId} is ${
                    diffInDays < 0 ? `overdue by ${Math.abs(diffInDays)} days` : 
                    diffInDays === 0 ? "due today" : `due in ${diffInDays} days`
                }.`,
                actionLink: "/reviewer/reviews",
                metadata: { submissionId: assignment.submissionId, paperId: assignment.paperId }
            });

            remindersSentCount++;
        }

        if (sendEditorEscalation) {
            // Fetch editor details
            const [editor] = await db.select({
                email: users.email,
                name: userProfiles.fullName
            })
            .from(users)
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(users.id, assignment.assignedById))
            .limit(1);

            if (editor) {
                console.log(`Sending escalation to editor ${editor.email} for paper ${assignment.paperId} (late: ${Math.abs(diffInDays)} days).`);
                
                // Send email
                const template = emailTemplates.reviewOverdueEscalation(
                    editor.name || "Editor",
                    assignment.reviewerName || "Reviewer",
                    assignment.paperTitle,
                    assignment.paperId,
                    Math.abs(diffInDays),
                    assignment.deadline
                );

                await sendEmail({
                    to: editor.email,
                    subject: template.subject,
                    html: template.html
                });

                // Create in-app notification for Editor
                await createNotification({
                    userId: assignment.assignedById,
                    type: "review_escalation",
                    priority: "high",
                    message: `Escalation: Review by ${assignment.reviewerName || "Reviewer"} for manuscript ${assignment.paperId} is overdue by ${Math.abs(diffInDays)} days.`,
                    actionLink: `/admin/submissions/${assignment.submissionId}`,
                    metadata: { submissionId: assignment.submissionId, paperId: assignment.paperId }
                });

                escalationsSentCount++;
            }
        }

        // Update database if any reminder/escalation was sent
        if (sendReviewerReminder || sendEditorEscalation) {
            await db.update(reviewAssignments)
                .set({
                    lastReminderSentAt: new Date(),
                    reminderCount: assignment.reminderCount + 1
                })
                .where(eq(reviewAssignments.id, assignment.id));
        }
    }

    console.log(`Review reminder run completed. Sent ${remindersSentCount} reviewer reminders and ${escalationsSentCount} editor escalations.`);
    return { remindersSentCount, escalationsSentCount };
}

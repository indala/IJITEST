"use server";
import "server-only";

import { db } from "@/lib/db";
import { emailTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    type ActionResponse,
    type EmailTemplate,
    actionSuccess,
    actionError,
    serverError
} from "@/db/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const DEFAULT_EMAIL_TEMPLATES = [
    {
        templateKey: "SUBMISSION_ACK",
        name: "Submission Acknowledgment",
        description: "Sent to the corresponding author immediately upon submitting a new manuscript.",
        subjectTemplate: "[{{journalShortName}}] Acknowledgment of Submission: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThank you for submitting your manuscript entitled \"{{paperTitle}}\" to {{journalName}}.\n\nYour manuscript ID is {{paperId}}.\n\nOur editorial team has commenced technical screening. You may track manuscript progress through the author portal:\n{{trackUrl}}\n\nSincerely,\nEditorial Office\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "trackUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "REVIEW_INVITATION",
        name: "Reviewer Invitation",
        description: "Sent to invited peer reviewers requesting their technical evaluation.",
        subjectTemplate: "[{{journalShortName}}] Invitation to Review Manuscript: {{paperId}}",
        bodyTemplate: "Dear {{reviewerName}},\n\nBased on your expertise, the Editorial Board of {{journalName}} cordially invites you to review the following manuscript:\n\nTitle: \"{{paperTitle}}\"\nManuscript ID: {{paperId}}\nReview Deadline: {{reviewDeadline}}\n\nPlease access your reviewer portal using the link below to accept or decline the review:\n{{portalUrl}}\n\nSincerely,\nManaging Editor\n{{journalName}}",
        variables: ["reviewerName", "paperTitle", "paperId", "reviewDeadline", "portalUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "DECISION_ACCEPT",
        name: "Manuscript Acceptance",
        description: "Sent to the author when the editor formally accepts the manuscript for publication.",
        subjectTemplate: "[{{journalShortName}}] MANUSCRIPT ACCEPTANCE: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are pleased to inform you that your manuscript entitled \"{{paperTitle}}\" (ID: {{paperId}}) has been ACCEPTED for publication in {{journalName}}.\n\nTo complete publication scheduling, please proceed to your author portal:\n{{actionUrl}}\n\nCongratulations on your successful publication.\n\nSincerely,\nEditor-in-Chief\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "actionUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "DECISION_REJECT",
        name: "Manuscript Rejection",
        description: "Sent to the author when the paper is declined after peer review or initial screening.",
        subjectTemplate: "[{{journalShortName}}] Editorial Decision: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThank you for submitting your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) to {{journalName}}.\n\nAfter thorough evaluation by the editorial board and reviewers, we regret to inform you that we are unable to accept your manuscript for publication in its current form.\n\nEditorial Feedback:\n{{editorialFeedback}}\n\nWe thank you for considering {{journalName}} and wish you success with your ongoing research.\n\nSincerely,\nEditorial Board\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "editorialFeedback", "journalName", "journalShortName"],
    },
    {
        templateKey: "GALLEY_PROOF_REQUEST",
        name: "Galley Proof Review Request",
        description: "Sent to authors when typeset PDF proofs are ready for review before final publication.",
        subjectTemplate: "[{{journalShortName}}] Action Required: Galley Proof for {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nThe typeset galley proof of your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) is now ready for your final inspection.\n\nPlease review the formatted PDF and either approve it or submit typographical corrections within 48 hours:\n{{proofUrl}}\n\nSincerely,\nProduction Team\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "proofUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "PAPER_PUBLISHED",
        name: "Article Published Announcement",
        description: "Sent to authors upon publication and issue release.",
        subjectTemplate: "[{{journalShortName}}] Published & Live in Archives: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are thrilled to inform you that your research paper \"{{paperTitle}}\" (ID: {{paperId}}) is now officially PUBLISHED in Volume {{volumeNumber}}, Issue {{issueNumber}} ({{year}}).\n\nArticle Permanent Record:\n{{articleUrl}}\n\nDownload Publication Certificate:\n{{certificateUrl}}\n\nThank you for contributing your scholarly research to {{journalName}}.\n\nSincerely,\nEditor-in-Chief\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "volumeNumber", "issueNumber", "year", "articleUrl", "certificateUrl", "journalName", "journalShortName"],
    },
    {
        templateKey: "PAYMENT_VERIFIED",
        name: "APC Payment Verified",
        description: "Sent to author when Article Processing Charge is confirmed.",
        subjectTemplate: "[{{journalShortName}}] APC Payment Verified: {{paperId}}",
        bodyTemplate: "Dear {{authorName}},\n\nWe are pleased to confirm that the Article Processing Charge for your manuscript \"{{paperTitle}}\" (ID: {{paperId}}) has been verified successfully.\n\nYour article has entered the final production typesetting queue.\n\nSincerely,\nFinance & Editorial Desk\n{{journalName}}",
        variables: ["authorName", "paperTitle", "paperId", "journalName", "journalShortName"],
    },
];

/**
 * Fetch all email templates, automatically seeding defaults if none exist
 */
export async function getEmailTemplates(): Promise<ActionResponse<EmailTemplate[]>> {
    try {
        let rows = await db.select().from(emailTemplates);

        if (rows.length === 0) {
            for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
                await db.insert(emailTemplates).values({
                    templateKey: tpl.templateKey,
                    name: tpl.name,
                    description: tpl.description,
                    subjectTemplate: tpl.subjectTemplate,
                    bodyTemplate: tpl.bodyTemplate,
                    variables: tpl.variables,
                });
            }
            rows = await db.select().from(emailTemplates);
        }

        return actionSuccess(rows);
    } catch (error) {
        console.error("Get Email Templates Error:", error);
        return serverError(error, "fetch email templates");
    }
}

/**
 * Fetch an email template by its unique key
 */
export async function getEmailTemplateByKey(key: string): Promise<ActionResponse<EmailTemplate | null>> {
    try {
        const rows = await db.select().from(emailTemplates).where(eq(emailTemplates.templateKey, key)).limit(1);
        return actionSuccess(rows[0] || null);
    } catch (error) {
        console.error("Get Email Template By Key Error:", error);
        return serverError(error, "fetch email template");
    }
}

/**
 * Update an existing email template's subject and body
 */
export async function updateEmailTemplate(
    id: number,
    subjectTemplate: string,
    bodyTemplate: string
): Promise<ActionResponse<EmailTemplate>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Admin privileges required.");
        }

        if (!subjectTemplate.trim()) {
            return actionError("Subject template cannot be empty.");
        }
        if (!bodyTemplate.trim()) {
            return actionError("Body template cannot be empty.");
        }

        await db.update(emailTemplates)
            .set({
                subjectTemplate: subjectTemplate.trim(),
                bodyTemplate: bodyTemplate.trim(),
                updatedAt: new Date(),
            })
            .where(eq(emailTemplates.id, id));

        const updated = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
        revalidatePath('/admin/settings');
        return actionSuccess(updated[0]!);
    } catch (error) {
        console.error("Update Email Template Error:", error);
        return serverError(error, "update email template");
    }
}

/**
 * Reset an email template back to system default
 */
export async function resetEmailTemplate(id: number): Promise<ActionResponse<EmailTemplate>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Admin privileges required.");
        }

        const rows = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
        const current = rows[0];
        if (!current) return actionError("Template not found.");

        const def = DEFAULT_EMAIL_TEMPLATES.find(t => t.templateKey === current.templateKey);
        if (!def) return actionError("No default definition found for this template key.");

        await db.update(emailTemplates)
            .set({
                subjectTemplate: def.subjectTemplate,
                bodyTemplate: def.bodyTemplate,
                updatedAt: new Date(),
            })
            .where(eq(emailTemplates.id, id));

        const updated = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
        revalidatePath('/admin/settings');
        return actionSuccess(updated[0]!);
    } catch (error) {
        console.error("Reset Email Template Error:", error);
        return serverError(error, "reset email template");
    }
}

/**
 * Replace {{variableName}} placeholders with dynamic runtime values
 */
export function renderTemplateText(templateText: string, data: Record<string, string | number | undefined | null>): string {
    return templateText.replace(/\{\{([a-zA-Z0-9_-]+)\}\}/g, (match, varName) => {
        const val = data[varName];
        return val !== undefined && val !== null ? String(val) : match;
    });
}

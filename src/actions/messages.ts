"use server";
import "server-only"

import { db } from "@/lib/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { emailTemplates, sendEmail, sendEmailWithRetry } from "@/lib/mail";
import { checkRateLimit } from "@/lib/rate-limit";
import { getAuthorizedSession } from "@/lib/auth/guards";

import { type ContactMessageRow } from "@/db/types";
import { type ActionResponse, actionSuccess, actionError, serverError } from "@/lib/action-response";
import { insertContactSchema } from "@/db/validation";
import { invalidateMessagesCount } from "./notifications";
import {
    findMessage,
    listMessages,
    removeMessage,
    setMessageStatus,
    setMessagesStatus,
} from "@/features/messages/server/message.repository";
import type { MessageFilters, MessageStatus } from "@/features/messages/types/message.types";

/**
 * Fetch contact messages for the admin panel with filtering and search.
 */
export async function getMessages(filters?: MessageFilters): Promise<ActionResponse<ContactMessageRow[]>> {
    try {
        const session = await getAuthorizedSession(["admin", "editor"]);
        if (!session) {
            return actionError("Unauthorized access.");
        }

        const rows = await listMessages(filters);

        return actionSuccess(rows);
    } catch (error) {
        return serverError(error, 'fetch messages');
    }
}

/**
 * Update the status of a contact message.
 */
export async function updateMessageStatus(id: number, status: MessageStatus): Promise<ActionResponse> {
    try {
        const session = await getAuthorizedSession(["admin", "editor"]);
        if (!session) {
            return actionError("Unauthorized access.");
        }

        await setMessageStatus(id, status);

        await invalidateMessagesCount();
        revalidatePath('/admin/messages');
        return actionSuccess();
    } catch (error) {
        return serverError(error, "update message status");
    }
}

/**
 * Bulk update statuses for multiple messages.
 */
export async function bulkUpdateMessageStatus(ids: number[], status: MessageStatus): Promise<ActionResponse<{ count: number }>> {
    try {
        const session = await getAuthorizedSession(["admin", "editor"]);
        if (!session) {
            return actionError("Unauthorized access.");
        }

        await setMessagesStatus(ids, status);

        await invalidateMessagesCount();
        revalidatePath('/admin/messages');
        return actionSuccess({ count: ids.length });
    } catch (error) {
        return serverError(error, 'mark messages as read');
    }
}

/**
 * Delete a specific contact message.
 */
export async function deleteMessage(id: number): Promise<ActionResponse> {
    try {
        const session = await getAuthorizedSession(["admin", "editor"]);
        if (!session) {
            return actionError("Unauthorized access.");
        }

        await removeMessage(id);
        await invalidateMessagesCount();
        revalidatePath('/admin/messages');
        return actionSuccess();
    } catch (error) {
        return serverError(error, 'delete messages');
    }
}

/**
 * Admin: Reply to a contact message via email.
 */
export async function replyToMessage(id: number, replyContent: string): Promise<ActionResponse> {
    try {
        const session = await getAuthorizedSession(["admin", "editor"]);
        if (!session) {
            return actionError("Unauthorized access.");
        }

        const message = await findMessage(id);

        if (!message) return actionError("Message not found.");

        // Send the reply email
        const template = await emailTemplates.contactReply(
            message.name, 
            message.subject || 'Your Inquiry to IJITEST', 
            replyContent, 
            message.message,
            message.createdAt?.toLocaleDateString()
        );

        await sendEmail({
            to: message.email,
            subject: template.subject,
            html: template.html
        });

        // Automatically mark as resolved after replying
        await db.update(contactMessages)
            .set({ status: 'resolved' })
            .where(eq(contactMessages.id, id));

        await invalidateMessagesCount();
        revalidatePath('/admin/messages');
        return actionSuccess();
    } catch (error) {
        return serverError(error, "send reply");
    }
}

/**
 * Revert a message back to pending status.
 */
export async function revertMessageStatus(id: number): Promise<ActionResponse> {
    return updateMessageStatus(id, 'pending');
}

/**
 * Public action: Submit a contact inquiry from the website.
 */
export async function submitContactMessage(formData: FormData): Promise<ActionResponse> {
    const rawData = Object.fromEntries(formData.entries());
    const validated = insertContactSchema.safeParse(rawData);
    
    if (!validated.success) {
        return actionError(validated.error.issues[0]?.message || "Validation failed");
    }

    const { name, email, subject, message } = validated.data;
    const emailKey = String(email || "").toLowerCase().trim();

    try {
        const rate = await checkRateLimit({
            key: `contact:${emailKey}`,
            max: 5,
            windowMs: 60_000,
        });

        if (!rate.allowed) {
            return actionError(`Too many contact requests. Please wait ${rate.retryAfterSeconds} seconds and try again.`);
        }

        await db.insert(contactMessages).values({
            name,
            email,
            subject,
            message,
            status: 'pending'
        });

        await invalidateMessagesCount();

        // 1. Auto-reply to visitor (fire-and-forget)
        const receiptTemplate = await emailTemplates.contactReceipt(name || "Visitor", subject || "Inquiry");
        sendEmailWithRetry({
            to: email || "",
            subject: receiptTemplate.subject,
            html: receiptTemplate.html
        }, "contact auto-reply");

        // 2. Notify Admin (fire-and-forget)
        const adminEmail = process.env['ADMIN_EMAIL'] || process.env['SMTP_USER'];
        if (adminEmail) {
            const adminTemplate = await emailTemplates.contactInquiryAlert(
                name || "Website Visitor",
                email || "Not provided",
                subject || "Contact Form Inquiry",
                message,
                `${process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000'}/admin/messages`
            );
            sendEmailWithRetry({
                to: adminEmail,
                subject: adminTemplate.subject,
                html: adminTemplate.html
            }, "admin notification");
        }

        return actionSuccess();
    } catch (error) {
        return serverError(error, 'submit contact message');
    }
}
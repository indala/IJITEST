"use server";

import { db } from "@/lib/db";
import { contactMessages } from "@/db/schema";
import { eq, and, like, or, desc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { emailTemplates, sendEmail } from "@/lib/mail";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

import { ActionResponse } from "@/db/types";

export interface ContactMessageRow {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: 'pending' | 'resolved' | 'archived';
    createdAt: Date | null;
}

/**
 * Fetch contact messages for the admin panel with filtering and search.
 */
export async function getMessages(filters?: { status?: 'pending' | 'resolved' | 'archived', search?: string }): Promise<ActionResponse<ContactMessageRow[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized access." };
        }

        const whereConditions: import("drizzle-orm").SQL[] = [];

        if (filters?.status && (filters.status as string) !== 'all') {
            whereConditions.push(eq(contactMessages.status, filters.status));
        }

        if (filters?.search) {
            const pattern = `%${filters.search}%`;
            const searchClause = or(
                like(contactMessages.name, pattern),
                like(contactMessages.email, pattern),
                like(contactMessages.subject, pattern)
            );
            if (searchClause) {
                whereConditions.push(searchClause);
            }
        }

        const rows = await db.select({
            id: contactMessages.id,
            name: contactMessages.name,
            email: contactMessages.email,
            subject: contactMessages.subject,
            message: contactMessages.message,
            status: contactMessages.status,
            createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contactMessages.createdAt));

        return { success: true, data: rows as ContactMessageRow[] };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Messages Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Update the status of a contact message.
 */
export async function updateMessageStatus(id: number, status: 'resolved' | 'archived' | 'pending'): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(contactMessages)
            .set({ status })
            .where(eq(contactMessages.id, id));

        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Update Message Status Error:", error);
        return { success: false, error: "Failed to update record: " + message };
    }
}

/**
 * Bulk update statuses for multiple messages.
 */
export async function bulkUpdateMessageStatus(ids: number[], status: 'resolved' | 'archived' | 'pending'): Promise<ActionResponse<{ count: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized access." };
        }

        await db.update(contactMessages)
            .set({ status })
            .where(inArray(contactMessages.id, ids));

        revalidatePath('/admin/messages');
        return { success: true, data: { count: ids.length } };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Bulk Update Message Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Delete a specific contact message.
 */
export async function deleteMessage(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized access." };
        }

        await db.delete(contactMessages).where(eq(contactMessages.id, id));
        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Delete Message Error:", error);
        return { success: false, error: message };
    }
}

/**
 * Admin: Reply to a contact message via email.
 */
export async function replyToMessage(id: number, replyContent: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized access." };
        }

        const [message] = await db.select()
            .from(contactMessages)
            .where(eq(contactMessages.id, id))
            .limit(1);

        if (!message) return { success: false, error: "Message not found." };

        // Send the reply email
        const template = emailTemplates.contactReply(
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

        revalidatePath('/admin/messages');
        return { success: true };
    } catch (error) {
        console.error("Reply Message Error:", error);
        return { success: false, error: "Failed to send reply: " + (error instanceof Error ? error.message : String(error)) };
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
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const subject = formData.get('subject') as string;
    const message = formData.get('message') as string;

    if (!name || !email || !message) {
        return { success: false, error: "Name, email and message are required." };
    }

    try {
        await db.insert(contactMessages).values({
            name,
            email,
            subject,
            message,
            status: 'pending'
        });

        // 1. Auto-reply to visitor (fire-and-forget)
        const receiptTemplate = emailTemplates.contactReceipt(name, subject);
        sendEmail({
            to: email,
            subject: receiptTemplate.subject,
            html: receiptTemplate.html
        }).catch(e => console.error("Auto-reply email failed:", e));

        // 2. Notify Admin (fire-and-forget)
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        if (adminEmail) {
            const adminTemplate = emailTemplates.adminNotification(
                `New Inquiry: ${subject || 'Contact Form'}`,
                `Visitor <strong>${name}</strong> (${email}) has submitted a new inquiry:<br><br>"${message}"`
            );
            sendEmail({
                to: adminEmail,
                subject: adminTemplate.subject,
                html: adminTemplate.html
            }).catch(e => console.error("Admin notification email failed:", e));
        }

        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Submit Message Error:", error);
        return { success: false, error: message };
    }
}

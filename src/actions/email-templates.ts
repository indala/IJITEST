"use server";
import "server-only";

import { db } from "@/lib/db";
import { emailTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
    type EmailTemplate
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
    DEFAULT_EMAIL_TEMPLATES,
    syncEmailTemplates,
} from "@/lib/email-templates-core";

/**
 * Fetch all email templates, automatically seeding any missing defaults
 */
export async function getEmailTemplates(): Promise<ActionResponse<EmailTemplate[]>> {
    try {
        await syncEmailTemplates();
        const rows = await db.select().from(emailTemplates);
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
        revalidatePath('/admin/email-templates');
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
        revalidatePath('/admin/email-templates');
        return actionSuccess(updated[0]!);
    } catch (error) {
        console.error("Reset Email Template Error:", error);
        return serverError(error, "reset email template");
    }
}

import 'server-only';

import { db } from "@/lib/db";
import { emailTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { renderTemplateText } from "@/lib/utils";
import {
    JOURNAL_EMAIL_CONFIG,
    formatEmailBodyToHtml,
    mailLayout,
} from "@/lib/email-layout";

export * from './email-templates-defaults';
import { DEFAULT_EMAIL_TEMPLATES } from './email-templates-defaults';

/**
 * Ensure all DEFAULT_EMAIL_TEMPLATES exist in the database.
 * Seeds any missing templates without altering already modified ones.
 */
export async function syncEmailTemplates(): Promise<void> {
    try {
        const rows = await db.select({ key: emailTemplates.templateKey }).from(emailTemplates);
        const existingKeys = new Set(rows.map(r => r.key));

        const missing = DEFAULT_EMAIL_TEMPLATES.filter(t => !existingKeys.has(t.templateKey));
        if (missing.length > 0) {
            for (const tpl of missing) {
                await db.insert(emailTemplates).values({
                    templateKey: tpl.templateKey,
                    name: tpl.name,
                    description: tpl.description,
                    subjectTemplate: tpl.subjectTemplate,
                    bodyTemplate: tpl.bodyTemplate,
                    variables: tpl.variables,
                });
            }
        }
    } catch (e) {
        console.error("[Email Templates Sync Error]:", e);
    }
}

/**
 * Fetch and compile a template using DB overrides with default fallback.
 */
export async function getCompiledEmailTemplate(
    templateKey: string,
    data: Record<string, string | number | undefined>,
    cta?: { text: string; url: string }
): Promise<{ subject: string; html: string; text: string }> {
    const journalData: Record<string, string> = {
        journalName: JOURNAL_EMAIL_CONFIG.name,
        journalShortName: JOURNAL_EMAIL_CONFIG.shortName,
    };

    const mergedData: Record<string, string> = { ...journalData };
    for (const [k, v] of Object.entries(data)) {
        if (v !== undefined && v !== null) {
            mergedData[k] = String(v);
        }
    }

    let subjectTpl = "";
    let bodyTpl = "";

    try {
        const rows = await db
            .select()
            .from(emailTemplates)
            .where(eq(emailTemplates.templateKey, templateKey))
            .limit(1);

        if (rows[0]) {
            subjectTpl = rows[0].subjectTemplate;
            bodyTpl = rows[0].bodyTemplate;
        }
    } catch (e) {
        console.warn(`[Template DB Query Fallback] "${templateKey}":`, e);
    }

    if (!subjectTpl || !bodyTpl) {
        const def = DEFAULT_EMAIL_TEMPLATES.find(t => t.templateKey === templateKey);
        if (def) {
            subjectTpl = subjectTpl || def.subjectTemplate;
            bodyTpl = bodyTpl || def.bodyTemplate;
        }
    }

    const subject = renderTemplateText(subjectTpl, mergedData);
    const bodyText = renderTemplateText(bodyTpl, mergedData);
    const bodyHtml = formatEmailBodyToHtml(bodyText);
    const html = mailLayout(bodyHtml, cta);

    return {
        subject,
        html,
        text: bodyText,
    };
}

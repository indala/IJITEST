"use server";

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { ActionResponse, actionSuccess, actionError } from "@/db/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import fs from "fs/promises";
import path from "path";
import _ from "lodash";

const ALLOWED_SETTING_KEYS = new Set([
    'journalName', 'journalShortName', 'issnNumber', 'apcInr', 'apcUsd',
    'supportEmail', 'supportPhone', 'officeAddress', 'publisherName',
    'journalWebsite', 'apcDescription', 'templateUrl', 'copyrightUrl',
    'isPromotionActive', 'publicationFrequency', 'startingYear', 
    'publicationFormat', 'journalLanguage', 'journalSubject', 'msmeRegistration'
]);

const DEFAULT_SETTINGS: Record<string, string> = {
    journalName: 'International Journal of Innovative Trends in Engineering, Science and Technology',
    journalShortName: 'IJITEST',
    issnNumber: 'XXXX-XXXX',
    apcInr: '2500',
    apcUsd: '50',
    supportEmail: 'editor@ijitest.org',
    supportPhone: '+91 8919643590',
    officeAddress: 'Dr. Ravi babu. T\nFelix academic publications\nSrinivasa Nagar\nDeekshita plaza\nMadhurawada\nVisakhapatnam - 530048\nAndhra Pradesh\nIndia',
    publisherName: 'Felix Academic Publications',
    journalWebsite: 'www.ijitest.org',
    apcDescription: 'APC covers SJIF impact evaluation, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.',
    templateUrl: '/docs/template.docx',
    copyrightUrl: '/docs/copyright-form.docx',
    isPromotionActive: 'true',
    publicationFrequency: 'Monthly (12 Issues per year)',
    startingYear: '2026',
    publicationFormat: 'Online',
    journalLanguage: 'English',
    journalSubject: 'Engineering, Science and Technology',
    msmeRegistration: 'MSME Registered (UDYAM-AP-10-0125617)'
};

export async function getSettings(): Promise<ActionResponse<Record<string, string>>> {
    const fetchSettings = unstable_cache(
        async (): Promise<ActionResponse<Record<string, string>>> => {
            try {
                const rows = await db.select().from(settings);

                const result: Record<string, string> = { ...DEFAULT_SETTINGS };

                rows.forEach((row) => {
                    if (row.settingValue) {
                        const key = _.camelCase(row.settingKey);
                        if (ALLOWED_SETTING_KEYS.has(key)) {
                            result[key] = row.settingValue;
                        }
                    }
                });

                return actionSuccess(result);
            } catch (error) {
                console.error("Get Settings Error:", error);
                return actionError(error instanceof Error ? error.message : String(error));
            }
        },
        ['site-settings-global'],
        { tags: ['settings', 'public-data'], revalidate: 3600 }
    );

    return await fetchSettings();
}

/**
 * Utility for Server Components to get raw settings directly.
 */
export async function getSettingsData(): Promise<Record<string, string>> {
    const res = await getSettings();
    return res.data || DEFAULT_SETTINGS;
    
}

export async function updateSettings(formData: FormData): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        const entries = Array.from(formData.entries());

        // Resolve file uploads outside the transaction first
        const resolvedEntries: Array<[string, string]> = [];
        for (const [key, value] of entries) {
            if (key.startsWith('$')) continue;
            if (!ALLOWED_SETTING_KEYS.has(key)) continue; // whitelist guard

            if (value instanceof File && value.size > 0) {
                const bytes = await value.arrayBuffer();
                const fileExt = value.name.split('.').pop();
                const fileName = `${_.kebabCase(key)}.${fileExt}`;
                const uploadDir = path.join(process.cwd(), "public/docs");
                await fs.mkdir(uploadDir, { recursive: true });
                await fs.writeFile(path.join(uploadDir, fileName), Buffer.from(bytes));
                resolvedEntries.push([key, `/docs/${fileName}`]);
            } else if (value instanceof File && value.size === 0) {
                continue; // skip empty file — preserve existing
            } else {
                resolvedEntries.push([key, String(value ?? "")]);
            }
        }

        await db.transaction(async (tx) => {
            for (const [key, value] of resolvedEntries) {
                // Store as camelCase in DB as requested
                await tx.insert(settings)
                    .values({ settingKey: key, settingValue: value })
                    .onDuplicateKeyUpdate({ set: { settingValue: value } });
            }
        });

        revalidateTag('settings', {});      // Busts unstable_cache for all pages (Next.js 16 requires 2nd arg)
        revalidatePath('/', 'layout');       // Re-renders root layout + all children
        return actionSuccess();
    } catch (error) {
        console.error("Update Settings Error:", error);
        return actionError("Failed to update settings: " + (error instanceof Error ? error.message : String(error)));
    }
}

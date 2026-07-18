"use server";
import "server-only"

import { db } from "@/lib/db";
import { settings, submissions, publications } from "@/db/schema";
import { eq } from "drizzle-orm";
import { type ActionResponse, actionSuccess, actionError, serverError } from "@/db/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { uploadFileToStorage } from "@/lib/fs-utils";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";
function camelCase(str: string): string {
    return str
        .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
        .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

function kebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
}

const ALLOWED_SETTING_KEYS = new Set([
    'journalName', 'journalShortName', 'issnNumber', 'apcInr', 'apcUsd',
    'supportEmail', 'supportPhone', 'officeAddress', 'publisherName',
    'journalWebsite', 'apcDescription', 'templateUrl', 'copyrightUrl',
    'isPromotionActive', 'publicationFrequency', 'startingYear',
    'publicationFormat', 'journalLanguage', 'journalSubject', 'udyamRegistration',
    'doiPrefix'
]);

const DEFAULT_SETTINGS: Record<string, string> = {
    journalName: 'International Journal of Innovative Trends in Engineering, Science and Technology',
    journalShortName: 'IJITEST',
    issnNumber: 'XXXX-XXXX',
    apcInr: '2500',
    apcUsd: '50',
    supportEmail: 'support@ijitest.org',
    supportPhone: '+91 8919643590',
    officeAddress: 'Dr. Ravibabu T.\nAssociate Professor\nDepartment of Electronics and Communication Engineering\nMES Group of Institutions, Vizianagaram,\nAndhra Pradesh, India - 530048',
    publisherName: 'Felix Academic Publications',
    journalWebsite: 'ijitest.org',
    apcDescription: 'APC covers SJIF impact evaluation, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.',
    templateUrl: '/docs/template.docx',
    copyrightUrl: '/docs/copyright-form.docx',
    isPromotionActive: 'true',
    publicationFrequency: 'Monthly (12 Issues per year)',
    startingYear: '2026',
    publicationFormat: 'Online',
    journalLanguage: 'English',
    journalSubject: 'Multidisciplinary (Engineering, Science and Technology, Healthcare, Management Sciences)',
    udyamRegistration: 'UDYAM-AP-10-0125617',
    doiPrefix: ''
};

export async function getSettings(): Promise<ActionResponse<Record<string, string>>> {
    'use cache'
    cacheLife('hours')
    cacheTag(CACHE_TAGS.SETTINGS, CACHE_TAGS.PUBLIC_DATA)

    try {
        cacheLogger.miss(CACHE_TAGS.SETTINGS, "settings, public-data");
        const rows = await db.select().from(settings);

        const result: Record<string, string> = { ...DEFAULT_SETTINGS };

        rows.forEach((row) => {
            if (row.settingValue) {
                const key = camelCase(row.settingKey);
                if (ALLOWED_SETTING_KEYS.has(key)) {
                    result[key] = row.settingValue;
                }
            }
        });

        return actionSuccess(result);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.SETTINGS, error);
        return serverError(error, "fetch settings");
    }
}

/**
 * Utility for Server Components to get raw settings directly.
 */
export async function getSettingsData(): Promise<Record<string, string>> {
    try {
        const res = await getSettings();
        return res.data || DEFAULT_SETTINGS;
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
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
                const fileName = `${kebabCase(key)}.${fileExt}`;
                const relativeDocsPath = `docs/${fileName}`;
                await uploadFileToStorage(relativeDocsPath, Buffer.from(bytes), value.name);
                resolvedEntries.push([key, `/api/files/docs/${fileName}`]);
            } else if (value instanceof File && value.size === 0) {
                continue; // skip empty file — preserve existing
            } else {
                resolvedEntries.push([key, String(value ?? "")]);
            }
        }

        // Check if doiPrefix was provided and is not empty
        const doiPrefixEntry = resolvedEntries.find(([key]) => key === 'doiPrefix');
        const newDoiPrefix = doiPrefixEntry ? doiPrefixEntry[1].trim() : null;

        await db.transaction(async (tx) => {
            for (const [key, value] of resolvedEntries) {
                // Store as camelCase in DB as requested
                await tx.insert(settings)
                    .values({ settingKey: key, settingValue: value })
                    .onDuplicateKeyUpdate({ set: { settingValue: value } });
            }

            // If a valid DOI prefix is set, dynamically update DOIs for all publications
            if (newDoiPrefix && newDoiPrefix.startsWith("10.")) {
                // Fetch all publications and their submission paperIds
                const pubs = await tx.select({
                    id: publications.id,
                    paperId: submissions.paperId
                })
                    .from(publications)
                    .innerJoin(submissions, eq(publications.submissionId, submissions.id));

                for (const pub of pubs) {
                    const generatedDoi = `${newDoiPrefix}/${pub.paperId}`;
                    await tx.update(publications)
                        .set({ doi: generatedDoi })
                        .where(eq(publications.id, pub.id));
                }
            }
        });

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, "settings updated");
        updateTag(CACHE_TAGS.SETTINGS);           // Immediate cache expiration (Next.js 16)
        revalidatePath('/', 'layout');       // Re-renders root layout + all children
        return actionSuccess();
    } catch (error) {
        console.error("Update Settings Error:", error);
        return serverError(error, "update settings");
    }
}

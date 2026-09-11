"use server";
import "server-only"
import { cache } from "react";

import { db } from "@/lib/db";
import { settings } from "@/db/schema";
import { type ActionResponse, actionSuccess, actionError, serverError } from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { uploadFileToStorage, getStorageStats } from "@/lib/fs-utils";
import { getAggregatedCounterMetrics, getSushiStatus } from "@/lib/sushi";
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
    'doiPrefix', 'doiAssignmentMode', 'sushiPlatformId', 'sushiCustomerId'
]);

const DEFAULT_SETTINGS: Record<string, string> = {
    journalName: 'International Journal of Innovative Trends in Engineering, Science and Technology',
    journalShortName: 'IJITEST',
    issnNumber: '3139-6887',
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
    doiPrefix: '10.68139',
    doiAssignmentMode: 'manual',
    sushiPlatformId: 'ijitest',
    sushiCustomerId: '0'
};

export async function getSettings(): Promise<ActionResponse<Record<string, string>>> {
    'use cache'
    cacheLife('settings')
    cacheTag(CACHE_TAGS.SETTINGS)

    try {
        cacheLogger.miss(CACHE_TAGS.SETTINGS, "settings");
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
        // Graceful fallback to default settings so layout/SSR does not fail
        return actionSuccess({ ...DEFAULT_SETTINGS });
    }
}

const getCachedSettingsData = cache(async (): Promise<Record<string, string>> => {
    try {
        const res = await getSettings();
        return res.data || DEFAULT_SETTINGS;
    } catch {
        return { ...DEFAULT_SETTINGS };
    }
});

/**
 * Utility for Server Components to get raw settings directly.
 * Deduplicated per-request via React.cache.
 */
export async function getSettingsData(): Promise<Record<string, string>> {
    return getCachedSettingsData();
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
                let stringVal = String(value ?? "");
                if (key === 'issnNumber') {
                    stringVal = stringVal
                        .replace(/^(e-?issn:\s*)/i, '')
                        .replace(/\s*\(online\)/i, '')
                        .trim();
                }
                resolvedEntries.push([key, stringVal]);
            }
        }

        // Check if doiPrefix was provided and is not empty
        await db.transaction(async (tx) => {
            for (const [key, value] of resolvedEntries) {
                // Store as camelCase in DB as requested
                await tx.insert(settings)
                    .values({ settingKey: key, settingValue: value })
                    .onDuplicateKeyUpdate({ set: { settingValue: value } });
            }
        });

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, "settings updated");
        updateTag(CACHE_TAGS.SETTINGS);
        revalidatePath('/', 'layout');
        return actionSuccess();
    } catch (error) {
        console.error("Update Settings Error:", error);
        return serverError(error, "update settings");
    }
}


export async function togglePromotionStatus(isActive: boolean): Promise<ActionResponse<{ isPromotionActive: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        const value = isActive ? "true" : "false";

        await db.insert(settings)
            .values({ settingKey: 'isPromotionActive', settingValue: value })
            .onDuplicateKeyUpdate({ set: { settingValue: value } });

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, `promotion status toggled to ${value}`);
        updateTag(CACHE_TAGS.SETTINGS);
        revalidatePath('/', 'layout');

        return actionSuccess({ isPromotionActive: value });
    } catch (error) {
        console.error("Toggle Promotion Error:", error);
        return serverError(error, "toggle promotion status");
    }
}

/**
 * Fetch unified system telemetry (COUNTER Release 5 metrics + Storage Service health)
 */
export async function getSystemTelemetry(): Promise<ActionResponse<{
    counterMetrics: {
        totalInvestigations: number;
        uniqueInvestigations: number;
        totalRequests: number;
        uniqueRequests: number;
    };
    storageStats: {
        sizeBytes: number;
        sizeMB: number;
        fileCount: number;
    } | null;
    sushiStatus: {
        Description: string;
        Service_Active: boolean;
        Release: string;
    };
}>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        const [counterMetrics, storageStats, sushiStatus] = await Promise.all([
            getAggregatedCounterMetrics(),
            getStorageStats(),
            getSushiStatus()
        ]);

        return actionSuccess({
            counterMetrics,
            storageStats,
            sushiStatus
        });
    } catch (error) {
        console.error("Get System Telemetry Error:", error);
        return serverError(error, "fetch system telemetry");
    }
}



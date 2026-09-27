"use server";
import "server-only"
import { cache } from "react";
import {
    readJournalSettings,
    upsertSetting,
    upsertSettings,
} from "@/features/settings/server/settings.repository";

import { type ActionResponse, actionSuccess, actionError, serverError } from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, updateTag, cacheLife, cacheTag } from "next/cache";
import { uploadFileToStorage, getStorageStats } from "@/lib/fs-utils";
import { getAggregatedCounterMetrics, getSushiStatus } from "@/lib/sushi";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";
import { DEFAULT_JOURNAL_SETTINGS, type JournalSettings } from "@/db/settings-defaults";

function kebabCase(str: string): string {
    return str
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase();
}

const ALLOWED_SETTING_KEYS = new Set<string>(Object.keys(DEFAULT_JOURNAL_SETTINGS));

export async function getSettings(): Promise<ActionResponse<JournalSettings>> {
    'use cache'
    cacheLife('settings')
    cacheTag(CACHE_TAGS.SETTINGS)

    try {
        cacheLogger.miss(CACHE_TAGS.SETTINGS, "settings");
        const settings = await readJournalSettings();
        return actionSuccess(settings);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.SETTINGS, error);
        // Graceful fallback to default settings so layout/SSR does not fail
        return actionSuccess({ ...DEFAULT_JOURNAL_SETTINGS });
    }
}

const getCachedSettingsData = cache(async (): Promise<JournalSettings> => {
    try {
        const res = await getSettings();
        if (!res.success || !res.data) return { ...DEFAULT_JOURNAL_SETTINGS };
        return res.data;
    } catch {
        return { ...DEFAULT_JOURNAL_SETTINGS };
    }
});

/**
 * Utility for Server Components to get raw settings directly.
 * Deduplicated per-request via React.cache.
 */
export async function getSettingsData(): Promise<JournalSettings> {
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
        await upsertSettings(resolvedEntries);

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, "settings updated");
        updateTag(CACHE_TAGS.SETTINGS);
        revalidatePath('/', 'layout');
        return actionSuccess();
    } catch (error) {
        console.error("Update Settings Error:", error);
        return serverError(error, "update settings");
    }
}


export async function updateSingleSetting(key: string, value: string): Promise<ActionResponse<{ key: string; value: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        if (!ALLOWED_SETTING_KEYS.has(key)) {
            return actionError(`Invalid setting key: ${key}`);
        }

        let stringVal = String(value ?? "").trim();
        if (key === 'issnNumber') {
            stringVal = stringVal
                .replace(/^(e-?issn:\s*)/i, '')
                .replace(/\s*\(online\)/i, '')
                .trim();
        }

        await upsertSetting(key, stringVal);

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, `setting [${key}] updated`);
        updateTag(CACHE_TAGS.SETTINGS);
        revalidatePath('/', 'layout');

        return actionSuccess({ key, value: stringVal });
    } catch (error) {
        console.error(`Update Single Setting [${key}] Error:`, error);
        return serverError(error, `update setting ${key}`);
    }
}

export async function uploadSettingFile(key: string, formData: FormData): Promise<ActionResponse<{ key: string; fileUrl: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        if (!ALLOWED_SETTING_KEYS.has(key)) {
            return actionError(`Invalid setting key: ${key}`);
        }

        const file = formData.get(key);
        if (!(file instanceof File) || file.size === 0) {
            return actionError("No valid file provided");
        }

        const bytes = await file.arrayBuffer();
        const fileExt = file.name.split('.').pop();
        const fileName = `${kebabCase(key)}.${fileExt}`;
        const relativeDocsPath = `docs/${fileName}`;
        await uploadFileToStorage(relativeDocsPath, Buffer.from(bytes), file.name);
        const fileUrl = `/api/files/docs/${fileName}`;

        await upsertSetting(key, fileUrl);

        cacheLogger.invalidation(CACHE_TAGS.SETTINGS, `file asset [${key}] updated`);
        updateTag(CACHE_TAGS.SETTINGS);
        revalidatePath('/', 'layout');

        return actionSuccess({ key, fileUrl });
    } catch (error) {
        console.error(`Upload Setting File [${key}] Error:`, error);
        return serverError(error, `upload file for ${key}`);
    }
}

export async function togglePromotionStatus(isActive: boolean): Promise<ActionResponse<{ isPromotionActive: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized");
        }

        const value = isActive ? "true" : "false";

        await upsertSetting('isPromotionActive', value);

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

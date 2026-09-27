import { db } from "@/lib/db";
import { journalSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { JournalSettingRow } from "@/db/types";
import { DEFAULT_JOURNAL_SETTINGS, type JournalSettings } from "@/db/settings-defaults";

export async function readJournalSettingsRow(): Promise<JournalSettingRow | null> {
    try {
        const [row] = await db
            .select()
            .from(journalSettings)
            .where(eq(journalSettings.id, 1))
            .limit(1);
        return row ?? null;
    } catch {
        return null;
    }
}

export async function readJournalSettings(): Promise<JournalSettings> {
    const row = await readJournalSettingsRow();
    if (!row) return { ...DEFAULT_JOURNAL_SETTINGS };

    return {
        journalName: row.journalName || DEFAULT_JOURNAL_SETTINGS.journalName,
        journalShortName: row.journalShortName || DEFAULT_JOURNAL_SETTINGS.journalShortName,
        publisherName: row.publisherName || DEFAULT_JOURNAL_SETTINGS.publisherName,
        issnNumber: row.issnNumber || DEFAULT_JOURNAL_SETTINGS.issnNumber,
        apcInr: row.apcInr || DEFAULT_JOURNAL_SETTINGS.apcInr,
        apcUsd: row.apcUsd || DEFAULT_JOURNAL_SETTINGS.apcUsd,
        supportEmail: row.supportEmail || DEFAULT_JOURNAL_SETTINGS.supportEmail,
        supportPhone: row.supportPhone || DEFAULT_JOURNAL_SETTINGS.supportPhone,
        officeAddress: row.officeAddress || DEFAULT_JOURNAL_SETTINGS.officeAddress,
        journalWebsite: row.journalWebsite || DEFAULT_JOURNAL_SETTINGS.journalWebsite,
        apcDescription: row.apcDescription || DEFAULT_JOURNAL_SETTINGS.apcDescription,
        templateUrl: row.templateUrl || DEFAULT_JOURNAL_SETTINGS.templateUrl,
        copyrightUrl: row.copyrightUrl || DEFAULT_JOURNAL_SETTINGS.copyrightUrl,
        isPromotionActive: row.isPromotionActive ? 'true' : 'false',
        publicationFrequency: row.publicationFrequency || DEFAULT_JOURNAL_SETTINGS.publicationFrequency,
        startingYear: row.startingYear || DEFAULT_JOURNAL_SETTINGS.startingYear,
        publicationFormat: row.publicationFormat || DEFAULT_JOURNAL_SETTINGS.publicationFormat,
        journalLanguage: row.journalLanguage || DEFAULT_JOURNAL_SETTINGS.journalLanguage,
        journalSubject: row.journalSubject || DEFAULT_JOURNAL_SETTINGS.journalSubject,
        udyamRegistration: row.udyamRegistration || DEFAULT_JOURNAL_SETTINGS.udyamRegistration,
        doiPrefix: row.doiPrefix || DEFAULT_JOURNAL_SETTINGS.doiPrefix,
        sushiPlatformId: row.sushiPlatformId || DEFAULT_JOURNAL_SETTINGS.sushiPlatformId,
        sushiCustomerId: row.sushiCustomerId || DEFAULT_JOURNAL_SETTINGS.sushiCustomerId,
    };
}

export async function readSettingsRows(): Promise<Array<{ settingKey: string; settingValue: string }>> {
    const journalMap = await readJournalSettings();
    return Object.entries(journalMap).map(([settingKey, settingValue]) => ({
        settingKey,
        settingValue,
    }));
}

function mapToJournalColumns(entries: ReadonlyArray<readonly [string, string]>): Partial<JournalSettingRow> {
    const updates: Partial<JournalSettingRow> = {};
    for (const [key, value] of entries) {
        if (key === 'isPromotionActive') {
            updates.isPromotionActive = value === 'true' || value === '1';
        } else if (key in journalSettings && key !== 'id') {
            (updates as Record<string, unknown>)[key] = value;
        }
    }
    return updates;
}

export async function upsertSettings(
    entries: ReadonlyArray<readonly [string, string]>,
): Promise<void> {
    const updates = mapToJournalColumns(entries);

    if (Object.keys(updates).length > 0) {
        await db
            .insert(journalSettings)
            .values({ id: 1, ...updates } as typeof journalSettings.$inferInsert)
            .onDuplicateKeyUpdate({ set: updates });
    }
}

export async function upsertSetting(key: string, value: string): Promise<void> {
    await upsertSettings([[key, value]]);
}

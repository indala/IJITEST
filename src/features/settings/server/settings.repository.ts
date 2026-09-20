import { db } from "@/lib/db";
import { settings } from "@/db/schema";

export async function readSettingsRows() {
    return db.select().from(settings);
}

export async function upsertSettings(
    entries: ReadonlyArray<readonly [string, string]>,
): Promise<void> {
    await db.transaction(async (tx) => {
        for (const [key, value] of entries) {
            await tx
                .insert(settings)
                .values({ settingKey: key, settingValue: value })
                .onDuplicateKeyUpdate({ set: { settingValue: value } });
        }
    });
}

export async function upsertSetting(key: string, value: string): Promise<void> {
    await db
        .insert(settings)
        .values({ settingKey: key, settingValue: value })
        .onDuplicateKeyUpdate({ set: { settingValue: value } });
}

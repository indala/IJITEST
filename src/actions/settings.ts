"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM settings');
        const settings: Record<string, string> = {
            journal_name: 'International Journal of Innovative Trends in Engineering Science and Technology',
            journal_short_name: 'IJITEST',
            issn_number: 'XXXX-XXXX',
            apc_inr: '2500',
            apc_usd: '50',
            support_email: 'editor@ijitest.org',
            support_phone: '+91 8919643590',
            office_address: 'Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India'
        };
        rows.forEach((row: any) => {
            settings[row.setting_key] = row.setting_value;
        });
        return settings;
    } catch (error: any) {
        console.error("Get Settings Error:", error);
        return {};
    }
}

export async function updateSettings(formData: FormData) {
    try {
        const entries = Array.from(formData.entries());

        for (const [key, value] of entries) {
            if (key.startsWith('$')) continue; // Skip Next.js internal fields

            await pool.execute(
                'INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
                [key, value, value]
            );
        }

        revalidatePath('/admin/settings');
        revalidatePath('/');
        revalidatePath('/guidelines');
        revalidatePath('/contact');
        revalidatePath('/about');
        return { success: true };
    } catch (error: any) {
        console.error("Update Settings Error:", error);
        return { error: "Failed to update settings: " + error.message };
    }
}

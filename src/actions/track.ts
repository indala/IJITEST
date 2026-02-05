"use server";

import pool from "@/lib/db";

export async function trackManuscript(paperId: string, authorEmail: string) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT paper_id, title, author_name, status, submitted_at FROM submissions WHERE paper_id = ? AND author_email = ?',
            [paperId, authorEmail]
        );

        if (rows.length === 0) {
            return { error: "No manuscript found with these credentials. Please check your Paper ID and Email." };
        }

        return { success: true, manuscript: rows[0] };
    } catch (error: any) {
        console.error("Track Manuscript Error:", error);
        return { error: "An error occurred while fetching the status. Please try again later." };
    }
}

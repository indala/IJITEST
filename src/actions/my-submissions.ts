"use server";

import pool from "@/lib/db";
import { getSession } from "@/actions/session";

export async function getMySubmissions() {
    try {
        const session = await getSession();
        if (!session) return [];

        const [rows]: any = await pool.execute(
            'SELECT * FROM submissions WHERE author_email = ? ORDER BY submitted_at DESC',
            [session.email]
        );
        return rows;
    } catch (error) {
        console.error("Get My Submissions Error:", error);
        return [];
    }
}

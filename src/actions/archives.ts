"use server";

import pool from "@/lib/db";

export async function getPublishedPapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.status = 'published'
            ORDER BY vi.year DESC, vi.volume_number DESC, vi.issue_number DESC, s.updated_at DESC
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Published Papers Error:", error);
        return [];
    }
}
export async function getPaperById(id: string) {
    try {
        const [rows]: any = await pool.execute(`
            SELECT 
                s.*, 
                vi.volume_number, 
                vi.issue_number, 
                vi.year as publication_year, 
                vi.month_range
            FROM submissions s
            JOIN volumes_issues vi ON s.issue_id = vi.id
            WHERE s.id = ? AND s.status = 'published'
        `, [id]);
        return rows[0] || null;
    } catch (error: any) {
        console.error("Get Paper By ID Error:", error);
        return null;
    }
}

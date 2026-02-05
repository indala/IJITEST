"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function createVolumeIssue(formData: FormData) {
    const volume = parseInt(formData.get('volume') as string);
    const issue = parseInt(formData.get('issue') as string);
    const year = parseInt(formData.get('year') as string);
    const monthRange = formData.get('monthRange') as string;

    try {
        await pool.execute(
            'INSERT INTO volumes_issues (volume_number, issue_number, year, month_range) VALUES (?, ?, ?, ?)',
            [volume, issue, year, monthRange]
        );
        revalidatePath('/admin/publications');
        return { success: true };
    } catch (error: any) {
        console.error("Create Publication Error:", error);
        return { error: "Failed to create publication: " + error.message };
    }
}

export async function getVolumesIssues() {
    try {
        const [rows]: any = await pool.execute('SELECT * FROM volumes_issues ORDER BY year DESC, volume_number DESC, issue_number DESC');
        return rows;
    } catch (error: any) {
        console.error("Get Publications Error:", error);
        return [];
    }
}

export async function assignPaperToIssue(submissionId: number, issueId: number) {
    try {
        await pool.execute(
            'UPDATE submissions SET issue_id = ? WHERE id = ?',
            [issueId, submissionId]
        );
        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        return { success: true };
    } catch (error: any) {
        console.error("Assign Paper Error:", error);
        return { error: "Failed to assign paper: " + error.message };
    }
}

export async function publishIssue(id: number) {
    try {
        await pool.execute(
            "UPDATE volumes_issues SET status = 'published' WHERE id = ?",
            [id]
        );

        // Also update papers in this issue to 'published' status
        await pool.execute(
            "UPDATE submissions SET status = 'published' WHERE issue_id = ?",
            [id]
        );

        revalidatePath('/admin/publications');
        revalidatePath('/archives');
        return { success: true };
    } catch (error: any) {
        console.error("Publish Issue Error:", error);
        return { error: "Failed to publish issue: " + error.message };
    }
}

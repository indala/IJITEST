"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { modifyManuscriptHeader } from "@/lib/docx";
import { getSettings } from "./settings";
import path from "path";
import fs from "fs/promises";

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

export async function getLatestPublishedIssue() {
    try {
        const [rows]: any = await pool.execute(
            "SELECT * FROM volumes_issues WHERE status = 'published' ORDER BY year DESC, volume_number DESC, issue_number DESC LIMIT 1"
        );
        return rows[0] || null;
    } catch (error: any) {
        console.error("Get Latest Published Issue Error:", error);
        return null;
    }
}

export async function assignPaperToIssue(submissionId: number, issueId: number) {
    try {
        // 1. Fetch Submission Details
        const [subRows]: any = await pool.execute('SELECT * FROM submissions WHERE id = ?', [submissionId]);
        const submission = subRows[0];
        if (!submission) throw new Error("Submission not found");

        // 2. Fetch Issue Details
        const [issueRows]: any = await pool.execute('SELECT * FROM volumes_issues WHERE id = ?', [issueId]);
        const issue = issueRows[0];
        if (!issue) throw new Error("Issue not found");

        // 3. Fetch Settings
        const settings = await getSettings();

        // 4. Modify DOCX Header if it's a DOCX file
        let finalFilePath = submission.file_path;
        if (submission.file_path && (submission.file_path.endsWith('.docx') || submission.file_path.endsWith('.doc'))) {
            const inputPath = path.join(process.cwd(), 'public', submission.file_path);
            const outputDir = path.join(process.cwd(), 'public/published');
            const outputFileName = `published-${submission.paper_id}-${Date.now()}.docx`;
            const outputPath = path.join(outputDir, outputFileName);

            const modifyResult = await modifyManuscriptHeader(inputPath, outputPath, {
                journal_name: settings.journal_name || "IJITEST",
                volume: issue.volume_number,
                issue: issue.issue_number,
                month_year: `${issue.month_range} (${issue.year})`,
                website: "www.ijitest.com",
                issn: settings.issn_number || "XXXX-XXXX",
                paper_id: submission.paper_id
            });

            if (modifyResult.success) {
                finalFilePath = `/published/${outputFileName}`;
            }
        }

        // 5. Update Database
        await pool.execute(
            "UPDATE submissions SET issue_id = ?, status = 'published', file_path = ? WHERE id = ?",
            [issueId, finalFilePath, submissionId]
        );

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/publications');
        revalidatePath('/archives');
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

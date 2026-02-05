"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";

export async function updateSubmissionStatus(id: number, status: string) {
    try {
        await pool.execute(
            'UPDATE submissions SET status = ? WHERE id = ?',
            [status, id]
        );

        // Fetch author details to send notification
        const [rows]: any = await pool.execute('SELECT author_name, author_email, title, paper_id FROM submissions WHERE id = ?', [id]);
        if (rows[0]) {
            const { author_name, author_email, title, paper_id } = rows[0];
            const template = emailTemplates.statusUpdate(author_name, title, status, paper_id);
            await sendEmail({
                to: author_email,
                subject: template.subject,
                html: template.html
            });
        }

        revalidatePath('/admin/submissions');
        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error("Update Status Error:", error);
        return { error: "Failed to update status: " + error.message };
    }
}

export async function getSubmissionById(id: number) {
    try {
        const [rows]: any = await pool.execute(
            'SELECT * FROM submissions WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    } catch (error: any) {
        console.error("Get Submission Error:", error);
        return null;
    }
}

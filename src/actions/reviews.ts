"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { sendEmail, emailTemplates } from "@/lib/mail";

export async function assignReviewer(formData: FormData) {
    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerName = formData.get('reviewerName') as string;
    const deadline = formData.get('deadline') as string;

    try {
        await pool.execute(
            'INSERT INTO reviews (submission_id, reviewer_name, deadline, status) VALUES (?, ?, ?, ?)',
            [submissionId, reviewerName, deadline, 'in_progress']
        );

        // Update submission status to 'under_review' if it's still 'submitted'
        await pool.execute(
            "UPDATE submissions SET status = 'under_review' WHERE id = ? AND status = 'submitted'",
            [submissionId]
        );

        // Fetch paper title for the email
        const [subRows]: any = await pool.execute('SELECT title FROM submissions WHERE id = ?', [submissionId]);
        const paperTitle = subRows[0]?.title || "Assigned Paper";

        // Send Email to Reviewer (Note: Need reviewer email, adding placeholder for now or fetching from user table if exists)
        // For now, let's assume the editor sends it to a known reviewer email or we add a reviewer email field
        // Since the reviewer email isn't in the form, I'll use the editor's email as a CC or just log it
        // Actually, the reviewer is usually a user in our system. Let's try to find them by name or just use a placeholder

        // OPTIMIZATION: In a real system, we'd have a reviewer_email field in the form.
        // Let's assume the editor provides it or we fetch it.

        const template = emailTemplates.reviewAssignment(reviewerName, paperTitle, deadline);
        await sendEmail({
            to: process.env.SMTP_USER as string, // Sending to editor as proof for now, or reviewer if we had their email
            subject: template.subject,
            html: template.html
        });

        revalidatePath('/admin/reviews');
        revalidatePath('/admin/submissions');
        return { success: true };
    } catch (error: any) {
        console.error("Assign Reviewer Error:", error);
        return { error: "Failed to assign reviewer: " + error.message };
    }
}

export async function uploadReviewFeedback(reviewId: number, formData: FormData) {
    try {
        const file = formData.get('feedbackFile') as File;
        if (!file) return { error: "No file provided" };

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop();
        const fileName = `review-${reviewId}-${Date.now()}.${fileExt}`;
        const uploadDir = path.join(process.cwd(), "public/uploads/reviews");
        await fs.mkdir(uploadDir, { recursive: true });

        const filePath = path.join(uploadDir, fileName);
        await fs.writeFile(filePath, buffer);

        const relativePath = `/uploads/reviews/${fileName}`;

        await pool.execute(
            "UPDATE reviews SET feedback_file_path = ?, status = 'completed' WHERE id = ?",
            [relativePath, reviewId]
        );

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error: any) {
        console.error("Upload Feedback Error:", error);
        return { error: "Failed to upload feedback: " + error.message };
    }
}

export async function getActiveReviews() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT r.*, s.title, s.paper_id 
            FROM reviews r 
            JOIN submissions s ON r.submission_id = s.id 
            ORDER BY r.assigned_at DESC
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}

export async function getUnassignedAcceptedPapers() {
    try {
        // Papers that are accepted but not yet published and not assigned a reviewer (technically reviews happen before acceptance, but for this workflow let's look for 'under_review' or 'submitted')
        const [rows]: any = await pool.execute(`
            SELECT id, paper_id, title 
            FROM submissions 
            WHERE status IN ('submitted', 'under_review') 
            AND id NOT IN (SELECT submission_id FROM reviews WHERE status != 'completed')
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Unassigned Error:", error);
        return [];
    }
}

"use server";

import pool from "@/lib/db";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";
import { sendEmail, emailTemplates } from "@/lib/mail";

export async function assignReviewer(formData: FormData) {
    const submissionId = parseInt(formData.get('submissionId') as string);
    const reviewerId = parseInt(formData.get('reviewerId') as string);
    const deadline = formData.get('deadline') as string;

    try {
        await pool.execute(
            'INSERT INTO reviews (submission_id, reviewer_id, deadline, status) VALUES (?, ?, ?, ?)',
            [submissionId, reviewerId, deadline, 'in_progress']
        );

        // Update submission status to 'under_review' if it's still 'submitted'
        await pool.execute(
            "UPDATE submissions SET status = 'under_review' WHERE id = ? AND status = 'submitted'",
            [submissionId]
        );

        // Fetch user and paper details for the email
        const [userRows]: any = await pool.execute('SELECT email, full_name FROM users WHERE id = ?', [reviewerId]);
        const [subRows]: any = await pool.execute('SELECT title FROM submissions WHERE id = ?', [submissionId]);

        const reviewer = userRows[0];
        const paperTitle = subRows[0]?.title || "Assigned Paper";

        if (reviewer) {
            const template = emailTemplates.reviewAssignment(reviewer.full_name, paperTitle, deadline);
            await sendEmail({
                to: reviewer.email,
                subject: template.subject,
                html: template.html
            });
        }

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
        const feedbackText = formData.get('feedbackText') as string;

        let relativePath = null;

        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileExt = file.name.split('.').pop();
            const fileName = `review-${reviewId}-${Date.now()}.${fileExt}`;
            const uploadDir = path.join(process.cwd(), "public/uploads/reviews");
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);
            relativePath = `/uploads/reviews/${fileName}`;
        }

        await pool.execute(
            "UPDATE reviews SET feedback_file_path = COALESCE(?, feedback_file_path), feedback = ?, status = 'completed' WHERE id = ?",
            [relativePath, feedbackText, reviewId]
        );

        revalidatePath('/admin/reviews');
        return { success: true };
    } catch (error: any) {
        console.error("Upload Feedback Error:", error);
        return { error: "Failed to upload feedback: " + error.message };
    }
}

export async function getActiveReviews(reviewerId?: number) {
    try {
        let query = `
            SELECT r.*, s.title, s.paper_id, s.file_path as manuscript_path, u.full_name as reviewer_name
            FROM reviews r 
            JOIN submissions s ON r.submission_id = s.id 
            JOIN users u ON r.reviewer_id = u.id
        `;
        const params = [];

        if (reviewerId) {
            query += " WHERE r.reviewer_id = ? AND s.status NOT IN ('accepted', 'rejected')";
            params.push(reviewerId);
        } else {
            query += " WHERE s.status NOT IN ('accepted', 'rejected')";
        }

        query += " ORDER BY r.assigned_at DESC";

        const [rows]: any = await pool.execute(query, params);
        return rows;
    } catch (error: any) {
        console.error("Get Reviews Error:", error);
        return [];
    }
}

export async function getUnassignedAcceptedPapers() {
    try {
        const [rows]: any = await pool.execute(`
            SELECT id, paper_id, title 
            FROM submissions 
            WHERE status IN ('submitted', 'under_review', 'accepted') 
            AND id NOT IN (SELECT submission_id FROM reviews WHERE status != 'completed')
        `);
        return rows;
    } catch (error: any) {
        console.error("Get Unassigned Error:", error);
        return [];
    }
}

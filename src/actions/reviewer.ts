"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { 
    applications, 
    applicationInterests, 
    masterInterests 
} from "@/db/schema";
import { ActionResponse, actionSuccess, actionError } from "@/db/types";
import { insertApplicationSchema } from "@/db/validation";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { emailTemplates, sendEmail } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";
import { eq } from "drizzle-orm";

// Local schema extension for application type
const applicationSchema = insertApplicationSchema.extend({
    type: z.enum(['reviewer', 'editor']).default('reviewer'),
});

export async function submitReviewerApplication(formData: FormData): Promise<ActionResponse> {
    const fullName = formData.get("fullName") as string;
    const designation = formData.get("designation") as string;
    const institute = formData.get("institute") as string;
    const email = formData.get("email") as string;
    const type = formData.get("applicationType") as string; // Map to DB field name
    const nationality = formData.get("nationality") as string;
    const cv = formData.get("cv") as File;
    const photo = formData.get("photo") as File;
    const researchInterestsStr = formData.get("researchInterests") as string;

    // Validate textual data
    const validation = applicationSchema.safeParse({ fullName, designation, institute, email, type, nationality });
    if (!validation.success) {
        return actionError(validation.error.issues[0]?.message || "Please fill in all required fields correctly.");
    }

    // Validate files
    if (!cv || cv.size === 0) return actionError("Please upload your CV.");
    if (!photo || photo.size === 0) return actionError("Please upload your Photo.");

    let cvUrl: string | null = null;
    let photoUrl: string | null = null;

    try {
        // Save files to private storage
        const uploadsDir = path.join(process.cwd(), "storage", "reviewer-apps");
        await mkdir(uploadsDir, { recursive: true });

        const timestamp = Date.now();
        const cvName = `${timestamp}-cv-${cv.name.replace(/\s/g, '-')}`;
        const photoName = `${timestamp}-photo-${photo.name.replace(/\s/g, '-')}`;

        await writeFile(path.join(uploadsDir, cvName), Buffer.from(await cv.arrayBuffer()));
        await writeFile(path.join(uploadsDir, photoName), Buffer.from(await photo.arrayBuffer()));

        cvUrl = `/api/files/reviewer-apps/${cvName}`;
        photoUrl = `/api/files/reviewer-apps/${photoName}`;

        // Save to Database
        await db.transaction(async (tx) => {
            const [insertedApp] = await tx.insert(applications).values({
                ...validation.data,
                cvUrl,
                photoUrl,
                status: 'pending',
            });
            const appId = insertedApp.insertId;

            // Persist Normalized Research Interests
            if (researchInterestsStr && appId) {
                try {
                    const interests = JSON.parse(researchInterestsStr) as string[];
                    if (Array.isArray(interests) && interests.length > 0) {
                    // Normalized Interests Insertion
                    for (const name of interests) {
                        const trimmedName = name.trim();
                        if (!trimmedName) continue;

                        let interestId: number;
                        const existing = await tx.select().from(masterInterests).where(eq(masterInterests.name, trimmedName)).limit(1);
                        
                        if (existing[0]) {
                            interestId = existing[0].id;
                        } else {
                            const [inserted] = await tx.insert(masterInterests).values({ name: trimmedName });
                            interestId = inserted.insertId;
                        }

                        await tx.insert(applicationInterests).values({
                            applicationId: appId,
                            interestId: interestId
                        });
                    }
                    }
                } catch (pErr) {
                    console.error("Error parsing/saving interests:", pErr);
                }
            }
            return appId;
        });

        // Notify Admin via Email
        const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/reviewer-applications`;
        const roleName = type === 'editor' ? 'Editor' : 'Reviewer';

        const adminTemplate = emailTemplates.adminNotification(
            `New ${roleName} Application`,
            `A new technical profile from <strong>${fullName}</strong> has been submitted for the <strong>${roleName} Board</strong>.`,
            adminUrl
        );

        sendEmail({
            to: process.env.EMAIL_FROM || 'admin@ijitest.org',
            subject: adminTemplate.subject,
            html: adminTemplate.html
        });

        // Confirmation to Applicant
        const applicantTemplate = emailTemplates.boardApplicationReceipt(fullName, type as any);
        sendEmail({
            to: email,
            subject: applicantTemplate.subject,
            html: applicantTemplate.html
        });

        return actionSuccess();
    } catch (error) {
        console.error("Application Error:", error);

        // Rollback: Delete uploaded assets
        if (cvUrl) await safeDeleteFile(cvUrl);
        if (photoUrl) await safeDeleteFile(photoUrl);

        if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            return actionError("An application with this email already exists for this role.");
        }
        return actionError("Failed to submit application. Please try again.");
    }
}

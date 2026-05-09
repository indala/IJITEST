"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { 
    applications, 
    applicationInterests, 
    masterInterests 
} from "@/db/schema";
import { ActionResponse } from "@/db/types";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { emailTemplates, sendEmail } from "@/lib/mail";
import { safeDeleteFile } from "@/lib/fs-utils";
import { eq } from "drizzle-orm";

const schema = z.object({
    fullName: z.string().min(2),
    designation: z.string().min(2),
    institute: z.string().min(2),
    email: z.string().email(),
    application_type: z.enum(['reviewer', 'editor']).default('reviewer'),
    nationality: z.string().min(2),
});

export async function submitReviewerApplication(formData: FormData): Promise<ActionResponse> {
    const fullName = formData.get("fullName") as string;
    const designation = formData.get("designation") as string;
    const institute = formData.get("institute") as string;
    const email = formData.get("email") as string;
    const application_type = formData.get("application_type") as string;
    const nationality = formData.get("nationality") as string;
    const cv = formData.get("cv") as File;
    const photo = formData.get("photo") as File;
    const researchInterestsStr = formData.get("research_interests") as string;

    // Validate textual data
    const validation = schema.safeParse({ fullName, designation, institute, email, application_type, nationality });
    if (!validation.success) {
        return { success: false, error: "Please fill in all required fields correctly." };
    }

    // Validate files
    if (!cv || cv.size === 0) return { success: false, error: "Please upload your CV." };
    if (!photo || photo.size === 0) return { success: false, error: "Please upload your Photo." };

    let cvUrl: string | null = null;
    let photoUrl: string | null = null;

    try {
        // Save files to private storage
        const uploadsDir = path.join(process.cwd(), "storage", "reviewer-apps");
        await mkdir(uploadsDir, { recursive: true });

        const cvName = `${Date.now()}-${cv.name.replace(/\s/g, '-')}`;
        const photoName = `${Date.now()}-${photo.name.replace(/\s/g, '-')}`;

        await writeFile(path.join(uploadsDir, cvName), Buffer.from(await cv.arrayBuffer()));
        await writeFile(path.join(uploadsDir, photoName), Buffer.from(await photo.arrayBuffer()));

        cvUrl = `/api/files/reviewer-apps/${cvName}`;
        photoUrl = `/api/files/reviewer-apps/${photoName}`;

        // Save to Database
        await db.transaction(async (tx) => {
            const [insertedApp] = await tx.insert(applications).values({
                fullName,
                designation,
                institute,
                email,
                cvUrl,
                photoUrl,
                type: application_type as 'reviewer' | 'editor',
                status: 'pending',
                nationality,
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
        const roleName = application_type === 'editor' ? 'Editor' : 'Reviewer';

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
        const applicantTemplate = emailTemplates.boardApplicationReceipt(fullName, application_type);
        sendEmail({
            to: email,
            subject: applicantTemplate.subject,
            html: applicantTemplate.html
        });

        return { success: true };
    } catch (error) {
        console.error("Application Error:", error);

        // Rollback: Delete uploaded assets
        if (cvUrl) await safeDeleteFile(cvUrl);
        if (photoUrl) await safeDeleteFile(photoUrl);

        if (error && typeof error === 'object' && 'code' in error && error.code === 'ER_DUP_ENTRY') {
            return { success: false, error: "An application with this email already exists for this role." };
        }
        return { success: false, error: "Failed to submit application. Please try again." };
    }
}

"use server";

import { db } from "@/lib/db";
import {
    submissions,
    submissionFiles,
    submissionVersions,
    submissionAuthors,
    users,
    userProfiles,
    settings,
    userInvitations
} from "@/db/schema";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";
import { sendEmail, emailTemplates } from "@/lib/mail";
import { eq, inArray } from "drizzle-orm";
import crypto from 'crypto';
import { ActionResponse } from "@/db/types";
import { checkRateLimit } from "@/lib/rate-limit";

const submissionSchema = z.object({
    authorName: z.string().min(2, "Author name is required").max(255, "Author name cannot exceed 255 characters"),
    authorEmail: z.email("Invalid email address").max(255, "Email address cannot exceed 255 characters"),
    authorPhone: z.string()
        .regex(/^[0-9]+$/, "Author phone must contain only numbers")
        .max(20, "Phone number cannot exceed 20 characters")
        .optional()
        .or(z.literal('')),
    authorDesignation: z.string().min(2, "Author designation is required").max(255, "Designation cannot exceed 255 characters"),
    affiliation: z.string().min(2, "Affiliation is required").max(500, "Institution name cannot exceed 500 characters"),
    title: z.string().min(10, "Title must be at least 10 characters").max(1000, "Title cannot exceed 1000 characters"),
    abstract: z.string().min(50, "Abstract must be at least 50 characters"),
    keywords: z.string().min(5, "Keywords are required").max(500, "Keywords cannot exceed 500 characters"),
    coAuthors: z.string().optional(), // Still receiving as string from FormData, will parse to Author[]
    termsAccepted: z.string().refine(val => val === "on", {
        message: "You must accept the terms and guidelines"
    }),
});

/**
 * Handles new manuscript submission with transactional DB-first logic.
 * Ensures data integrity by saving DB records before attempting file uploads.
 */
export async function submitPaper(formData: FormData): Promise<ActionResponse<{ paperId: string }>> {
    const fileCleanupList: string[] = [];
    let invitationToken: string | null = null;

    try {
        // 1. Validation (Mapping snake_case FormData to camelCase Schema)
        const rawData = {
            authorName: formData.get("authorName") as string,
            authorEmail: formData.get("authorEmail") as string,
            authorPhone: formData.get("authorPhone") as string,
            authorDesignation: formData.get("authorDesignation") as string,
            affiliation: formData.get("affiliation") as string,
            title: formData.get("title") as string,
            abstract: formData.get("abstract") as string,
            keywords: formData.get("keywords") as string,
            coAuthors: formData.get("coAuthors") as string,
            termsAccepted: formData.get("termsAccepted") as string,
        };

        const validated = submissionSchema.safeParse(rawData);
        if (!validated.success) return { success: false, error: validated.error?.issues[0]?.message || "Validation failed" };
        const submissionRate = await checkRateLimit({
            key: `submit:${validated.data.authorEmail.toLowerCase().trim()}`,
            max: 2,
            windowMs: 10 * 60_000,
        });
        if (!submissionRate.allowed) {
            return { success: false, error: `Too many submission attempts. Please wait ${submissionRate.retryAfterSeconds} seconds and try again.` };
        }

        const manuscriptFile = formData.get("manuscript") as File;
        const copyrightFile = formData.get("copyrightForm") as File;

        if (!manuscriptFile || manuscriptFile.size === 0) return { success: false, error: "Manuscript file is mandatory" };
        const copyrightProvided = copyrightFile && copyrightFile.size > 0;

        // .docx ONLY Policy
        const docxMime = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        const isDocx = (f: File) =>
            f.name.toLowerCase().endsWith(".docx") ||
            f.type === docxMime;

        if (!isDocx(manuscriptFile)) {
            return { success: false, error: "Strict Policy: Only .docx files are accepted for the Manuscript." };
        }

        if (copyrightProvided && !isDocx(copyrightFile)) {
            return { success: false, error: "Strict Policy: The Copyright Form must be a .docx file." };
        }

        // 2. Transactional Database Operations (Save everything BUT don't upload files yet)
        const result = await db.transaction(async (tx) => {
            // A. User/Author Account Management
            const existingUsers = await tx.select().from(users).where(eq(users.email, validated.data.authorEmail)).limit(1);
            let userId: string;

            if (existingUsers.length === 0) {
                userId = crypto.randomUUID();
                invitationToken = crypto.randomBytes(32).toString('hex');
                const expires = new Date();
                expires.setHours(expires.getHours() + 168); // 7-day window for account setup

                await tx.insert(users).values({
                    id: userId,
                    email: validated.data.authorEmail,
                    role: "author",
                    passwordHash: null, // Force setup
                });

                await tx.insert(userProfiles).values({
                    userId,
                    fullName: validated.data.authorName,
                    institute: validated.data.affiliation,
                    phone: validated.data.authorPhone,
                    designation: validated.data.authorDesignation,
                });

                await tx.insert(userInvitations).values({
                    email: validated.data.authorEmail,
                    role: "author",
                    token: invitationToken,
                    expiresAt: expires,
                });
            } else {
                const existingUser = existingUsers[0];
                if (!existingUser) throw new Error("Critical: User not found despite query results.");
                userId = existingUser.id;
                // Update profile with latest info
                await tx.update(userProfiles)
                    .set({
                        fullName: validated.data.authorName,
                        institute: validated.data.affiliation,
                        phone: validated.data.authorPhone,
                        designation: validated.data.authorDesignation,
                    })
                    .where(eq(userProfiles.userId, userId));
            }

            // B. Paper Metadata Generation (Gapless Sequential Locking)
            const currentYear = new Date().getFullYear().toString();
            const seqKey = `submission_sequence_${currentYear}`;

            // Ensure sequence entry exists (no-op on duplicate — preserve existing value)
            await tx.insert(settings)
                .values({ settingKey: seqKey, settingValue: '0' })
                .onDuplicateKeyUpdate({ set: { settingKey: seqKey } });

            // Lock and Fetch current sequence
            const seqResult = await tx.select({ value: settings.settingValue })
                .from(settings)
                .where(eq(settings.settingKey, seqKey))
                .for('update');
            const lastSeq = parseInt(seqResult[0]?.value || "0");
            const newSeq = lastSeq + 1;

            // Update sequence
            await tx.update(settings)
                .set({ settingValue: newSeq.toString() })
                .where(eq(settings.settingKey, seqKey));

            const paperId = `IJITEST-${currentYear}-${String(newSeq).padStart(3, "0")}`;
            const slug = paperId.toLowerCase().replace(/-/g, "");

            // C. Insert Core Submission
            const [submissionInsert] = await tx.insert(submissions).values({
                paperId,
                slug,
                status: "submitted",
                correspondingAuthorId: userId,
            });
            const subId = submissionInsert.insertId;

            // D. Insert Version 1
            const [versionInsert] = await tx.insert(submissionVersions).values({
                submissionId: subId,
                versionNumber: 1,
                title: validated.data.title,
                abstract: validated.data.abstract,
                keywords: validated.data.keywords,
            });
            const verId = versionInsert.insertId;

            // E. Authors (Lead + Co-authors)
            const authorsList: (typeof submissionAuthors.$inferInsert)[] = [{
                submissionId: subId,
                name: validated.data.authorName,
                email: validated.data.authorEmail,
                phone: validated.data.authorPhone,
                designation: validated.data.authorDesignation,
                institution: validated.data.affiliation,
                isCorresponding: true,
                orderIndex: 0,
            }];

            if (validated.data.coAuthors) {
                try {
                    const coAuthors = JSON.parse(validated.data.coAuthors);
                    if (Array.isArray(coAuthors)) {
                        coAuthors.forEach((ca, idx) => {
                            if (!ca.name || !ca.email) return; // Skip empty rows if any
                            authorsList.push({
                                submissionId: subId,
                                name: ca.name,
                                email: ca.email,
                                phone: ca.phone || null,
                                designation: ca.designation || null,
                                institution: ca.institution || null,
                                isCorresponding: false,
                                orderIndex: idx + 1,
                            });
                        });
                    }
                } catch {
                    throw new Error("Invalid co-author data format. Please check your inputs.");
                }
            }
            await tx.insert(submissionAuthors).values(authorsList);

            // F. Predictable File URLs (Saved to DB first as requested)
            const timestamp = Date.now();
            const mName = `manuscript_${subId}_${timestamp}.${manuscriptFile.name.split('.').pop()}`;
            const mUrl = `/api/files/submissions/${mName}`;

            const fileRecords: (typeof submissionFiles.$inferInsert)[] = [
                { versionId: verId, fileType: "mainManuscript", fileUrl: mUrl, originalName: manuscriptFile.name, fileSize: manuscriptFile.size }
            ];

            let finalCName: string | undefined = undefined;
            if (copyrightProvided) {
                const cName = `copyright_${subId}_${timestamp}.${copyrightFile.name.split('.').pop()}`;
                const cUrl = `/api/files/submissions/${cName}`;
                fileRecords.push({ versionId: verId, fileType: "copyrightForm" as const, fileUrl: cUrl, originalName: copyrightFile.name, fileSize: copyrightFile.size });
                finalCName = cName;
            }

            await tx.insert(submissionFiles).values(fileRecords);

            return { paperId, subId, mName, cName: finalCName };
        });

        // 3. File Uploads (Happens post-transaction to strictly follow "DB First" rule)
        const uploadDir = path.join(process.cwd(), "storage/submissions");
        await fs.mkdir(uploadDir, { recursive: true });

        try {
            await fs.writeFile(path.join(uploadDir, result.mName), Buffer.from(await manuscriptFile.arrayBuffer()));
            fileCleanupList.push(path.join(uploadDir, result.mName));

            if (result.cName && copyrightFile) {
                await fs.writeFile(path.join(uploadDir, result.cName), Buffer.from(await copyrightFile.arrayBuffer()));
                fileCleanupList.push(path.join(uploadDir, result.cName));
            }
        } catch {
            // File-system cleanup for orphaned files
            for (const filePath of fileCleanupList) {
                try { await fs.unlink(filePath); } catch { }
            }

            // DB-cleanup for zombie submission
            await db.delete(submissions).where(eq(submissions.id, result.subId));

            // Orphaned Account Cleanup (if user was newly created during this failed session)
            if (invitationToken) {
                const userRes = await db.select().from(users).where(eq(users.email, validated.data.authorEmail)).limit(1);
                const userToCleanup = userRes[0];
                if (userToCleanup && !userToCleanup.passwordHash) {
                    await db.delete(users).where(eq(users.id, userToCleanup.id));
                    await db.delete(userInvitations).where(eq(userInvitations.email, validated.data.authorEmail));
                }
            }
            throw new Error("File upload failed. Our servers might be busy. Please try again.");
        }

        // 4. Notifications
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';
        const loginUrl = `${baseUrl}/login`;

        // Author Notification
        const authorTemplate = emailTemplates.submissionReceived(
            validated.data.authorName,
            validated.data.title,
            result.paperId,
            invitationToken ? `${baseUrl}/auth/setup?token=${invitationToken}` : loginUrl
        );

        await sendEmail({
            to: validated.data.authorEmail,
            subject: authorTemplate.subject,
            html: authorTemplate.html
        });

        // Co-author Notifications
        if (validated.data.coAuthors) {
            const coAuthors = JSON.parse(validated.data.coAuthors);
            if (Array.isArray(coAuthors)) {
                await Promise.allSettled(coAuthors.map((ca: any) => {
                    const coTemplate = emailTemplates.coAuthorNotification(
                        ca.name,
                        validated.data.title,
                        validated.data.authorName,
                        result.paperId
                    );
                    return sendEmail({
                        to: ca.email,
                        subject: coTemplate.subject,
                        html: coTemplate.html
                    });
                }));
            }
        }

        // Team Notification — role-specific links
        const staff = await db.select({ email: users.email, role: users.role, profile: userProfiles }).from(users)
            .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(inArray(users.role, ['admin', 'editor']));

        await Promise.allSettled(staff.map(s => {
            const dashboardLink = s.role === 'admin'
                ? `${baseUrl}/admin/submissions/${result.subId}`
                : `${baseUrl}/editor/submissions/${result.subId}`;

            const staffTemplate = emailTemplates.staffNotification(
                s.profile.fullName || 'Editor',
                `New Submission: ${result.paperId}`,
                `A new manuscript titled <strong>"${validated.data.title}"</strong> has been submitted by <strong>${validated.data.authorName}</strong> and requires initial screening.`,
                dashboardLink
            );

            return sendEmail({
                to: s.email,
                subject: staffTemplate.subject,
                html: staffTemplate.html
            });
        }));

        revalidatePath('/admin/submissions');
        return { success: true, data: { paperId: result.paperId } };

    } catch (error) {
        console.error("Submission Failure:", error);
        return { success: false, error: error instanceof Error ? error.message : String(error) || "An unexpected error occurred during submission." };
    }
}

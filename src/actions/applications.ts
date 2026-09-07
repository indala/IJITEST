"use server";
import "server-only"

import { db } from "@/lib/db";
import {
    applications,
    users,
    userProfiles,
    userInvitations,
    applicationInterests,
    masterInterests
} from "@/db/schema";
import {
    type Application,
    type ActionResponse,
    serverError
} from "@/db/types";
import { eq, and, desc, SQL, inArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { emailTemplates, sendEmail, sendEmailWithRetry } from "@/lib/mail";
import crypto from "crypto";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

/**
 * Fetch all applications with optional filters
 */
export async function getApplications(filters?: { role?: string, status?: string, interest?: string }): Promise<ActionResponse<Application[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const whereClauses: SQL[] = [];

        if (filters?.role && filters.role !== 'all') {
            whereClauses.push(eq(applications.type, filters.role as "editor" | "reviewer"));
        }
        if (filters?.status && filters.status !== 'all') {
            whereClauses.push(eq(applications.status, filters.status as "pending" | "approved" | "rejected"));
        }

        // 1. Fetch base applications
        const apps = await db.select()
            .from(applications)
            .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
            .orderBy(desc(applications.createdAt))
            .limit(200);

        // 2. Fetch all interests for these applications
        const appIds = apps.map(a => a.id);
        if (appIds.length === 0) return { success: true, data: [] };

        const allInterestsRaw = await db
            .select({
                id: applicationInterests.id,
                applicationId: applicationInterests.applicationId,
                interestId: applicationInterests.interestId,
                interestIdNullable: masterInterests.id,
                interestName: masterInterests.name,
                interestCreatedAt: masterInterests.createdAt,
            })
            .from(applicationInterests)
            .leftJoin(masterInterests, eq(applicationInterests.interestId, masterInterests.id))
            .where(inArray(applicationInterests.applicationId, appIds));

        const allInterests = allInterestsRaw
            .filter((row): row is typeof row & { interestIdNullable: number; interestName: string; interestCreatedAt: Date } =>
                row.interestIdNullable !== null &&
                row.interestName !== null &&
                row.interestCreatedAt !== null
            )
            .map(row => ({
                id: row.id,
                applicationId: row.applicationId,
                interestId: row.interestId,
                interest: {
                    id: row.interestIdNullable,
                    name: row.interestName,
                    createdAt: row.interestCreatedAt,
                }
            }));

        // 3. Map interests back to applications
        const mappedData: Application[] = apps.map(app => {
            const appInterests = allInterests
                .filter(i => i.applicationId === app.id)
                .map(i => i.interest.name);

            return {
                ...app,
                researchInterests: appInterests
            };
        });

        // 4. Client-side filter for interest if needed (since it's a join/relation filter)
        // Note: For large datasets, this should be done in SQL with an EXISTS clause.
        let finalData = mappedData;
        if (filters?.interest) {
            const search = filters.interest.toLowerCase();
            finalData = mappedData.filter(app =>
                app.researchInterests?.some(interest => interest.toLowerCase().includes(search))
            );
        }

        return { success: true, data: finalData };
    } catch (error) {
        console.error("Get Applications Error:", error);
        return serverError(error, "fetch applications");
    }
}

/**
 * Approve an application and create a user account
 */
export async function approveApplication(id: number): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized: Admin or Editor session required." };
    }
    const adminId = session.user.id;

    try {
        const result = await db.transaction(async (tx) => {
            const appRows = await tx.select().from(applications).where(eq(applications.id, id)).limit(1);
            const app = appRows[0];

            if (!app) return { success: false, error: "Application not found" };
            if (app.status !== 'pending') return { success: false, error: `Application is already ${app.status}` };

            const role = (app.type || 'reviewer') as 'editor' | 'reviewer';
            const invitationToken = crypto.randomBytes(32).toString('hex');
            const expires = new Date();
            expires.setHours(expires.getHours() + 168); // 7-day window for account setup

            const userId = crypto.randomUUID();

            // 1. Create User
            await tx.insert(users).values({
                id: userId,
                email: app.email,
                role: role,
            });

            await tx.insert(userProfiles).values({
                userId: userId,
                fullName: app.fullName,
                designation: app.designation,
                institute: app.institute,
                nationality: app.nationality || 'India',
                photoUrl: app.photoUrl || null,
            });

            // 3. Create Invitation
            await tx.insert(userInvitations).values({
                email: app.email,
                role: role,
                token: invitationToken,
                expiresAt: expires,
                invitedBy: adminId,
            });

            // 4. Update Application Status
            await tx.update(applications)
                .set({
                    status: 'approved',
                    reviewedAt: new Date(),
                    reviewedBy: adminId
                })
                .where(eq(applications.id, id));

            return { success: true, app, role, invitationToken };
        });

        if (!result.success) return result as ActionResponse;

        const { app, role, invitationToken } = result as { app: Application, role: string, invitationToken: string };

        // 5. Send Invitation Email
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org';
        const setupUrl = `${baseUrl}/auth/setup-password?token=${invitationToken}&ctx=setup`;

        const template = emailTemplates.boardInvitation(app.fullName, role, setupUrl);

        await sendEmail({
            to: app.email,
            subject: template.subject,
            html: template.html
        });

        updateTag(CACHE_TAGS.EDITORIAL_BOARD);
        revalidatePath("/admin/applications");
        revalidatePath("/admin/users");
        revalidatePath("/editorial-board");
        return { success: true };
    } catch (error) {
        console.error("Approve Application Error:", error);
        return serverError(error, "approve application");
    }
}

/**
 * Reject an application
 */
export async function rejectApplication(id: number, reason: string): Promise<ActionResponse> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized: Admin or Editor session required." };
    }
    const adminId = session.user.id;

    if (!reason || reason.trim().length < 20) {
        return { success: false, error: "Rejection reason must be at least 20 characters long." };
    }

    try {
        const appRows = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
        const app = appRows[0];
        if (!app) return { success: false, error: "Application not found" };

        if (app.status !== 'pending') {
            return { success: false, error: `Application is already ${app.status}` };
        }

        const role = app.type || 'reviewer';

        // 1. Update status to rejected first (DB is source of truth)
        await db.update(applications)
            .set({
                status: 'rejected',
                reviewedAt: new Date(),
                reviewedBy: adminId
            })
            .where(eq(applications.id, id));

        // 2. Send Rejection Email (fire-and-forget — DB already committed)
        const template = emailTemplates.boardRejection(app.fullName, role, reason);
        sendEmailWithRetry({
            to: app.email,
            subject: template.subject,
            html: template.html
        }, "board rejection");

        revalidatePath("/admin/applications");
        return { success: true };
    } catch (error) {
        console.error("Reject Application Error:", error);
        return { success: false, error: "Failed to reject application" };
    }
}

/**
 * Bulk approve applications
 */
export async function bulkApproveApplications(ids: number[]): Promise<ActionResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    const results = { successCount: 0, failCount: 0, errors: [] as string[] };

    for (const id of ids) {
        try {
            const res = await approveApplication(id);
            if (res.success) {
                results.successCount++;
            } else {
                results.failCount++;
                results.errors.push(`ID ${id}: ${res.error}`);
            }
        } catch (e) {
            results.failCount++;
            const message = e instanceof Error ? e.message : String(e);
            results.errors.push(`ID ${id}: ${message}`);
        }
    }

    revalidatePath("/admin/applications");
    revalidatePath("/admin/users");
    return { success: true, data: results };
}

/**
 * Bulk reject applications
 */
export async function bulkRejectApplications(ids: number[], reason: string): Promise<ActionResponse<{ successCount: number, failCount: number, errors: string[] }>> {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        return { success: false, error: "Unauthorized" };
    }

    if (!reason || reason.trim().length < 20) {
        return { success: false, error: "Rejection reason must be at least 20 characters long." };
    }

    const results = { successCount: 0, failCount: 0, errors: [] as string[] };

    for (const id of ids) {
        try {
            const res = await rejectApplication(id, reason);
            if (res.success) {
                results.successCount++;
            } else {
                results.failCount++;
                results.errors.push(`ID ${id}: ${res.error}`);
            }
        } catch (e) {
            results.failCount++;
            const message = e instanceof Error ? e.message : String(e);
            results.errors.push(`ID ${id}: ${message}`);
        }
    }

    revalidatePath("/admin/applications");
    return { success: true, data: results };
}

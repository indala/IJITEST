"use server";
import "server-only";

import { db } from "@/lib/db";
import { announcements } from "@/db/schema";
import { eq, desc, and, or, isNull, gt, sql } from "drizzle-orm";
import {
    type Announcement,
    type AnnouncementType
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath, cacheLife, cacheTag } from "next/cache";
import { uploadFileToStorage, safeDeleteFile } from "@/lib/fs-utils";
import { sanitizeAnnouncementHtml } from "@/lib/announcement-content";



/**
 * Public query: Fetch active announcements (auto-seeds if empty).
 * Filters out expired announcements and inactive ones.
 */
export async function getAnnouncements(options?: {
    type?: AnnouncementType;
    limit?: number;
}): Promise<ActionResponse<Announcement[]>> {
    'use cache';
    cacheLife('hours');
    cacheTag('announcements');

    try {


        const conditions = [
            eq(announcements.isActive, true),
            or(isNull(announcements.dateExpire), gt(announcements.dateExpire, sql`NOW()`))
        ];

        if (options?.type) {
            conditions.push(eq(announcements.type, options.type));
        }

        const query = db.select()
            .from(announcements)
            .where(and(...conditions))
            .orderBy(desc(announcements.priority), desc(announcements.createdAt));

        if (options?.limit && options.limit > 0) {
            const rows = await query.limit(options.limit);
            return actionSuccess(rows);
        }

        const rows = await query;
        return actionSuccess(rows);
    } catch (error) {
        console.error("Get announcements error:", error);
        return serverError(error, "fetch announcements");
    }
}

/**
 * Public query: Fetch a single announcement by ID.
 */
export async function getAnnouncementById(id: number): Promise<ActionResponse<Announcement>> {
    'use cache';
    cacheLife('hours');
    cacheTag('announcements');

    try {
        const rows = await db.select()
            .from(announcements)
            .where(eq(announcements.id, id))
            .limit(1);

        if (!rows.length || !rows[0]) {
            return actionError("Announcement not found");
        }

        return actionSuccess(rows[0]);
    } catch (error) {
        console.error("Get announcement by id error:", error);
        return serverError(error, "fetch announcement details");
    }
}

/**
 * Admin query: Fetch all announcements (including inactive and expired).
 */
export async function getAllAnnouncementsAdmin(): Promise<ActionResponse<Announcement[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }



        const rows = await db.select()
            .from(announcements)
            .orderBy(desc(announcements.priority), desc(announcements.createdAt));

        return actionSuccess(rows);
    } catch (error) {
        console.error("Get all announcements admin error:", error);
        return serverError(error, "fetch admin announcements");
    }
}

/**
 * Admin action: Create a new announcement, optionally uploading banner image to storage-service.
 */
export async function createAnnouncement(formData: FormData): Promise<ActionResponse<Announcement>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const title = (formData.get("title") as string || "").trim();
        const type = (formData.get("type") as AnnouncementType) || "news";
        const descriptionShort = (formData.get("descriptionShort") as string || "").trim() || null;
        const description = sanitizeAnnouncementHtml((formData.get("description") as string || "").trim());
        const imageAltText = (formData.get("imageAltText") as string || "").trim() || null;
        const priorityStr = formData.get("priority") as string;
        const priority = priorityStr ? parseInt(priorityStr, 10) || 0 : 0;
        const isActive = formData.get("isActive") !== "false";
        const dateExpireStr = formData.get("dateExpire") as string;
        const dateExpire = dateExpireStr ? new Date(dateExpireStr) : null;

        if (!title) {
            return actionError("Title is required");
        }
        if (!description) {
            return actionError("Description is required");
        }

        let imageUrl: string | null = null;
        const imageFile = formData.get("image") as File | null;

        if (imageFile && imageFile.size > 0) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
            if (!allowedTypes.includes(imageFile.type)) {
                return actionError("Invalid image format. Supported formats: PNG, JPG, WEBP, GIF, SVG.");
            }
            if (imageFile.size > 5 * 1024 * 1024) {
                return actionError("Image file size exceeds 5MB limit.");
            }

            const cleanName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storagePath = `announcements/${Date.now()}-${cleanName}`;
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            await uploadFileToStorage(storagePath, buffer, cleanName);
            imageUrl = `/api/files/${storagePath}`;
        }

        const insertResult = await db.insert(announcements).values({
            title,
            type,
            descriptionShort,
            description,
            imageUrl,
            imageAltText,
            dateExpire,
            isActive,
            priority,
        });

        const newId = Number(insertResult[0]?.insertId);
        const createdRow = await db.select().from(announcements).where(eq(announcements.id, newId)).limit(1);

        revalidatePath("/announcements");
        revalidatePath("/admin/announcements");
        revalidatePath("/editor/announcements");
        revalidatePath("/");

        if (!createdRow.length || !createdRow[0]) {
            return actionError("Failed to retrieve created announcement");
        }

        return actionSuccess(createdRow[0]);
    } catch (error) {
        console.error("Create announcement error:", error);
        return serverError(error, "create announcement");
    }
}

/**
 * Admin action: Update an existing announcement.
 */
export async function updateAnnouncement(id: number, formData: FormData): Promise<ActionResponse<Announcement>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const existingRows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
        if (!existingRows.length || !existingRows[0]) {
            return actionError("Announcement not found");
        }
        const existing = existingRows[0];

        const title = (formData.get("title") as string || "").trim();
        const type = (formData.get("type") as AnnouncementType) || "news";
        const descriptionShort = (formData.get("descriptionShort") as string || "").trim() || null;
        const description = sanitizeAnnouncementHtml((formData.get("description") as string || "").trim());
        const imageAltText = (formData.get("imageAltText") as string || "").trim() || null;
        const priorityStr = formData.get("priority") as string;
        const priority = priorityStr !== null && priorityStr !== undefined ? parseInt(priorityStr, 10) || 0 : existing.priority;
        const isActiveStr = formData.get("isActive") as string;
        const isActive = isActiveStr !== null && isActiveStr !== undefined ? isActiveStr === "true" : existing.isActive;
        const dateExpireStr = formData.get("dateExpire") as string;
        const dateExpire = dateExpireStr ? new Date(dateExpireStr) : null;
        const removeImage = formData.get("removeImage") === "true";

        if (!title) {
            return actionError("Title is required");
        }
        if (!description) {
            return actionError("Description is required");
        }

        let imageUrl = existing.imageUrl;

        if (removeImage && existing.imageUrl) {
            await safeDeleteFile(existing.imageUrl);
            imageUrl = null;
        }

        const imageFile = formData.get("image") as File | null;
        if (imageFile && imageFile.size > 0) {
            const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/svg+xml'];
            if (!allowedTypes.includes(imageFile.type)) {
                return actionError("Invalid image format. Supported formats: PNG, JPG, WEBP, GIF, SVG.");
            }
            if (imageFile.size > 5 * 1024 * 1024) {
                return actionError("Image file size exceeds 5MB limit.");
            }

            if (existing.imageUrl) {
                await safeDeleteFile(existing.imageUrl);
            }

            const cleanName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
            const storagePath = `announcements/${Date.now()}-${cleanName}`;
            const buffer = Buffer.from(await imageFile.arrayBuffer());

            await uploadFileToStorage(storagePath, buffer, cleanName);
            imageUrl = `/api/files/${storagePath}`;
        }

        await db.update(announcements)
            .set({
                title,
                type,
                descriptionShort,
                description,
                imageUrl,
                imageAltText,
                dateExpire,
                isActive,
                priority,
                updatedAt: new Date(),
            })
            .where(eq(announcements.id, id));

        const updatedRows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);

        revalidatePath("/announcements");
        revalidatePath(`/announcements/${id}`);
        revalidatePath("/admin/announcements");
        revalidatePath("/editor/announcements");
        revalidatePath("/");

        if (!updatedRows.length || !updatedRows[0]) {
            return actionError("Failed to retrieve updated announcement");
        }

        return actionSuccess(updatedRows[0]);
    } catch (error) {
        console.error("Update announcement error:", error);
        return serverError(error, "update announcement");
    }
}

/**
 * Admin action: Delete an announcement.
 */
export async function deleteAnnouncement(id: number): Promise<ActionResponse<{ id: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const existingRows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
        if (existingRows.length && existingRows[0]?.imageUrl) {
            await safeDeleteFile(existingRows[0].imageUrl);
        }

        await db.delete(announcements).where(eq(announcements.id, id));

        revalidatePath("/announcements");
        revalidatePath(`/announcements/${id}`);
        revalidatePath("/admin/announcements");
        revalidatePath("/editor/announcements");
        revalidatePath("/");

        return actionSuccess({ id });
    } catch (error) {
        console.error("Delete announcement error:", error);
        return serverError(error, "delete announcement");
    }
}

/**
 * Admin action: Toggle active status.
 */
export async function toggleAnnouncementStatus(id: number): Promise<ActionResponse<{ id: number; isActive: boolean }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized. Admin or Editor privileges required.");
        }

        const existingRows = await db.select().from(announcements).where(eq(announcements.id, id)).limit(1);
        if (!existingRows.length || !existingRows[0]) {
            return actionError("Announcement not found");
        }

        const newStatus = !existingRows[0].isActive;
        await db.update(announcements)
            .set({ isActive: newStatus, updatedAt: new Date() })
            .where(eq(announcements.id, id));

        revalidatePath("/announcements");
        revalidatePath(`/announcements/${id}`);
        revalidatePath("/admin/announcements");
        revalidatePath("/editor/announcements");
        revalidatePath("/");

        return actionSuccess({ id, isActive: newStatus });
    } catch (error) {
        console.error("Toggle announcement status error:", error);
        return serverError(error, "toggle announcement status");
    }
}

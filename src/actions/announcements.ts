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

const DEFAULT_ANNOUNCEMENTS = [
    {
        title: "Call for Papers: Volume 14, Issue 1 (2026)",
        type: "call_for_papers" as const,
        descriptionShort: "Submissions are cordially invited for the upcoming issue covering novel research in Engineering, Computer Science, and Emerging Technologies.",
        description: `We invite researchers, academicians, and industry practitioners worldwide to submit their original, unpublished research papers, review articles, and technical notes for Volume 14, Issue 1 of the International Journal of Innovative Technology and Exploring Science (IJITEST).

### Scope and Topics
- Artificial Intelligence, Machine Learning & Deep Neural Architectures
- Distributed Computing, Cloud Services & Edge Analytics
- Cyber-Physical Systems, IoT & Network Security
- Advanced Robotics, Mechatronics & Autonomous Navigation
- Renewable Energy Systems & Green Technology
- Data Science, Big Data Engineering & Predictive Modeling

### Submission Benefits
- **Rigorous Peer Review**: Double-blind peer review by international subject matter experts.
- **Open Access**: Immediate global dissemination with CC-BY 4.0 licensing.
- **Persistent Identification**: Digital Object Identifier (DOI) assigned to all published articles.
- **Fast-Track Review**: Initial editorial screening within 48-72 hours.

Manuscripts can be submitted directly through the online submission portal.`,
        imageUrl: null,
        imageAltText: "Call for Papers Announcement Banner",
        dateExpire: null,
        isActive: true,
        priority: 10,
    },
    {
        title: "IJITEST Adopts Enhanced Scholarly Metadata Standards (JATS 1.3 & PubMed NLM)",
        type: "news" as const,
        descriptionShort: "Our publishing workflow now exports compliant JATS 1.3 XML, PubMed MEDLINE XML, and DOAJ metadata to accelerate global indexing.",
        description: `In line with international scholarly publishing best practices and Open Journal Systems (OJS) interoperability protocols, IJITEST has officially deployed full-text **JATS 1.3 XML**, **PubMed MEDLINE 2.8 XML**, and **DOAJ 0.2** automated syndication pipelines.

Authors and readers can now download structured XML galleys directly from article landing pages. Furthermore, real-time CrossMark policy verification and RSS/Atom web syndication feeds are active to enhance transparency and discoverability across academic indexers worldwide.`,
        imageUrl: null,
        imageAltText: "Scholarly Metadata Standards",
        dateExpire: null,
        isActive: true,
        priority: 5,
    },
    {
        title: "Updated Author Guidelines & Reviewer Ethics Policy",
        type: "editorial_update" as const,
        descriptionShort: "Review our revised submission formatting requirements, CRediT authorship taxonomy, and COPE-compliant conflict of interest standards.",
        description: `The Editorial Board of IJITEST has ratified revised author guidelines to streamline the peer review lifecycle:

1. **Section Classifications**: Submissions must now be categorized into Original Research, Review Articles, Short Communications, or Case Studies.
2. **Author Reviewer Suggestions**: Authors may now nominate up to three preferred peer reviewers and declare any opposed reviewers with substantiated conflict of interest justifications.
3. **Audit Trail**: Every manuscript revision and editorial decision is recorded with complete audit transparency.

Please ensure your manuscripts follow the prescribed template before submission.`,
        imageUrl: null,
        imageAltText: "Author Guidelines Update",
        dateExpire: null,
        isActive: true,
        priority: 1,
    }
];

/**
 * Seeds default announcements if none exist in the database.
 */
export async function seedDefaultAnnouncements(): Promise<ActionResponse<Announcement[]>> {
    try {
        const existing = await db.select().from(announcements).limit(1);
        if (existing.length === 0) {
            for (const item of DEFAULT_ANNOUNCEMENTS) {
                await db.insert(announcements).values(item);
            }
        }
        const all = await db.select().from(announcements).orderBy(desc(announcements.priority), desc(announcements.createdAt));
        return actionSuccess(all);
    } catch (error) {
        console.error("Seed default announcements error:", error);
        return serverError(error, "seed default announcements");
    }
}

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
        // Auto-seed if empty
        const countCheck = await db.select().from(announcements).limit(1);
        if (countCheck.length === 0) {
            await seedDefaultAnnouncements();
        }

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

        // Auto-seed if empty
        const countCheck = await db.select().from(announcements).limit(1);
        if (countCheck.length === 0) {
            await seedDefaultAnnouncements();
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
        const description = (formData.get("description") as string || "").trim();
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
        const description = (formData.get("description") as string || "").trim();
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
        revalidatePath("/");

        return actionSuccess({ id, isActive: newStatus });
    } catch (error) {
        console.error("Toggle announcement status error:", error);
        return serverError(error, "toggle announcement status");
    }
}

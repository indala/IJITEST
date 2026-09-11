"use server";
import "server-only";

import { db } from "@/lib/db";
import { sections, submissions } from "@/db/schema";
import { eq, asc, count } from "drizzle-orm";
import {
    type Section,
    type NewSection
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DEFAULT_SECTIONS: Omit<NewSection, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
        title: "Original Research Articles",
        abbrev: "RES",
        policy: "Original empirical or theoretical research contributing new findings and insights to engineering, science, and technology.",
        identifyType: "Research Article",
        wordCount: 8000,
        metaIndexed: true,
        metaReviewed: true,
        abstractsNotRequired: false,
        hideTitle: false,
        hideAuthor: false,
        editorRestricted: false,
        isInactive: false,
        sequence: 1,
    },
    {
        title: "Review Articles",
        abbrev: "REV",
        policy: "Comprehensive, state-of-the-art literature reviews summarizing emerging trends, critical methodologies, and future directions.",
        identifyType: "Review Article",
        wordCount: 12000,
        metaIndexed: true,
        metaReviewed: true,
        abstractsNotRequired: false,
        hideTitle: false,
        hideAuthor: false,
        editorRestricted: false,
        isInactive: false,
        sequence: 2,
    },
    {
        title: "Short Communications & Technical Notes",
        abbrev: "COMM",
        policy: "Brief, high-priority reports on preliminary findings, novel software tools, or urgent research breakthroughs.",
        identifyType: "Short Communication",
        wordCount: 4000,
        metaIndexed: true,
        metaReviewed: true,
        abstractsNotRequired: false,
        hideTitle: false,
        hideAuthor: false,
        editorRestricted: false,
        isInactive: false,
        sequence: 3,
    },
    {
        title: "Case Studies",
        abbrev: "CASE",
        policy: "In-depth industrial or applied case analyses examining engineering implementation challenges, validation, and real-world outcomes.",
        identifyType: "Case Study",
        wordCount: 6000,
        metaIndexed: true,
        metaReviewed: true,
        abstractsNotRequired: false,
        hideTitle: false,
        hideAuthor: false,
        editorRestricted: false,
        isInactive: false,
        sequence: 4,
    }
];

/**
 * Ensures standard journal sections are seeded in the database if none exist.
 */
export async function seedDefaultSections(): Promise<ActionResponse<Section[]>> {
    try {
        const existing = await db.select().from(sections).limit(1);
        if (existing.length === 0) {
            for (const item of DEFAULT_SECTIONS) {
                await db.insert(sections).values(item);
            }
        }
        const allSections = await db.select().from(sections).orderBy(asc(sections.sequence));
        return actionSuccess(allSections);
    } catch (error) {
        console.error("Seed default sections error:", error);
        return serverError(error, "seed default sections");
    }
}

/**
 * Public query: Fetch all active sections for author submission dropdown and public browsing.
 */
export async function getSections(): Promise<ActionResponse<Section[]>> {
    try {
        // Auto-seed if empty
        const countRes = await db.select({ val: count() }).from(sections);
        if ((countRes[0]?.val ?? 0) === 0) {
            await seedDefaultSections();
        }

        const rows = await db.select()
            .from(sections)
            .where(eq(sections.isInactive, false))
            .orderBy(asc(sections.sequence), asc(sections.title));

        return actionSuccess(rows);
    } catch (error) {
        console.error("Get sections error:", error);
        return serverError(error, "fetch journal sections");
    }
}

/**
 * Admin query: Fetch all sections including inactive/hidden sections.
 */
export async function getAllSectionsAdmin(): Promise<ActionResponse<(Section & { submissionCount: number })[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized: Admin or Editor privileges required.");
        }

        const countRes = await db.select({ val: count() }).from(sections);
        if ((countRes[0]?.val ?? 0) === 0) {
            await seedDefaultSections();
        }

        const allSections = await db.select().from(sections).orderBy(asc(sections.sequence));

        // Get submission counts per section
        const subCounts = await db.select({
            sectionId: submissions.sectionId,
            total: count()
        })
        .from(submissions)
        .groupBy(submissions.sectionId);

        const countMap = new Map<number, number>();
        for (const item of subCounts) {
            if (item.sectionId != null) {
                countMap.set(item.sectionId, item.total);
            }
        }

        const enriched = allSections.map(sec => ({
            ...sec,
            submissionCount: countMap.get(sec.id) || 0
        }));

        return actionSuccess(enriched);
    } catch (error) {
        console.error("Get all sections admin error:", error);
        return serverError(error, "fetch all admin sections");
    }
}

/**
 * Admin action: Create a new journal section.
 */
export async function createSection(data: {
    title: string;
    abbrev: string;
    policy?: string | null;
    identifyType?: string | null;
    wordCount?: number | null;
    metaIndexed?: boolean;
    metaReviewed?: boolean;
    abstractsNotRequired?: boolean;
    hideTitle?: boolean;
    hideAuthor?: boolean;
    editorRestricted?: boolean;
    isInactive?: boolean;
    sequence?: number;
}): Promise<ActionResponse<Section>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Only Administrators can create sections.");
        }

        if (!data.title || data.title.trim().length < 2) {
            return actionError("Section title must be at least 2 characters.");
        }
        if (!data.abbrev || data.abbrev.trim().length < 1) {
            return actionError("Section abbreviation is required (e.g. RES, REV).");
        }

        const [result] = await db.insert(sections).values({
            title: data.title.trim(),
            abbrev: data.abbrev.trim().toUpperCase(),
            policy: data.policy?.trim() || null,
            identifyType: data.identifyType?.trim() || null,
            wordCount: data.wordCount ? Number(data.wordCount) : null,
            metaIndexed: data.metaIndexed ?? true,
            metaReviewed: data.metaReviewed ?? true,
            abstractsNotRequired: data.abstractsNotRequired ?? false,
            hideTitle: data.hideTitle ?? false,
            hideAuthor: data.hideAuthor ?? false,
            editorRestricted: data.editorRestricted ?? false,
            isInactive: data.isInactive ?? false,
            sequence: data.sequence ?? 0,
        });

        const [created] = await db.select().from(sections).where(eq(sections.id, result.insertId));
        revalidatePath('/submit');
        revalidatePath('/admin/settings/sections');
        return actionSuccess(created, "Section created successfully.");
    } catch (error) {
        console.error("Create section error:", error);
        return serverError(error, "create journal section");
    }
}

/**
 * Admin action: Update an existing journal section.
 */
export async function updateSection(id: number, data: {
    title?: string;
    abbrev?: string;
    policy?: string | null;
    identifyType?: string | null;
    wordCount?: number | null;
    metaIndexed?: boolean;
    metaReviewed?: boolean;
    abstractsNotRequired?: boolean;
    hideTitle?: boolean;
    hideAuthor?: boolean;
    editorRestricted?: boolean;
    isInactive?: boolean;
    sequence?: number;
}): Promise<ActionResponse<Section>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Only Administrators can update sections.");
        }

        const [existing] = await db.select().from(sections).where(eq(sections.id, id));
        if (!existing) {
            return actionError("Section not found.");
        }

        const updateData: Partial<NewSection> = {};
        if (data.title !== undefined) updateData.title = data.title.trim();
        if (data.abbrev !== undefined) updateData.abbrev = data.abbrev.trim().toUpperCase();
        if (data.policy !== undefined) updateData.policy = data.policy?.trim() || null;
        if (data.identifyType !== undefined) updateData.identifyType = data.identifyType?.trim() || null;
        if (data.wordCount !== undefined) updateData.wordCount = data.wordCount ? Number(data.wordCount) : null;
        if (data.metaIndexed !== undefined) updateData.metaIndexed = data.metaIndexed;
        if (data.metaReviewed !== undefined) updateData.metaReviewed = data.metaReviewed;
        if (data.abstractsNotRequired !== undefined) updateData.abstractsNotRequired = data.abstractsNotRequired;
        if (data.hideTitle !== undefined) updateData.hideTitle = data.hideTitle;
        if (data.hideAuthor !== undefined) updateData.hideAuthor = data.hideAuthor;
        if (data.editorRestricted !== undefined) updateData.editorRestricted = data.editorRestricted;
        if (data.isInactive !== undefined) updateData.isInactive = data.isInactive;
        if (data.sequence !== undefined) updateData.sequence = data.sequence;

        await db.update(sections).set(updateData).where(eq(sections.id, id));

        const [updated] = await db.select().from(sections).where(eq(sections.id, id));
        revalidatePath('/submit');
        revalidatePath('/admin/settings/sections');
        return actionSuccess(updated, "Section updated successfully.");
    } catch (error) {
        console.error("Update section error:", error);
        return serverError(error, "update journal section");
    }
}

/**
 * Admin action: Delete a journal section.
 */
export async function deleteSection(id: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return actionError("Unauthorized: Only Administrators can delete sections.");
        }

        // Check if submissions reference this section
        const subCount = await db.select({ val: count() })
            .from(submissions)
            .where(eq(submissions.sectionId, id));

        if ((subCount[0]?.val ?? 0) > 0) {
            // Unlink submissions first
            await db.update(submissions)
                .set({ sectionId: null })
                .where(eq(submissions.sectionId, id));
        }

        await db.delete(sections).where(eq(sections.id, id));
        revalidatePath('/submit');
        revalidatePath('/admin/settings/sections');
        return actionSuccess(undefined, "Section deleted successfully.");
    } catch (error) {
        console.error("Delete section error:", error);
        return serverError(error, "delete journal section");
    }
}

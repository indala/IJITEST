import "server-only";
import { updateTag, revalidateTag, revalidatePath } from "next/cache";
import { cacheLogger } from "./cache-logger";
import { CACHE_TAGS } from "./cache-tags";
import { db } from "./db";
import { submissions } from "@/db/schema";

/**
 * Robust dual cache invalidator for Next.js 16:
 * 1. Calls `updateTag(tag)` for immediate read-your-own-writes consistency in Server Actions.
 * 2. Calls `revalidateTag(tag, { expire: 0 })` so background and subsequent client requests immediately expire stale cached entries.
 */
export function purgeCacheTags(...tags: string[]): void {
    for (const tag of tags) {
        if (!tag) continue;
        try {
            cacheLogger.invalidation(tag);
            updateTag(tag);
        } catch {
            // updateTag can throw outside Server Action context
        }
        try {
            revalidateTag(tag, { expire: 0 });
        } catch {
            try {
                (revalidateTag as unknown as (t: string) => void)(tag);
            } catch {
                // ignore
            }
        }
    }
}

/**
 * Revalidates public pages and layouts when an issue or paper is published or updated.
 */
export function purgePublicationRoutes(volume?: number | null, issue?: number | null, paperId?: string | null): void {
    try {
        revalidatePath('/', 'page');
        revalidatePath('/current-issue', 'page');
        revalidatePath('/archives', 'page');
        revalidatePath('/archives', 'layout');

        if (volume) {
            revalidatePath(`/archives/volume${volume}`, 'page');
            if (issue) {
                revalidatePath(`/archives/volume${volume}/issue${issue}`, 'page');
                if (paperId) {
                    revalidatePath(`/archives/volume${volume}/issue${issue}/${paperId}`, 'page');
                    revalidatePath(`/article/${paperId}`);
                }
            }
        }

        revalidatePath('/admin/publications');
        revalidatePath('/admin/submissions');
    } catch (err) {
        console.error("Failed to purge publication routes:", err);
    }
}

/**
 * Master Purge: Invalidate every data cache tag, entity tag, and route layout tree.
 * Use after manual SQL/database updates, schema updates, or when forcing total freshness.
 */
export async function purgeAllSystemCachesInternal(): Promise<{ purgedTagsCount: number; timestamp: number }> {
    // 1. Gather all global cache tags
    const globalTags: string[] = [
        CACHE_TAGS.SETTINGS,
        CACHE_TAGS.SECTIONS,
        CACHE_TAGS.PUBLIC_DATA,
        CACHE_TAGS.PUBLICATIONS,
        CACHE_TAGS.LATEST_ISSUE,
        CACHE_TAGS.ARCHIVES,
        CACHE_TAGS.ANNOUNCEMENTS,
        CACHE_TAGS.SUBMISSIONS,
        CACHE_TAGS.EDITORIAL_BOARD,
        CACHE_TAGS.MESSAGES_PENDING_COUNT,
        CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT,
    ];

    // 2. Gather specific submission and paper tags from DB (best-effort)
    const specificTags: string[] = [];
    try {
        const rows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
        }).from(submissions);

        for (const row of rows) {
            specificTags.push(CACHE_TAGS.SUBMISSION(row.id));
            if (row.paperId) {
                specificTags.push(CACHE_TAGS.PAPER(row.paperId));
            }
        }
    } catch (e) {
        console.warn("Could not query submissions for complete tag purge:", e);
    }

    const allTags = [...new Set([...globalTags, ...specificTags])];
    purgeCacheTags(...allTags);

    // 3. Revalidate entire site layout & core router branches
    try {
        revalidatePath('/', 'layout');
        revalidatePath('/', 'page');
        revalidatePath('/admin', 'layout');
        revalidatePath('/author', 'layout');
        revalidatePath('/editor', 'layout');
        revalidatePath('/reviewer', 'layout');
        revalidatePath('/archives', 'layout');
        revalidatePath('/current-issue', 'page');
        revalidatePath('/admin/submissions', 'page');
        revalidatePath('/admin/publications', 'page');
        revalidatePath('/admin/settings', 'page');
    } catch (err) {
        console.error("Failed to revalidate paths during master cache purge:", err);
    }

    return {
        purgedTagsCount: allTags.length,
        timestamp: Date.now(),
    };
}

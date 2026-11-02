import "server-only";
import { updateTag, revalidateTag, revalidatePath } from "next/cache";
import { cacheLogger } from "./cache-logger";

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

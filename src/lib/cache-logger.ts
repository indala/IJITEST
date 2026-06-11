import "server-only";

export const cacheLogger = {
    info(message: string): void {
        console.log(`[CACHE INFO] ${message}`);
    },
    miss(tag: string, details?: string): void {
        const detailsStr = details ? ` (${details})` : "";
        console.info(`[CACHE MISS] Tag: ${tag}${detailsStr} - Fetching from Source`);
    },
    invalidation(tag: string, reason?: string): void {
        const reasonStr = reason ? ` [Reason: ${reason}]` : "";
        console.info(`[CACHE INVALIDATION] Evicting tag: ${tag}${reasonStr}`);
    },
    error(tag: string, error: unknown): void {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(`[CACHE ERROR] Tag: ${tag} - Error: ${errorMsg}`);
    }
};

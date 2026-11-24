"use server";
import "server-only";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { purgeAllSystemCachesInternal } from "@/lib/cache-invalidation";
import { actionSuccess, actionError, serverError, type ActionResponse } from "@/lib/action-response";

export async function purgeAllSystemCaches(): Promise<ActionResponse<{ purgedTagsCount: number; timestamp: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return actionError("Unauthorized: Admin or Editor role required.");
        }

        const result = await purgeAllSystemCachesInternal();
        return actionSuccess(result);
    } catch (error) {
        console.error("Error purging all system caches:", error);
        return serverError(error, "purge system cache");
    }
}

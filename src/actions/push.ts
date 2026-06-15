"use server";
import "server-only";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { type ActionResponse } from "@/db/types";

/**
 * Saves or updates a device's push subscription for the logged-in user.
 */
export async function savePushSubscription(
    endpoint: string,
    p256dh: string,
    auth: string
): Promise<ActionResponse<void>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }

        const userId = session.user.id;

        // Perform clean upsert by checking existence of endpoint
        const [existing] = await db.select()
            .from(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, endpoint))
            .limit(1);

        if (existing) {
            await db.update(pushSubscriptions)
                .set({ userId, p256dh, auth })
                .where(eq(pushSubscriptions.endpoint, endpoint));
        } else {
            await db.insert(pushSubscriptions).values({
                userId,
                endpoint,
                p256dh,
                auth
            });
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Deletes a push subscription endpoint (called on sign out or when endpoint expires).
 */
export async function deletePushSubscription(endpoint: string): Promise<ActionResponse<void>> {
    try {
        await db.delete(pushSubscriptions)
            .where(eq(pushSubscriptions.endpoint, endpoint));
        return { success: true };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

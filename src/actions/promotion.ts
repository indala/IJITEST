"use server";
import "server-only"

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { type ActionResponse, serverError } from "@/db/types";


export async function markPromotionAsSeen(): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: "Unauthenticated" };

        const userId = session.user.id;

        await db.update(users)
            .set({ hasSeenPromotion: true })
            .where(eq(users.id, userId));

        revalidatePath('/admin/submissions');
        return { success: true, data: undefined };

    } catch (error) {
        console.error("Mark Promotion As Seen Error:", error);
        return serverError(error, "update promotion status");
    }
}

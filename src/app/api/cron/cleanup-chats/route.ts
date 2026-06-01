import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { chatMessages } from "@/db/schema";
import { lt } from "drizzle-orm";

export const dynamic = 'force-dynamic';

/**
 * Cron endpoint: Prune chat history older than 2 months.
 * Trigger via external monthly scheduler (e.g. Hostinger Cron Jobs).
 *
 * Security: Protected by CRON_SECRET env var header check.
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env['CRON_SECRET'];

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const cutoffDate = new Date();
        cutoffDate.setMonth(cutoffDate.getMonth() - 2);

        // Delete chat messages older than 2 months
        await db.delete(chatMessages)
            .where(lt(chatMessages.createdAt, cutoffDate));

        return NextResponse.json({
            success: true,
            message: "Chat history pruning completed successfully.",
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Cron chat cleanup failed:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

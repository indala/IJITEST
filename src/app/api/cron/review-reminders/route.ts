import { NextResponse } from "next/server";
import { processReviewReminders } from "@/lib/review-reminders";

/**
 * Cron endpoint: Trigger peer review deadline reminders and escalations.
 * Security: Protected by CRON_SECRET token check via Authorization header.
 *
 * Schedule: Daily
 * Trigger: GET /api/cron/review-reminders
 */
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env['CRON_SECRET'];

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const result = await processReviewReminders();
        return NextResponse.json({
            success: true,
            ...result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Cron review reminder trigger failed:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

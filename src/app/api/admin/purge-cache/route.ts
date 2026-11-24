import { NextResponse, type NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { purgeAllSystemCachesInternal } from "@/lib/cache-invalidation";

export async function POST(req: NextRequest) {
    return handlePurge(req);
}

export async function GET(req: NextRequest) {
    return handlePurge(req);
}

async function handlePurge(req: NextRequest) {
    const cronSecret = process.env['CRON_SECRET'];
    const authHeader = req.headers.get("authorization");
    const secretQuery = req.nextUrl.searchParams.get("secret");

    const isSecretAuthorized = Boolean(
        cronSecret && (
            secretQuery === cronSecret || 
            authHeader === `Bearer ${cronSecret}`
        )
    );

    if (!isSecretAuthorized) {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return NextResponse.json(
                { success: false, error: "Unauthorized. Provide valid admin session or ?secret=CRON_SECRET." },
                { status: 401 }
            );
        }
    }

    const result = await purgeAllSystemCachesInternal();

    return NextResponse.json({
        success: true,
        message: "All Next.js system caches and route trees purged successfully.",
        purgedTagsCount: result.purgedTagsCount,
        timestamp: result.timestamp,
    });
}

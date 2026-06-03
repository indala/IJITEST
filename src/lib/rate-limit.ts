import 'server-only'
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { rateLimits } from "@/db/schema";

type LimitConfig = {
    key: string;
    max: number;
    windowMs: number;
};

export type LimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
};

export async function checkRateLimit({ key, max, windowMs }: LimitConfig): Promise<LimitResult> {
    const now = Date.now();
    const nextResetAt = now + windowMs;

    await db.execute(sql`
        INSERT INTO ${rateLimits} (\`key\`, \`count\`, \`reset_at\`)
        VALUES (${key}, 1, ${nextResetAt})
        ON DUPLICATE KEY UPDATE
            \`count\` = IF(\`reset_at\` <= ${now}, 1, \`count\` + 1),
            \`reset_at\` = IF(\`reset_at\` <= ${now}, ${nextResetAt}, \`reset_at\`)
    `);

    const rows = await db.select({
        count: rateLimits.count,
        resetAt: rateLimits.resetAt,
    })
    .from(rateLimits)
    .where(eq(rateLimits.key, key))
    .limit(1);

    const row = rows[0];
    if (!row) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, Math.ceil(windowMs / 1000)),
        };
    }

    const allowed = row.count <= max;
    const retryAfterSeconds = Math.max(1, Math.ceil((row.resetAt - now) / 1000));
    return {
        allowed,
        remaining: Math.max(0, max - row.count),
        retryAfterSeconds,
    };
}

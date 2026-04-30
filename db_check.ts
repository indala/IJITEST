import "dotenv/config";
import { db } from "./src/lib/db";
import { submissions, settings } from "./src/db/schema";
import { eq } from "drizzle-orm";

async function check() {
    try {
        console.log("Checking database state...");
        
        // 1. Check sequence
        const currentYear = new Date().getFullYear().toString();
        const seqKey = `submission_sequence_${currentYear}`;
        const seqRes = await db.select().from(settings).where(eq(settings.settingKey, seqKey));
        console.log("Sequence info:", seqRes);

        // 2. Check for conflicting paperId
        const conflictingId = `IJITEST-2026-0001`;
        const subRes = await db.select().from(submissions).where(eq(submissions.paperId, conflictingId));
        console.log("Conflicting submission info:", subRes);

        // 3. Check for any 4-digit paperIds
        const allSubs = await db.select({ paperId: submissions.paperId }).from(submissions).limit(5);
        console.log("Recent paperIds:", allSubs);

        // 4. Check table structure
        try {
            await db.select({ id: submissions.id, deletedAt: submissions.deletedAt }).from(submissions).limit(1);
            console.log("Table structure seems OK (id, deletedAt exist)");
        } catch (e: any) {
            console.error("Column check failed:", e.message);
        }

    } catch (error) {
        console.error("Check failed:", error);
    } finally {
        process.exit();
    }
}

check();

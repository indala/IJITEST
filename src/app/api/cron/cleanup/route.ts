import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, inArray, lt, and, sql } from "drizzle-orm";
import { users, submissions, submissionVersions, submissionFiles } from "@/db/schema";
import { safeDeleteFile } from "@/lib/fs-utils";

export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env['CRON_SECRET'];

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // 1. Identify stale submissions (> 28 days, status = rejected/revisionRequested)
        const twentyEightDaysAgo = new Date();
        twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 28);

        const staleSubmissions = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            correspondingAuthorId: submissions.correspondingAuthorId,
        })
            .from(submissions)
            .where(and(
                inArray(submissions.status, ['rejected', 'revisionRequested']),
                lt(submissions.updatedAt, twentyEightDaysAgo)
            ));

        if (staleSubmissions.length === 0) {
            return NextResponse.json({ deleted: 0, message: "No stale submissions found" });
        }

        const submissionIds = staleSubmissions.map(s => s.id);
        const authorIds = Array.from(new Set(staleSubmissions.map(s => s.correspondingAuthorId).filter(id => !!id)));

        // 2. Fetch all file URLs for cleanup
        const filesToCleanup = await db.select({ url: submissionFiles.fileUrl })
            .from(submissionFiles)
            .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
            .where(inArray(submissionVersions.submissionId, submissionIds));

        // 3. Delete files from storage service
        for (const file of filesToCleanup) {
            await safeDeleteFile(file.url);
        }

        // 4. HARD DELETE (Cascades handles versions, files, assignments in schema)
        await db.delete(submissions).where(inArray(submissions.id, submissionIds));

        // 5. Author Cleanup Safety Check
        // Only delete authors who have ZERO remaining submissions after the cleanup.
        let deletedAuthorsCount = 0;
        if (authorIds.length > 0) {
            for (const authorId of authorIds) {
                const remainingSubmissions = await db.select({ count: sql<number>`count(*)` })
                    .from(submissions)
                    .where(eq(submissions.correspondingAuthorId, authorId!));

                const result = remainingSubmissions[0];
                if (result && Number(result.count) === 0) {
                    await db.delete(users).where(and(eq(users.id, authorId!), eq(users.role, 'author')));
                    deletedAuthorsCount++;
                }
            }
        }

        console.log(`Cleanup: hard-deleted ${submissionIds.length} stale submissions and ${deletedAuthorsCount} authors.`);

        return NextResponse.json({
            deletedCount: submissionIds.length,
            deletedPapers: staleSubmissions.map(s => s.paperId),
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Cleanup Cron Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
    }
}

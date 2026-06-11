import 'server-only'
import { db } from "./db";
import { users, submissions, submissionVersions, submissionFiles } from "@/db/schema";
import { eq, and, lte, inArray, notInArray } from "drizzle-orm";
import { safeDeleteFile } from "./fs-utils";

/**
 * Automatically clean up author accounts that haven't taken action within 28 days 
 * of a rejection or revision request.
 * 
 * Logic:
 * 1. Find all authors whose ONLY submissions are older than 28 days and in 'stalled' status.
 * 2. If an author has ANY 'published' or 'underReview' paper, we DO NOT delete the account.
 * 3. Delete files from disk before removing DB records.
 */
export async function cleanupInactiveAuthors() {
    try {
        const twentyEightDaysAgo = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);

        // 1. Find submissions that reached 28-day deadline
        const stalledSubmissions = await db.select({
            id: submissions.id,
            authorId: submissions.correspondingAuthorId,
            paperId: submissions.paperId
        })
        .from(submissions)
        .where(and(
            inArray(submissions.status, ['rejected', 'revisionRequested']),
            lte(submissions.updatedAt, twentyEightDaysAgo)
        ));

        if (stalledSubmissions.length === 0) return { deletedCount: 0 };

        let deletedUserCount = 0;
        let deletedSubCount = 0;

        for (const sub of stalledSubmissions) {
            // Safety Check: Does this author have any OTHER active/published papers?
            const authorOtherPapers = await db.select()
                .from(submissions)
                .where(and(
                    eq(submissions.correspondingAuthorId, sub.authorId),
                    notInArray(submissions.status, ['rejected', 'revisionRequested']),
                    notInArray(submissions.id, [sub.id])
                ))
                .limit(1);

            const hasActivePapers = authorOtherPapers.length > 0;

            // 2. Cleanup Files on Disk for this submission
            const versions = await db.select({ id: submissionVersions.id })
                .from(submissionVersions)
                .where(eq(submissionVersions.submissionId, sub.id));
            
            for (const v of versions) {
                const files = await db.select({ url: submissionFiles.fileUrl })
                    .from(submissionFiles)
                    .where(eq(submissionFiles.versionId, v.id));
                
                for (const f of files) {
                    await safeDeleteFile(f.url);
                }
            }

            // 3. Delete Submission (Cascades usually handle versions, files, etc. in normalized DB)
            await db.delete(submissions).where(eq(submissions.id, sub.id));
            deletedSubCount++;

            // 4. Delete User if no other papers exist
            if (!hasActivePapers) {
                await db.delete(users).where(eq(users.id, sub.authorId));
                deletedUserCount++;
            }
        }

        console.log(`Cleanup Task Completed: Deleted ${deletedSubCount} stalled submissions and ${deletedUserCount} author accounts.`);
        return { deletedSubCount, deletedUserCount };

    } catch (error) {
        console.error("Cleanup Task Error:", error);
        throw error;
    }
}

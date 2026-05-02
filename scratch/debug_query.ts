import { db } from "../src/lib/db";
import { reviewAssignments, submissions, submissionVersions, submissionFiles } from "../src/db/schema";
import { sql, eq, desc } from "drizzle-orm";

async function test() {
    const manuscriptSubquery = db.select({ 
        fileUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('fileUrl'),
        versionId: submissionFiles.versionId 
    })
    .from(submissionFiles)
    .where(eq(submissionFiles.fileType, 'pdf_version'))
    .groupBy(submissionFiles.versionId)
    .as('ms');

    const query = db.select({
        id: reviewAssignments.id,
        manuscriptPath: manuscriptSubquery.fileUrl,
    })
    .from(reviewAssignments)
    .leftJoin(manuscriptSubquery, eq(reviewAssignments.versionId, manuscriptSubquery.versionId))
    .limit(5);

    const rows = await query;
    console.log("Rows:", rows);
}

test().catch(console.error);

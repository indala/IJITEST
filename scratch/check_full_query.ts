import { db } from "../src/lib/db";
import { reviewAssignments, submissions, submissionVersions, submissionFiles, userProfiles, reviews } from "../src/db/schema";
import { eq, sql, desc } from "drizzle-orm";

async function test() {
    const manuscriptSubquery = db.select({ 
        fileUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('fileUrl'),
        versionId: submissionFiles.versionId 
    })
    .from(submissionFiles)
    .where(eq(submissionFiles.fileType, 'pdf_version'))
    .groupBy(submissionFiles.versionId)
    .as('ms');

    const feedbackSubquery = db.select({ 
        fileUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as('fileUrl'),
        versionId: submissionFiles.versionId 
    })
    .from(submissionFiles)
    .where(eq(submissionFiles.fileType, 'feedback'))
    .groupBy(submissionFiles.versionId)
    .as('fs');

    let query = db.select({
        id: reviewAssignments.id,
        status: reviewAssignments.status,
        assignedAt: reviewAssignments.assignedAt,
        deadline: reviewAssignments.deadline,
        reviewRound: reviewAssignments.reviewRound,
        submissionId: reviewAssignments.submissionId,
        paperId: submissions.paperId,
        submissionStatus: submissions.status,
        title: submissionVersions.title,
        reviewerName: userProfiles.fullName,
        decision: reviews.decision,
        commentsToAuthor: reviews.commentsToAuthor,
        submittedAt: reviews.submittedAt,
        manuscriptPath: manuscriptSubquery.fileUrl,
        feedbackFilePath: feedbackSubquery.fileUrl
    })
    .from(reviewAssignments)
    .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
    .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
    .leftJoin(userProfiles, eq(reviewAssignments.reviewerId, userProfiles.userId))
    .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId))
    .leftJoin(manuscriptSubquery, eq(reviewAssignments.versionId, manuscriptSubquery.versionId))
    .leftJoin(feedbackSubquery, eq(reviewAssignments.versionId, feedbackSubquery.versionId))
    .$dynamic();

    const rows = await query.orderBy(desc(reviewAssignments.assignedAt));
    console.log("Full Query Rows:", rows.length);
    if (rows.length > 0) {
        console.log("First Row:", JSON.stringify(rows[0], null, 2));
    }
}

test().catch(console.error);

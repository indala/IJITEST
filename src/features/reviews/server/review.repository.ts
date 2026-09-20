import { and, count, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    reviewAssignments,
    reviews,
    sections,
    submissionFiles,
    submissionVersions,
    submissions,
    userProfiles,
    reviewerSuggestions,
} from "@/db/schema";
import type { ActiveReview, UnassignedPaper } from "@/db/types";

export async function listActiveReviews(
    reviewerId?: string,
): Promise<ActiveReview[]> {
    const manuscriptSubquery = db
        .select({
            manuscriptUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as("manuscriptUrl"),
            versionId: submissionFiles.versionId,
        })
        .from(submissionFiles)
        .where(eq(submissionFiles.fileType, "pdfVersion"))
        .groupBy(submissionFiles.versionId)
        .as("manuscripts");

    const feedbackSubquery = db
        .select({
            feedbackUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as("feedbackUrl"),
            versionId: submissionFiles.versionId,
        })
        .from(submissionFiles)
        .where(eq(submissionFiles.fileType, "feedback"))
        .groupBy(submissionFiles.versionId)
        .as("feedback");

    const baseQuery = db
        .select({
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
            reviewId: reviews.id,
            decision: reviews.decision,
            editorRating: reviews.editorRating,
            editorRatingRemarks: reviews.editorRatingRemarks,
            commentsToAuthor: reviews.commentsToAuthor,
            submittedAt: reviews.submittedAt,
            manuscriptPath: manuscriptSubquery.manuscriptUrl,
            feedbackFilePath: feedbackSubquery.feedbackUrl,
        })
        .from(reviewAssignments)
        .innerJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
        .innerJoin(submissionVersions, eq(reviewAssignments.versionId, submissionVersions.id))
        .leftJoin(userProfiles, eq(reviewAssignments.reviewerId, userProfiles.userId))
        .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId))
        .leftJoin(manuscriptSubquery, eq(reviewAssignments.versionId, manuscriptSubquery.versionId))
        .leftJoin(feedbackSubquery, eq(reviewAssignments.versionId, feedbackSubquery.versionId))
        .$dynamic();

    const query = reviewerId
        ? baseQuery.where(eq(reviewAssignments.reviewerId, reviewerId))
        : baseQuery;

    return query.orderBy(desc(reviewAssignments.assignedAt)).limit(200) as Promise<ActiveReview[]>;
}

export async function listUnassignedPapers(): Promise<UnassignedPaper[]> {
    const latestVersions = db
        .select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as("max_version"),
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as("latest_versions");

    const manuscriptPaths = db
        .select({
            versionId: submissionFiles.versionId,
            pdfUrl: sql<string>`MAX(${submissionFiles.fileUrl})`.as("pdfUrl"),
        })
        .from(submissionFiles)
        .where(eq(submissionFiles.fileType, "pdfVersion"))
        .groupBy(submissionFiles.versionId)
        .as("manuscripts");

    const blindedSubquery = db
        .select({
            versionId: submissionFiles.versionId,
            blindedCount: count().as("blinded_count"),
        })
        .from(submissionFiles)
        .where(eq(submissionFiles.fileType, "blindedManuscript"))
        .groupBy(submissionFiles.versionId)
        .as("blinded");

    const rows = await db
        .select({
            id: submissions.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            pdfUrl: manuscriptPaths.pdfUrl,
            isBlinded: sql<boolean>`COALESCE(${blindedSubquery.blindedCount}, 0) > 0`,
            sectionTitle: sections.title,
        })
        .from(submissions)
        .innerJoin(submissionVersions, eq(submissions.id, submissionVersions.submissionId))
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(sections, eq(submissions.sectionId, sections.id))
        .leftJoin(manuscriptPaths, eq(submissionVersions.id, manuscriptPaths.versionId))
        .leftJoin(blindedSubquery, eq(submissionVersions.id, blindedSubquery.versionId))
        .where(
            and(
                inArray(submissions.status, [
                    "submitted",
                    "editorAssigned",
                    "underReview",
                    "revisionRequested",
                ]),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion),
            ),
        );

    const suggestions = rows.length
        ? await db
              .select()
              .from(reviewerSuggestions)
              .where(inArray(reviewerSuggestions.submissionId, rows.map((row) => row.id)))
        : [];
    const suggestionsBySubmission = new Map<number, typeof suggestions>();

    for (const suggestion of suggestions) {
        const current = suggestionsBySubmission.get(suggestion.submissionId) ?? [];
        current.push(suggestion);
        suggestionsBySubmission.set(suggestion.submissionId, current);
    }

    return rows.map((row) => ({
        ...row,
        sectionTitle: row.sectionTitle ?? null,
        reviewerSuggestions: suggestionsBySubmission.get(row.id) ?? [],
    }));
}

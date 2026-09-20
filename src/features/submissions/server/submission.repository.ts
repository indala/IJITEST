import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { and, desc, eq, inArray, isNull, like, or, sql, type SQL } from "drizzle-orm";
import {
    submissions,
    submissionVersions,
    submissionFiles,
    submissionAuthors,
    users,
    userProfiles,
    payments,
    reviews,
    reviewAssignments,
    volumesIssues,
    publications,
    sections,
    reviewerSuggestions,
} from "@/db/schema";
import type {
    ReviewWithReviewer,
    SubmissionDetail,
    SubmissionUI,
    UserWithProfile,
} from "@/db/contracts";
import type {
    SubmissionFile,
} from "@/db/models";
import { db } from "@/lib/db";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";

export type SubmissionListFilters = {
    status?: string;
    q?: string;
};

export async function findSubmissionById(id: number): Promise<SubmissionUI | null> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.SUBMISSION(id), CACHE_TAGS.SUBMISSIONS);

    try {
        cacheLogger.miss(CACHE_TAGS.SUBMISSION(id), `findSubmissionById id=${id}`);
        const submissionRows = await db.select({
            submission: submissions,
            author: users,
            authorProfile: userProfiles,
            issue: volumesIssues,
            publication: publications,
            payment: payments,
            section: sections,
        })
            .from(submissions)
            .where(and(eq(submissions.id, id), isNull(submissions.deletedAt)))
            .leftJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
            .leftJoin(publications, eq(submissions.id, publications.submissionId))
            .leftJoin(payments, eq(submissions.id, payments.submissionId))
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
            .limit(1);

        const row = submissionRows[0];
        if (!row) return null;

        const [versionRows, authors, assignments, suggestions] = await Promise.all([
            db.select().from(submissionVersions)
                .where(eq(submissionVersions.submissionId, id))
                .orderBy(desc(submissionVersions.versionNumber))
                .limit(1),
            db.select().from(submissionAuthors)
                .where(eq(submissionAuthors.submissionId, id))
                .orderBy(submissionAuthors.orderIndex),
            db.select({
                ra: reviewAssignments,
                reviewer: users,
                profile: userProfiles,
                review: reviews,
            })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.submissionId, id))
                .leftJoin(users, eq(reviewAssignments.reviewerId, users.id))
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .leftJoin(reviews, eq(reviewAssignments.id, reviews.assignmentId)),
            db.select().from(reviewerSuggestions)
                .where(eq(reviewerSuggestions.submissionId, id)),
        ]);

        const latestVersion = versionRows[0];
        const files = latestVersion
            ? await db.select().from(submissionFiles).where(eq(submissionFiles.versionId, latestVersion.id))
            : [];

        const typedAssignments: ReviewWithReviewer[] = assignments.map((assignment) => ({
            ...assignment.ra,
            reviewer: assignment.reviewer && assignment.profile
                ? { ...assignment.reviewer, profile: assignment.profile }
                : ({} as UserWithProfile),
            review: assignment.review,
        }));

        const submissionData: SubmissionDetail = {
            ...row.submission,
            correspondingAuthor: row.author && row.authorProfile
                ? { ...row.author, profile: row.authorProfile } as UserWithProfile
                : undefined,
            versions: latestVersion ? [{ ...latestVersion, files: files as SubmissionFile[] }] : [],
            authors,
            section: row.section || null,
            reviewerSuggestions: suggestions,
            payment: row.payment,
            reviewAssignments: typedAssignments,
            issue: row.issue,
            publication: row.publication,
        };

        const mainManuscript = files.find((file) => file.fileType === "mainManuscript");
        const pdfVersion = files.find((file) => file.fileType === "pdfVersion");
        const finalPdf = row.publication?.finalPdfUrl;
        const publishedAt = row.publication?.publishedAt;

        return {
            ...submissionData,
            title: latestVersion?.title || "Untitled Manuscript",
            abstract: latestVersion?.abstract || null,
            keywords: latestVersion?.keywords || null,
            filePath: mainManuscript?.fileUrl || "",
            pdfUrl: finalPdf
                ? `${finalPdf}?v=${publishedAt ? new Date(publishedAt).getTime() : Date.now()}`
                : (pdfVersion?.fileUrl || ""),
            authorName: submissionData.correspondingAuthor?.profile?.fullName || "Unknown Author",
            authorEmail: submissionData.correspondingAuthor?.email || "",
            coAuthors: submissionData.authors,
            doi: submissionData.publication?.doi || null,
            volumeNumber: submissionData.issue?.volumeNumber,
            issueNumber: submissionData.issue?.issueNumber,
            startPage: submissionData.publication?.startPage,
            endPage: submissionData.publication?.endPage,
            latestVersion: latestVersion ? { ...latestVersion, files: files as SubmissionFile[] } : undefined,
            allFiles: files as SubmissionFile[],
            allReviews: typedAssignments,
        };
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.SUBMISSION(id), error);
        return null;
    }
}

export async function listSubmissions(filters?: SubmissionListFilters): Promise<SubmissionUI[]> {
    const conditions: SQL[] = [isNull(submissions.deletedAt)];
    if (filters?.status && filters.status !== "all") {
        conditions.push(eq(submissions.status, filters.status as typeof submissions.status.enumValues[number]));
    }
    if (filters?.q) {
        const search = `%${filters.q}%`;
        conditions.push(or(
            like(submissions.paperId, search),
            like(submissionVersions.title, search),
        ) as SQL);
    }

    const latestVersions = db.select({
        submissionId: submissionVersions.submissionId,
        maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as("max_version"),
    })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as("lv");

    const rows = await db.select({
        submission: submissions,
        author: users,
        authorProfile: userProfiles,
        latestVersion: submissionVersions,
        payment: payments,
        issue: volumesIssues,
        publication: publications,
    })
        .from(submissions)
        .leftJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(submissionVersions, and(
            eq(submissions.id, submissionVersions.submissionId),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion),
        ))
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .leftJoin(volumesIssues, eq(submissions.issueId, volumesIssues.id))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .where(and(...conditions))
        .orderBy(desc(submissions.submittedAt))
        .limit(200);

    if (rows.length === 0) return [];

    const submissionIds = rows.map((row) => row.submission.id);
    const versionIds = rows.flatMap((row) => row.latestVersion ? [row.latestVersion.id] : []);
    const [authors, files] = await Promise.all([
        db.select().from(submissionAuthors).where(inArray(submissionAuthors.submissionId, submissionIds)),
        versionIds.length > 0
            ? db.select().from(submissionFiles).where(inArray(submissionFiles.versionId, versionIds))
            : Promise.resolve([]),
    ]);

    return rows.map((row) => {
        const submissionAuthorsForRow = authors.filter((author) => author.submissionId === row.submission.id);
        const filesForRow = row.latestVersion
            ? files.filter((file) => file.versionId === row.latestVersion!.id)
            : [];
        const mainManuscript = filesForRow.find((file) => file.fileType === "mainManuscript");
        const pdfVersion = filesForRow.find((file) => file.fileType === "pdfVersion");

        return {
            ...row.submission,
            title: row.latestVersion?.title || "Untitled Manuscript",
            abstract: row.latestVersion?.abstract || "",
            keywords: row.latestVersion?.keywords || "",
            filePath: mainManuscript?.fileUrl || "",
            pdfUrl: row.publication?.finalPdfUrl || pdfVersion?.fileUrl || "",
            authorName: row.authorProfile?.fullName || "Unknown Author",
            authorEmail: row.author?.email || "",
            coAuthors: submissionAuthorsForRow,
            doi: row.publication?.doi || null,
            volumeNumber: row.issue?.volumeNumber,
            issueNumber: row.issue?.issueNumber,
            startPage: row.publication?.startPage,
            endPage: row.publication?.endPage,
            latestVersion: row.latestVersion
                ? { ...row.latestVersion, files: filesForRow as SubmissionFile[] }
                : undefined,
            allFiles: filesForRow as SubmissionFile[],
            allReviews: [],
            payment: row.payment,
            correspondingAuthor: row.author && row.authorProfile
                ? { ...row.author, profile: row.authorProfile }
                : undefined,
            authors: submissionAuthorsForRow,
            versions: row.latestVersion
                ? [{ ...row.latestVersion, files: filesForRow as SubmissionFile[] }]
                : [],
            reviewAssignments: [],
            issue: row.issue,
            publication: row.publication,
        };
    });
}

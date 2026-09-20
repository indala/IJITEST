import { and, count, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    publications,
    submissions,
    submissionVersions,
    volumesIssues,
} from "@/db/schema";
import type { Issue, PaperWithPublication } from "@/db/types";

export async function listIssuesWithPaperCounts(): Promise<
    (Issue & { paperCount: number })[]
> {
    const rows = await db
        .select({
            issue: volumesIssues,
            paperCount: count(submissions.id),
        })
        .from(volumesIssues)
        .leftJoin(submissions, eq(submissions.issueId, volumesIssues.id))
        .groupBy(volumesIssues.id)
        .orderBy(
            desc(volumesIssues.year),
            desc(volumesIssues.volumeNumber),
            desc(volumesIssues.issueNumber),
        );

    return rows.map((row) => ({
        ...row.issue,
        paperCount: row.paperCount,
    }));
}

export async function listPapersByIssue(
    issueId: number,
): Promise<PaperWithPublication[]> {
    const latestVersions = db
        .select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as(
                "max_version",
            ),
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as("latest_versions");

    const rows = await db
        .select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            publication: publications,
            latestVersion: submissionVersions,
        })
        .from(submissions)
        .where(eq(submissions.issueId, issueId))
        .leftJoin(publications, eq(submissions.id, publications.submissionId))
        .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(
            submissionVersions,
            and(
                eq(submissions.id, submissionVersions.submissionId),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion),
            ),
        );

    return rows.map((row) => ({
        id: row.id,
        paperId: row.paperId,
        title: row.latestVersion?.title ?? "Untitled",
        status: row.status,
        publication: row.publication,
    }));
}

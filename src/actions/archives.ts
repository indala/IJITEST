"use server";
import "server-only"

import { db } from "@/lib/db";
import {
    publications,
    submissions,
    submissionAuthors,
    submissionVersions,
    submissionFiles,
    volumesIssues,
    userProfiles
} from "@/db/schema";
import { eq, desc, and, sql, ne, inArray, asc } from "drizzle-orm";
import {
    type PublishedPaperUI,
    type ActionResponse,
    type SubmissionStatus,
    type Author,
    type Submission,
    type Version,
    type SubmissionFile,
    type Issue,
    type UserProfile,
    type Publication,
    actionSuccess,
    actionError,
    serverError
} from "@/db/types";
import { cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";

/**
 * FETCH ALL PUBLISHED PAPERS
 * Used for the global archive list or sitemap
 */

export async function getPublishedPapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.ARCHIVES)

    try {
        cacheLogger.miss(CACHE_TAGS.ARCHIVES, "getPublishedPapers");
        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
            .from(publications)
            .innerJoin(volumesIssues, and(
                eq(publications.issueId, volumesIssues.id),
                eq(volumesIssues.status, 'published')
            ))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .orderBy(asc(submissions.paperId));

        if (!rows.length) return actionSuccess([] as PublishedPaperUI[]);

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);

            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

        return actionSuccess(data);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.ARCHIVES, error);
        return serverError<PublishedPaperUI[]>(error, "fetch published papers");
    }
}

export async function getLatestIssuePapers(): Promise<ActionResponse<PublishedPaperUI[]>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.ARCHIVES, CACHE_TAGS.LATEST_ISSUE)

    try {
        cacheLogger.miss(CACHE_TAGS.ARCHIVES, "getLatestIssuePapers");
        const issues = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        if (!issues.length) return actionSuccess([] as PublishedPaperUI[]);
        const latestIssue = issues[0];
        if (!latestIssue) return actionSuccess([] as PublishedPaperUI[]);

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
            .from(publications)
            .where(eq(publications.issueId, latestIssue.id))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .orderBy(asc(submissions.paperId));

        if (!rows.length) return actionSuccess([] as PublishedPaperUI[]);

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);

            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

        return actionSuccess(data);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.ARCHIVES, error);
        return serverError<PublishedPaperUI[]>(error, "fetch latest issue papers");
    }
}

export async function getArchivePapers(limit = 50, offset = 0): Promise<ActionResponse<PublishedPaperUI[]>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.ARCHIVES)

    try {
        cacheLogger.miss(CACHE_TAGS.ARCHIVES, `getArchivePapers limit=${limit} offset=${offset}`);
        const issues = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber))
            .limit(1);

        const latestId = issues[0]?.id ?? -1;

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
            .from(publications)
            .innerJoin(volumesIssues, and(
                eq(publications.issueId, volumesIssues.id),
                eq(volumesIssues.status, 'published')
            ))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .where(ne(publications.issueId, latestId))
            .orderBy(asc(submissions.paperId))
            .limit(limit)
            .offset(offset);

        if (!rows.length) return actionSuccess([] as PublishedPaperUI[]);

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const data = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);

            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

        return actionSuccess(data);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.ARCHIVES, error);
        return serverError<PublishedPaperUI[]>(error, "fetch archive papers");
    }
}

export async function getPaperById(id: string): Promise<ActionResponse<PublishedPaperUI>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.PAPER(id), CACHE_TAGS.ARCHIVES)

    try {
        cacheLogger.miss(CACHE_TAGS.PAPER(id), `getPaperById id=${id}`);
        const numericId = Number(id);
        const whereClause = isNaN(numericId)
            ? eq(submissions.paperId, id)
            : eq(publications.submissionId, numericId);

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
            .from(submissionVersions)
            .groupBy(submissionVersions.submissionId)
            .as('lv');

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            version: submissionVersions,
            issue: volumesIssues,
            authorProfile: userProfiles
        })
            .from(publications)
            .innerJoin(volumesIssues, and(
                eq(publications.issueId, volumesIssues.id),
                eq(volumesIssues.status, 'published')
            ))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
            .leftJoin(submissionVersions, and(
                eq(submissions.id, submissionVersions.submissionId),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion)
            ))
            .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
            .where(whereClause)
            .limit(1);

        const row = rows[0];
        if (!row || !row.submission) return actionError<PublishedPaperUI>("Paper data is incomplete");

        const authorsList = await db.select()
            .from(submissionAuthors)
            .where(eq(submissionAuthors.submissionId, row.submission.id))
            .orderBy(submissionAuthors.orderIndex);

        const versionFiles = row.version?.id ? await db.select()
            .from(submissionFiles)
            .where(eq(submissionFiles.versionId, row.version.id)) : [];

        const data = mapPublicationToUI({
            ...row.publication,
            submission: {
                ...row.submission,
                versions: [row.version],
                correspondingAuthor: { profile: row.authorProfile },
                authors: authorsList,
                files: versionFiles
            },
            issue: row.issue
        });
        return actionSuccess(data);
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.PAPER(id), error);
        return serverError<PublishedPaperUI>(error, "fetch paper by ID");
    }
}

/**
 * HELPER: Map relational Drizzle structure to the flat structure the UI expects
 */
type PublicationInput = Partial<Omit<Publication, 'issueId'>> & {
    submissionId?: Publication['submissionId'] | null;
    submission?: (
        Partial<Pick<Submission, 'paperId' | 'status' | 'updatedAt' | 'retractionReason' | 'retractionNoticeUrl' | 'retractedAt'>> & {
            authors?: Author[];
            versions?: Array<Partial<Pick<Version, 'title' | 'abstract' | 'keywords' | 'competingInterests' | 'fundingStatement' | 'ethicalApproval'>> | null>;
            files?: SubmissionFile[];
            correspondingAuthor?: {
                profile?: Partial<Pick<UserProfile, 'fullName' | 'institute'>> | null;
            } | null;
        }
    ) | null;
    issue?: Partial<Pick<Issue, 'volumeNumber' | 'issueNumber' | 'year' | 'monthRange'>> | null;
    [key: string]: unknown; // allow Drizzle leftJoin spreads with extra fields
};

function mapPublicationToUI(pub: PublicationInput): PublishedPaperUI {
    const latestVersion = pub.submission?.versions?.[0];
    const authorsList = Array.isArray(pub.submission?.authors) ? pub.submission.authors : [];

    // Sort authors by orderIndex
    const sortedAuthors = [...authorsList].sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0)) as Author[];

    // Primary author is the one with isCorresponding or the first one
    const correspondingAuthor = sortedAuthors.find(a => a.isCorresponding) || sortedAuthors[0];

    const primaryAuthorName = correspondingAuthor?.name || sortedAuthors[0]?.name || "Anonymous Author";

    const supplementaryFiles = pub.submission?.files?.filter(f => f.fileType === 'supplementary') || [];

    return {
        id: pub.submissionId || 0,
        paperId: pub.submission?.paperId || "",
        title: latestVersion?.title || "Untitled Paper",
        abstract: latestVersion?.abstract || "",
        keywords: (() => {
            const raw = latestVersion?.keywords || "";
            try {
                if (raw.startsWith('[') && raw.endsWith(']')) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) return parsed.join(', ');
                }
            } catch {}
            return raw;
        })(),
        authorName: primaryAuthorName,
        authorEmail: correspondingAuthor?.email || "N/A",
        affiliation: correspondingAuthor?.institution || "N/A",
        status: (pub.submission?.status as SubmissionStatus) || "published",
        doi: pub.doi || "",
        finalPdfUrl: pub.finalPdfUrl || "",
        filePath: pub.finalPdfUrl || "",
        pdfUrl: pub.finalPdfUrl || "",
        startPage: pub.startPage || null,
        endPage: pub.endPage || null,
        pageRange: pub.startPage && pub.endPage ? `${pub.startPage}-${pub.endPage}` : null,
        publishedAt: pub.publishedAt || null,
        updatedAt: pub.submission?.updatedAt || pub.publishedAt || null,
        volumeNumber: pub.issue?.volumeNumber || 0,
        issueNumber: pub.issue?.issueNumber || 0,
        publicationYear: pub.issue?.year || 0,
        monthRange: pub.issue?.monthRange || "",
        coAuthors: sortedAuthors, 
        authorsList: sortedAuthors.map(a => a.name),
        views: pub.views || 0,
        downloads: pub.downloads || 0,
        citations: pub.citations || 0,
        competingInterests: latestVersion?.competingInterests || null,
        fundingStatement: latestVersion?.fundingStatement || null,
        ethicalApproval: latestVersion?.ethicalApproval || null,
        supplementaryFiles: supplementaryFiles,
        retractionReason: pub.submission?.retractionReason || null,
        retractionNoticeUrl: pub.submission?.retractionNoticeUrl || null,
        retractedAt: pub.submission?.retractedAt || null,
    };
}

export async function getIssuePapersByIssueId(issueId: number): Promise<ActionResponse<{ issue: Issue; papers: PublishedPaperUI[] }>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.ARCHIVES, CACHE_TAGS.PUBLICATIONS)

    try {
        const issueRows = await db.select().from(volumesIssues).where(eq(volumesIssues.id, issueId)).limit(1);
        const issue = issueRows[0];
        if (!issue) return actionError("Issue not found");

        const rows = await db.select({
            publication: publications,
            submission: submissions,
            issue: volumesIssues,
        })
            .from(publications)
            .where(eq(publications.issueId, issueId))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .orderBy(asc(submissions.paperId));

        if (!rows.length) {
            return actionSuccess({ issue, papers: [] });
        }

        const submissionIds = rows.map(r => r.submission?.id).filter(Boolean) as number[];

        const authorsList = await db.select().from(submissionAuthors)
            .where(inArray(submissionAuthors.submissionId, submissionIds))
            .orderBy(submissionAuthors.orderIndex);

        const versionsList = await db.select().from(submissionVersions)
            .where(inArray(submissionVersions.submissionId, submissionIds))
            .orderBy(desc(submissionVersions.versionNumber));

        const papers = rows.map(row => {
            const paperAuthors = authorsList.filter(a => a.submissionId === row.submission?.id);
            const paperVersions = versionsList.filter(v => v.submissionId === row.submission?.id);

            return mapPublicationToUI({
                ...row.publication,
                submission: {
                    ...row.submission,
                    versions: paperVersions,
                    authors: paperAuthors
                },
                issue: row.issue
            });
        });

        return actionSuccess({ issue, papers });
    } catch (error) {
        return serverError(error, "fetch issue papers by issue ID");
    }
}

export async function getPublishedIssues(): Promise<ActionResponse<Issue[]>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.ARCHIVES, CACHE_TAGS.PUBLICATIONS)

    try {
        const rows = await db.select()
            .from(volumesIssues)
            .where(eq(volumesIssues.status, 'published'))
            .orderBy(desc(volumesIssues.year), desc(volumesIssues.volumeNumber), desc(volumesIssues.issueNumber));
        return actionSuccess(rows);
    } catch (error) {
        return serverError(error, "fetch published issues");
    }
}

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
    userProfiles,
    sections
} from "@/db/schema";
import { eq, desc, and, sql, ne, inArray, asc } from "drizzle-orm";
import {
    type PublishedPaperUI,
    type SubmissionStatus,
    type Author,
    type Submission,
    type Version,
    type SubmissionFile,
    type Issue,
    type UserProfile,
    type Publication,
    type RelatedArticle
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    actionError,
    serverError
} from "@/lib/action-response";
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
            section: sections,
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
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
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
                issue: row.issue,
                section: row.section
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
            section: sections,
        })
            .from(publications)
            .where(eq(publications.issueId, latestIssue.id))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
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
                issue: row.issue,
                section: row.section
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
            section: sections,
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
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
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
                issue: row.issue,
                section: row.section
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
            authorProfile: userProfiles,
            section: sections,
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
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
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
            issue: row.issue,
            section: row.section
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
        Partial<Pick<Submission, 'paperId' | 'status' | 'updatedAt' | 'submittedAt' | 'retractionReason' | 'retractionNoticeUrl' | 'retractedAt'>> & {
            authors?: Author[];
            versions?: Array<Partial<Pick<Version, 'title' | 'abstract' | 'keywords' | 'competingInterests' | 'fundingStatement' | 'ethicalApproval'>> | null>;
            files?: SubmissionFile[];
            correspondingAuthor?: {
                profile?: Partial<Pick<UserProfile, 'fullName' | 'institute'>> | null;
            } | null;
            section?: { title?: string | null; identifyType?: string | null } | null;
        }
    ) | null;
    issue?: Partial<Pick<Issue, 'volumeNumber' | 'issueNumber' | 'year' | 'monthRange' | 'title' | 'description' | 'datePublished' | 'coverImageUrl' | 'coverImageAltText'>> | null;
    section?: { title?: string | null; identifyType?: string | null } | null;
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

    const sectionTitle = pub.section?.title || (pub.submission as any)?.section?.title || "Original Research Articles";
    const sectionIdentifyType = pub.section?.identifyType || (pub.submission as any)?.section?.identifyType || "Research Article";
    const issueDatePublished = pub.issue?.datePublished || null;
    const issueTitle = pub.issue?.title || null;

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
        submittedAt: pub.submission?.submittedAt || null,
        acceptedAt: pub.publishedAt || pub.submission?.updatedAt || null,
        sectionTitle,
        sectionIdentifyType,
        issueDatePublished,
        issueTitle,
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
            section: sections,
        })
            .from(publications)
            .where(eq(publications.issueId, issueId))
            .innerJoin(submissions, and(
                eq(publications.submissionId, submissions.id),
                eq(submissions.status, 'published')
            ))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .leftJoin(sections, eq(submissions.sectionId, sections.id))
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
                issue: row.issue,
                section: row.section
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

/**
 * OJS Parity: recommendByAuthor and recommendBySimilarity
 * Discovers published articles related to the given paper by matching author names,
 * journal section, shared keywords, and title tokens.
 */
export async function getRelatedArticles(
    paperId: string,
    limit: number = 4
): Promise<ActionResponse<RelatedArticle[]>> {
    'use cache'
    cacheLife('archive')
    cacheTag(CACHE_TAGS.PAPER(paperId), CACHE_TAGS.ARCHIVES)

    try {
        cacheLogger.miss(CACHE_TAGS.PAPER(paperId), `getRelatedArticles paperId=${paperId}`);
        const targetRes = await getPaperById(paperId);
        if (!targetRes.success || !targetRes.data) {
            return actionSuccess([] as RelatedArticle[]);
        }
        const target = targetRes.data;

        const allPublishedRes = await getPublishedPapers();
        if (!allPublishedRes.success || !allPublishedRes.data || !allPublishedRes.data.length) {
            return actionSuccess([] as RelatedArticle[]);
        }

        const otherPapers = allPublishedRes.data.filter(p => p.paperId !== target.paperId);
        if (!otherPapers.length) {
            return actionSuccess([] as RelatedArticle[]);
        }

        // Prepare target tokens for scoring
        const targetAuthors = [target.authorName, ...(target.coAuthors || []).map(a => a.name)]
            .filter(Boolean)
            .map(n => n.toLowerCase().trim());
        const targetKeywords = (target.keywords || "")
            .split(/[,;]/)
            .map(k => k.toLowerCase().trim())
            .filter(k => k.length > 2);

        const stopWords = new Set(['the', 'and', 'for', 'with', 'using', 'based', 'from', 'into', 'novel', 'study', 'design', 'system', 'systems', 'analysis', 'approach']);
        const targetTitleWords = (target.title || "")
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 3 && !stopWords.has(w));

        const scored: RelatedArticle[] = otherPapers.map(candidate => {
            let score = 0;
            const reasons: string[] = [];

            // 1. Author Match (OJS recommendByAuthor)
            const candidateAuthors = [candidate.authorName, ...(candidate.coAuthors || []).map(a => a.name)]
                .filter(Boolean)
                .map(n => n.toLowerCase().trim());

            for (const tAuthor of targetAuthors) {
                const match = candidateAuthors.find(cAuthor => cAuthor.includes(tAuthor) || tAuthor.includes(cAuthor));
                if (match) {
                    score += 50;
                    reasons.push(`Author: ${candidate.authorName}`);
                    break;
                }
            }

            // 2. Section Match
            if (target.sectionTitle && candidate.sectionTitle && target.sectionTitle === candidate.sectionTitle) {
                score += 20;
                reasons.push(`Section: ${target.sectionTitle}`);
            }

            // 3. Keyword Match (OJS recommendBySimilarity)
            if (candidate.keywords && targetKeywords.length) {
                const candKeywords = candidate.keywords
                    .split(/[,;]/)
                    .map(k => k.toLowerCase().trim());

                let matchedKw = 0;
                for (const tk of targetKeywords) {
                    if (candKeywords.some(ck => ck.includes(tk) || tk.includes(ck))) {
                        matchedKw++;
                        score += 15;
                    }
                }
                if (matchedKw > 0) {
                    reasons.push(`${matchedKw} matching keyword(s)`);
                }
            }

            // 4. Title Term Similarity
            if (candidate.title && targetTitleWords.length) {
                const candWords = candidate.title
                    .toLowerCase()
                    .replace(/[^a-z0-9 ]/g, ' ')
                    .split(/\s+/);

                let matchedWords = 0;
                for (const tw of targetTitleWords) {
                    if (candWords.includes(tw)) {
                        matchedWords++;
                        score += 8;
                    }
                }
                if (matchedWords > 0 && !reasons.some(r => r.includes('keyword'))) {
                    reasons.push("Related topic");
                }
            }

            const primaryReason = reasons.length > 0
                ? reasons[0]!
                : (candidate.sectionTitle ? `Section: ${candidate.sectionTitle}` : "Recent publication");

            return {
                ...candidate,
                matchReason: primaryReason,
                matchScore: score,
            };
        });

        scored.sort((a, b) => {
            if (b.matchScore !== a.matchScore) {
                return b.matchScore - a.matchScore;
            }
            return (b.volumeNumber ?? 0) - (a.volumeNumber ?? 0);
        });

        return actionSuccess(scored.slice(0, limit));
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.ARCHIVES, error);
        return serverError<RelatedArticle[]>(error, "fetch related articles");
    }
}


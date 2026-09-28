import type { MetadataRoute } from 'next';
import { getPublishedPapers } from '@/actions/archives';
import { getAnnouncements } from '@/actions/announcements';
import type { PublishedPaperUI } from '@/db/types';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('days');
  cacheTag(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.ARCHIVES, 'announcements');
  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');

  // Stable baseline date for static content to avoid fake daily lastmod updates
  const staticRevisionDate = new Date('2026-09-01T00:00:00.000Z');

  // 1. Core High-Priority & Informational Routes
  const highPriorityRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const, lastModified: new Date() },
    { path: '/current-issue', priority: 0.95, changeFrequency: 'daily' as const, lastModified: new Date() },
    { path: '/archives', priority: 0.9, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { path: '/indexing', priority: 0.85, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/submit', priority: 0.85, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/guidelines', priority: 0.8, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/editorial-board', priority: 0.8, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/announcements', priority: 0.8, changeFrequency: 'weekly' as const, lastModified: new Date() },
    { path: '/about', priority: 0.75, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/open-access', priority: 0.75, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/apc-fees', priority: 0.75, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/peer-review', priority: 0.75, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/aims-scope', priority: 0.75, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/ethics', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/copyright-policy', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/licensing-policy', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/plagiarism-policy', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/conflict-of-interest', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/research-misconduct', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/corrections-retractions', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/archiving-policy', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/ai-policy', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/publisher-info', priority: 0.7, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/reviewer-guidelines', priority: 0.7, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/faqs', priority: 0.65, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/join-us', priority: 0.65, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/track', priority: 0.65, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const, lastModified: staticRevisionDate },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const, lastModified: staticRevisionDate },
  ].map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: r.lastModified,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // 2. Dynamic Manuscript, Volume, Issue & Announcements Directory Routes
  try {
    const [res, announcementsRes] = await Promise.all([
      getPublishedPapers(),
      getAnnouncements()
    ]);

    const papers = res.success ? res.data ?? [] : [];

    // Sets to discover all unique volume and volume/issue combinations
    const volumesSet = new Set<number>();
    const volumeIssuesSet = new Set<string>();
    const dynamicRoutes: MetadataRoute.Sitemap = [];

    // Track papers to avoid duplicate URLs
    const addedUrls = new Set<string>();

    papers
      .filter((paper: PublishedPaperUI) => paper.volumeNumber && paper.issueNumber && paper.paperId)
      .forEach((paper: PublishedPaperUI) => {
        const volNum = paper.volumeNumber!;
        const issNum = paper.issueNumber!;
        const paperId = paper.paperId!;
        const lastMod = new Date(paper.updatedAt || paper.publishedAt || staticRevisionDate);

        volumesSet.add(volNum);
        volumeIssuesSet.add(`${volNum}:${issNum}`);

        // Permanent canonical Archive Article URL (The primary scholarly asset indexed by Google & Google Scholar)
        const archiveArticleUrl = `${baseUrl}/archives/volume${volNum}/issue${issNum}/${paperId}`;
        if (!addedUrls.has(archiveArticleUrl)) {
          addedUrls.add(archiveArticleUrl);
          dynamicRoutes.push({
            url: archiveArticleUrl,
            lastModified: lastMod,
            changeFrequency: 'monthly' as const,
            priority: 1.0,
          });
        }
      });

    // Add Volume Index directory pages
    volumesSet.forEach((volNum) => {
      const volUrl = `${baseUrl}/archives/volume${volNum}`;
      if (!addedUrls.has(volUrl)) {
        addedUrls.add(volUrl);
        dynamicRoutes.push({
          url: volUrl,
          lastModified: staticRevisionDate,
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        });
      }
    });

    // Add Issue Index directory pages (Table of Contents)
    volumeIssuesSet.forEach((key) => {
      const [volNum, issNum] = key.split(':');
      const issueUrl = `${baseUrl}/archives/volume${volNum}/issue${issNum}`;
      if (!addedUrls.has(issueUrl)) {
        addedUrls.add(issueUrl);
        dynamicRoutes.push({
          url: issueUrl,
          lastModified: staticRevisionDate,
          changeFrequency: 'monthly' as const,
          priority: 0.85,
        });
      }
    });

    // Add Dynamic Announcements
    const announcementsList = announcementsRes.success ? announcementsRes.data ?? [] : [];
    announcementsList.forEach((item) => {
      const annUrl = `${baseUrl}/announcements/${item.id}`;
      if (!addedUrls.has(annUrl)) {
        addedUrls.add(annUrl);
        dynamicRoutes.push({
          url: annUrl,
          lastModified: new Date(item.updatedAt || item.createdAt || staticRevisionDate),
          changeFrequency: 'monthly' as const,
          priority: 0.7,
        });
      }
    });

    return [...highPriorityRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return highPriorityRoutes;
  }
}

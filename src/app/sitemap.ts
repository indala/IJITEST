import type { MetadataRoute } from 'next';
import { getPublishedPapers, getLatestIssuePapers } from '@/actions/archives';
import type { PublishedPaperUI } from '@/db/types';
import { cacheLife, cacheTag } from 'next/cache';
import { CACHE_TAGS } from '@/lib/cache-tags';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  'use cache';
  cacheLife('hours');
  cacheTag(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.PUBLIC_DATA);
  const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');

  // 1. Core High-Priority & Informational Routes
  const highPriorityRoutes = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/current-issue', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/archives', priority: 0.95, changeFrequency: 'daily' as const },
    { path: '/indexing', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/submit', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/guidelines', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/editorial-board', priority: 0.85, changeFrequency: 'monthly' as const },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/ethics', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/faqs', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/peer-review', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/reviewer-guidelines', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/join-us', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/track', priority: 0.75, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/privacy', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/terms', priority: 0.5, changeFrequency: 'yearly' as const },
    { path: '/llms.txt', priority: 0.4, changeFrequency: 'monthly' as const },
    { path: '/llms-full.txt', priority: 0.4, changeFrequency: 'monthly' as const },
  ].map((r) => ({
    url: `${baseUrl}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // 2. Dynamic Manuscript, Volume, and Issue Directory Routes
  try {
    const [res, latestRes] = await Promise.all([
      getPublishedPapers(),
      getLatestIssuePapers()
    ]);

    const papers = res.success ? res.data ?? [] : [];
    const latestPapers = latestRes.success ? latestRes.data ?? [] : [];
    const latestPaperIds = new Set(latestPapers.map(p => p.id));

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
        const lastMod = new Date(paper.updatedAt || paper.publishedAt || new Date());

        volumesSet.add(volNum);
        volumeIssuesSet.add(`${volNum}:${issNum}`);

        // Permanent canonical Archive Article URL (Crucial for Google & Google Scholar indexing)
        const archiveArticleUrl = `${baseUrl}/archives/volume${volNum}/issue${issNum}/${paperId}`;
        if (!addedUrls.has(archiveArticleUrl)) {
          addedUrls.add(archiveArticleUrl);
          dynamicRoutes.push({
            url: archiveArticleUrl,
            lastModified: lastMod,
            changeFrequency: 'weekly' as const,
            priority: 0.9,
          });
        }

        // If in latest issue, also include the current-issue link
        if (latestPaperIds.has(paper.id)) {
          const currentArticleUrl = `${baseUrl}/current-issue/volume${volNum}/issue${issNum}/${paperId}`;
          if (!addedUrls.has(currentArticleUrl)) {
            addedUrls.add(currentArticleUrl);
            dynamicRoutes.push({
              url: currentArticleUrl,
              lastModified: lastMod,
              changeFrequency: 'weekly' as const,
              priority: 0.95,
            });
          }
        }
      });

    // Add Volume Index directory pages
    volumesSet.forEach((volNum) => {
      const volUrl = `${baseUrl}/archives/volume${volNum}`;
      if (!addedUrls.has(volUrl)) {
        addedUrls.add(volUrl);
        dynamicRoutes.push({
          url: volUrl,
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.85,
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
          lastModified: new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.85,
        });
      }
    });

    return [...highPriorityRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return highPriorityRoutes;
  }
}

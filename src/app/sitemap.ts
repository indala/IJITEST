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

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/archives',
    '/current-issue',
    '/editorial-board',
    '/ethics',
    '/faqs',
    '/guidelines',
    '/indexing',
    '/join-us',
    '/peer-review',
    '/privacy',
    '/reviewer-guidelines',
    '/submit',
    '/terms',
    '/track',
    '/contact',
    '/llms.txt',
    '/llms-full.txt',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Manuscript Routes
  try {
    const res = await getPublishedPapers();
    const latestRes = await getLatestIssuePapers();

    const papers = res.success ? res.data ?? [] : [];
    const latestPapers = latestRes.success ? latestRes.data ?? [] : [];
    const latestPaperIds = new Set(latestPapers.map(p => p.id));

    const dynamicRoutes = papers
      .filter((paper: PublishedPaperUI) => paper.volumeNumber && paper.issueNumber)
      .map((paper: PublishedPaperUI) => {
        const isCurrent = latestPaperIds.has(paper.id);
        const basePath = isCurrent ? 'current-issue' : 'archives';
        const volume = `volume${paper.volumeNumber}`;
        const issue = `issue${paper.issueNumber}`;
        const paperId = paper.paperId;

        return {
          url: `${baseUrl}/${basePath}/${volume}/${issue}/${paperId}`,
          lastModified: new Date(paper.updatedAt || paper.publishedAt || new Date()),
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      });

    return [...staticRoutes, ...dynamicRoutes];
  } catch (error) {
    console.error('Sitemap generation error:', error);
    return staticRoutes;
  }
}

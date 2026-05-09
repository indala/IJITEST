import { MetadataRoute } from 'next';
import { getPublishedPapers, getLatestIssuePapers } from '@/actions/archives';
import { PublishedPaperUI } from '@/db/types';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org';

  // 1. Static Routes
  const staticRoutes = [
    '',
    '/about',
    '/archives',
    '/current-issue',
    '/editorial-board',
    '/ethics',
    '/indexing',
    '/join-us',
    '/privacy',
    '/reviewer-guidelines',
    '/submit',
    '/terms',
    '/track',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  // 2. Dynamic Manuscript Routes
  try {
    const [res, latestRes] = await Promise.all([
      getPublishedPapers(),
      getLatestIssuePapers()
    ]);
    
    const papers = res.success ? res.data ?? [] : [];
    const latestPapers = latestRes.success ? latestRes.data ?? [] : [];
    const latestPaperIds = new Set(latestPapers.map(p => p.id));

    const dynamicRoutes = papers.map((paper: PublishedPaperUI) => {
      const isCurrent = latestPaperIds.has(paper.id);
      const basePath = isCurrent ? 'current-issue' : 'archives';
      const volume = `volume${paper.volume_number || 0}`;
      const issue = `issue${paper.issue_number || 0}`;
      const paperId = paper.paper_id;

      return {
        url: `${baseUrl}/${basePath}/${volume}/${issue}/${paperId}`,
        lastModified: new Date(paper.updated_at || new Date()),
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

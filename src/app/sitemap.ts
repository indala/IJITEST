import { MetadataRoute } from 'next';
import { getPublishedPapers } from '@/actions/archives';
import { getSettingsData } from '@/actions/settings';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSettingsData();
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
    const res = await getPublishedPapers();
    const papers = res.success ? res.data ?? [] : [];

    const dynamicRoutes = papers.map((paper: any) => {
      const basePath = paper.submission_mode === 'current' ? 'current-issue' : 'archives';
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

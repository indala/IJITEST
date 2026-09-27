import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '')

    return {
        rules: [
            {
                userAgent: '*',
                allow: [
                    '/',
                    '/archives/',
                    '/article/',
                    '/current-issue/',
                    '/announcements/',
                    '/guidelines',
                    '/editorial-board',
                    '/indexing',
                    '/open-access',
                    '/about',
                    '/aims-scope',
                    '/ethics',
                    '/peer-review',
                    '/apc-fees',
                    '/pages/',
                    '/api/sushi',
                    '/api/oai',
                    '/api/feed',
                    '/api/export/',
                    '/api/files/published/',
                    '/api/files/issues/',
                ],
                disallow: [
                    '/admin/',
                    '/editor/',
                    '/reviewer/',
                    '/author/',
                    '/api/auth/',
                    '/api/admin/',
                ],
            },
            {
                userAgent: [
                    'Googlebot',
                    'Googlebot-Scholar',
                    'bingbot',
                    'Applebot',
                    'DuckDuckBot',
                    'Baiduspider',
                    'YandexBot',
                    'Slurp',
                    'GPTBot',
                    'Claude-Web',
                    'PerplexityBot',
                    'CCBot'
                ],
                allow: '/',
                disallow: [
                    '/admin/',
                    '/editor/',
                    '/reviewer/',
                    '/author/',
                    '/api/auth/',
                    '/api/admin/',
                ],
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

// AI Specific hints at root level (not part of MetadataRoute, but good for LLMs)
// llms: https://ijitest.org/llms.txt
// llms-full: https://ijitest.org/llms-full.txt

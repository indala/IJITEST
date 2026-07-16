import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '')

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/editor/',
                    '/reviewer/',
                    '/author/',
                ],
            },
            {
                userAgent: ['GPTBot', 'Claude-Web', 'PerplexityBot', 'Googlebot'],
                allow: '/',
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}

// AI Specific hints at root level (not part of MetadataRoute, but good for LLMs)
// llms: https://ijitest.org/llms.txt
// llms-full: https://ijitest.org/llms-full.txt

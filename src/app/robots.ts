import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.ijitest.org'

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
// llms: https://www.ijitest.org/llms.txt
// llms-full: https://www.ijitest.org/llms-full.txt

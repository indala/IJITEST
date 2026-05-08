import { getPaperById } from "@/actions/archives";
import PageHeader from "@/components/layout/PageHeader";
import PaperDetailClient from "@/features/archives/components/PaperDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import SettingsInitializer from "@/components/providers/SettingsInitializer";
import { getPublishedPapers } from "@/actions/archives";
import { JsonLd } from "@/components/shared/JsonLd";

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) return [];

        return res.data.map((paper: any) => ({
            volume: `volume${paper.volume_number}`,
            issue: `issue${paper.issue_number}`,
            paperId: paper.paper_id,
        }));
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ volume: string, issue: string, paperId: string }> }): Promise<Metadata> {
    const { volume, issue, paperId } = await params;
    const [paperRes, settings] = await Promise.all([
        getPaperById(paperId),
        getSettingsData()
    ]);

    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) return { title: 'Article Not Found | IJITEST' };

    const baseUrl = settings.journal_website || 'https://www.ijitest.org';
    const mainAuthor = paper.author_name;
    const coAuthors = paper.co_authors ? paper.co_authors.split(',').map((s: string) => s.trim()) : [];
    const allAuthors = [mainAuthor, ...coAuthors].filter(Boolean);

    return {
        title: `${paper.title} | IJITEST Archive`,
        description: paper.abstract?.substring(0, 160) + "...",
        keywords: paper.keywords,
        openGraph: {
            title: paper.title,
            description: paper.abstract?.substring(0, 160),
            type: 'article',
            authors: allAuthors,
        },
        other: {
            'citation_title': paper.title,
            'citation_author': allAuthors,
            'citation_publication_date': paper.published_at ? new Date(paper.published_at).toISOString().split('T')[0].replace(/-/g, '/') : (paper.publication_year?.toString() || ''),
            'citation_journal_title': settings.journal_name || 'International Journal of Information Technology (IJITEST)',
            'citation_volume': paper.volume_number?.toString() || '',
            'citation_issue': paper.issue_number?.toString() || '',
            'citation_firstpage': paper.start_page?.toString() || '',
            'citation_lastpage': paper.end_page?.toString() || '',
            'citation_pdf_url': paper.pdf_url ? (paper.pdf_url.startsWith('http') ? paper.pdf_url : `${baseUrl}${paper.pdf_url}`) : '',
            'dc.title': paper.title || '',
            'dc.creator': allAuthors,
            'dc.date': paper.published_at ? new Date(paper.published_at).toISOString().split('T')[0] : (paper.publication_year?.toString() || ''),
            'dc.subject': paper.keywords || '',
            'dc.description': paper.abstract || '',
        },
        alternates: {
            canonical: `${baseUrl}/archives/${volume}/${issue}/${paperId}`
        },
        twitter: {
            card: 'summary_large_image',
            title: paper.title,
            description: paper.abstract?.substring(0, 160)
        }
    };
}

export default async function PaperDetailPage({ params }: { params: Promise<{ volume: string, issue: string, paperId: string }> }) {
    const { volume, issue, paperId } = await params;
    const [paperRes, settings] = await Promise.all([
        getPaperById(paperId),
        getSettingsData()
    ]);

    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) notFound();

    const baseUrl = settings.journal_website || 'https://www.ijitest.org';
    const mainAuthor = paper.author_name;
    const coAuthors = paper.co_authors ? paper.co_authors.split(',').map((s: string) => s.trim()) : [];
    const allAuthors = [mainAuthor, ...coAuthors].filter(Boolean);

    return (
        <div className="bg-white min-h-screen pb-20">
            <SettingsInitializer settings={settings} />
            <PageHeader
                title="Research Article"
                description={paper.paper_id}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: paper.paper_id, href: `/archives/${volume}/${issue}/${paperId}` },
                ]}
            />
            <PaperDetailClient paper={paper} id={paperId} />

            <JsonLd
                id="scholarly-article"
                data={{
                    "@context": "https://schema.org",
                    "@type": "ScholarlyArticle",
                    "headline": paper.title,
                    "description": paper.abstract,
                    "author": allAuthors.map(author => ({
                        "@type": "Person",
                        "name": author
                    })),
                    "datePublished": paper.published_at ? new Date(paper.published_at).toISOString() : (paper.publication_year?.toString() || ""),
                    "publisher": {
                        "@type": "Organization",
                        "name": settings.journal_name || "IJITEST",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/favicon_io/apple-touch-icon.png`
                        }
                    },
                    "isPartOf": {
                        "@type": "ScholarlyJournal",
                        "name": settings.journal_name || "IJITEST"
                    },
                    "pageStart": paper.start_page?.toString(),
                    "pageEnd": paper.end_page?.toString(),
                    "volumeNumber": paper.volume_number?.toString(),
                    "issueNumber": paper.issue_number?.toString(),
                    "keywords": paper.keywords,
                    "url": `${baseUrl}/archives/${volume}/${issue}/${paperId}`,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `${baseUrl}/archives/${volume}/${issue}/${paperId}`
                    }
                }}
            />
            
            <JsonLd
                id="breadcrumb"
                data={{
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": `${baseUrl}/`
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Archives",
                            "item": `${baseUrl}/archives`
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": paper.paper_id,
                            "item": `${baseUrl}/archives/${volume}/${issue}/${paperId}`
                        }
                    ]
                }}
            />
        </div>
    );
}

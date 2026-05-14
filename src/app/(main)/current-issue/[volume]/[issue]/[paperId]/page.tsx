import { getPaperById } from "@/actions/archives";
import PageHeader from "@/components/layout/PageHeader";
import PaperDetailClient from "@/features/archives/components/PaperDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { getLatestIssuePapers } from "@/actions/archives";
import { JsonLd } from "@/components/shared/JsonLd";

import { PublishedPaperUI } from "@/db/types";

export async function generateStaticParams() {
    try {
        const res = await getLatestIssuePapers();
        if (!res.success || !res.data) return [];

        return res.data
            .filter((paper: PublishedPaperUI) => {
                if (!paper.paperId) {
                    console.warn(`[Build] Skipping current-issue paper with missing paperId: ID ${paper.id}`);
                    return false;
                }
                return true;
            })
            .map((paper: PublishedPaperUI) => ({
                volume: `volume${paper.volumeNumber}`,
                issue: `issue${paper.issueNumber}`,
                paperId: paper.paperId,
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

    const baseUrl = settings.journalWebsite || 'https://www.ijitest.org';
    const allAuthors = paper.authorsList || [];

    const pubYearStr = paper.publicationYear ? String(paper.publicationYear) : '';
    const formattedDate: string = (paper.publishedAt 
        ? new Date(paper.publishedAt).toISOString().split('T')[0] 
        : pubYearStr) as string;

    const description = paper.abstract ? paper.abstract.substring(0, 160) : '';

    return {
        title: `${paper.title} | IJITEST Current Issue`,
        description: description,
        keywords: paper.keywords,
        openGraph: {
            title: paper.title,
            description: description,
            type: 'article',
            authors: allAuthors,
        },
        other: {
            'citation_title': paper.title,
            'citation_author': allAuthors,
            'citation_publication_date': formattedDate.replace(/-/g, '/'),
            'citation_journal_title': settings.journalName || 'IJITEST',
            'citation_issn': settings.issnNumber || '',
            'citation_doi': paper.doi || '',
            'citation_volume': paper.volumeNumber ? String(paper.volumeNumber) : '',
            'citation_issue': paper.issueNumber ? String(paper.issueNumber) : '',
            'citation_firstpage': paper.startPage ? String(paper.startPage) : '',
            'citation_lastpage': paper.endPage ? String(paper.endPage) : '',
            'citation_pdf_url': paper.pdfUrl ? (paper.pdfUrl.startsWith('http') ? paper.pdfUrl : `${baseUrl}${paper.pdfUrl}`) : '',
            'dc.title': paper.title || '',
            'dc.creator': allAuthors,
            'dc.date': formattedDate,
            'dc.subject': paper.keywords || '',
            'dc.description': paper.abstract || '',
            'dc.identifier': paper.doi || '',
            'dc.language': 'en',
            'dc.type': 'Research Article',
        },
        alternates: {
            canonical: `${baseUrl}/current-issue/${volume}/${issue}/${paperId}`
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

    const baseUrl = settings.journalWebsite || 'https://www.ijitest.org';
    const allAuthors = paper.authorsList || [];

    return (
        <div className="bg-white min-h-screen pb-20">
            <PageHeader
                title="Current Issue Article"
                description={paper.paperId}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Current Issue', href: '/current-issue' },
                    { name: paper.paperId, href: `/current-issue/${volume}/${issue}/${paperId}` },
                ]}
            />
            <PaperDetailClient paper={paper} id={paperId} mode="current" />

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
                    "datePublished": paper.publishedAt ? new Date(paper.publishedAt).toISOString() : (paper.publicationYear?.toString() || ""),
                    "publisher": {
                        "@type": "Organization",
                        "name": settings.journalName || "IJITEST",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/favicon_io/apple-touch-icon.png`
                        }
                    },
                    "isPartOf": {
                        "@type": "ScholarlyJournal",
                        "name": settings.journalName || "IJITEST"
                    },
                    "pageStart": paper.startPage?.toString(),
                    "pageEnd": paper.endPage?.toString(),
                    "volumeNumber": paper.volumeNumber?.toString(),
                    "issueNumber": paper.issueNumber?.toString(),
                    "keywords": paper.keywords,
                    "url": `${baseUrl}/current-issue/${volume}/${issue}/${paperId}`,
                    "mainEntityOfPage": {
                        "@type": "WebPage",
                        "@id": `${baseUrl}/current-issue/${volume}/${issue}/${paperId}`
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
                            "name": "Publication",
                            "item": `${baseUrl}/#`
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": "Current Issue",
                            "item": `${baseUrl}/current-issue`
                        },
                        {
                            "@type": "ListItem",
                            "position": 4,
                            "name": paper.paperId,
                            "item": `${baseUrl}/current-issue/${volume}/${issue}/${paperId}`
                        }
                    ]
                }}
            />
        </div>
    );
}

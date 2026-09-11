import { getPaperById, getPublishedPapers, getRelatedArticles } from "@/actions/archives";
import PageHeader from "@/components/layout/PageHeader";
import PaperDetailClient from "@/features/archives/components/PaperDetailClient";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { JsonLd } from "@/components/shared/JsonLd";

import { type PublishedPaperUI, type PaperDetailParams } from "@/db/types";

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) {
            return [{ volume: 'volume1', issue: 'issue1', paperId: 'placeholder' }];
        }

        const params = res.data
            .filter((paper: PublishedPaperUI) => Boolean(paper.paperId))
            .map((paper: PublishedPaperUI) => ({
                volume: `volume${paper.volumeNumber}`,
                issue: `issue${paper.issueNumber}`,
                paperId: paper.paperId,
            }));

        return params.length > 0 ? params : [{ volume: 'volume1', issue: 'issue1', paperId: 'placeholder' }];
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [{ volume: 'volume1', issue: 'issue1', paperId: 'placeholder' }];
    }
}

export async function generateMetadata({ params }: { params: Promise<PaperDetailParams> }): Promise<Metadata> {
    const { volume, issue, paperId } = await params;
    const canonicalPaperId = paperId.toUpperCase();
    const [paperRes, settings] = await Promise.all([
        getPaperById(canonicalPaperId),
        getSettingsData()
    ]);

    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) return { title: 'Article Not Found | IJITEST' };

    const baseUrl = settings['journalWebsite'] || 'https://ijitest.org';
    const pubYearStr = paper.publicationYear ? String(paper.publicationYear) : '';
    const formattedDate: string = (paper.publishedAt
        ? new Date(paper.publishedAt).toISOString().split('T')[0]
        : pubYearStr) as string;

    const description = paper.abstract ? paper.abstract.substring(0, 160) : '';
    const canonicalUrl = `${baseUrl}/archives/${volume}/${issue}/${canonicalPaperId}`;
    const pdfFullUrl = paper.pdfUrl ? (paper.pdfUrl.startsWith('http') ? paper.pdfUrl : `${baseUrl}${paper.pdfUrl}`) : '';
    const authorInstitutions = Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0
        ? (paper.coAuthors.map(a => a.institution).filter(Boolean) as string[])
        : (paper.affiliation && paper.affiliation !== 'N/A' ? [paper.affiliation] : []);
    const keywordsList = (paper.keywords || '')
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
    const publisher = settings['publisherName'] || settings['journalName'] || 'IJITEST';
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalAbbrev = settings['journalShortName'] || 'IJITEST';
    const issn = settings['issnNumber'] || '';

    const otherMeta: Record<string, string | number | (string | number)[]> = {
        'gs_meta_revision': '1.1',
        'citation_title': paper.title,
        'citation_author': paper.authorsList,
        'citation_publication_date': formattedDate.replace(/-/g, '/'),
        'citation_journal_title': journalTitle,
        'citation_journal_abbrev': journalAbbrev,
        'citation_publisher': publisher,
        'citation_issn': issn,
        'citation_abstract': paper.abstract || '',
        'citation_volume': paper.volumeNumber ? String(paper.volumeNumber) : '',
        'citation_issue': paper.issueNumber ? String(paper.issueNumber) : '',
        'citation_firstpage': paper.startPage ? String(paper.startPage) : '',
        'citation_lastpage': paper.endPage ? String(paper.endPage) : '',
        'citation_abstract_html_url': canonicalUrl,
        'citation_fulltext_html_url': canonicalUrl,
        'dc.title': paper.title || '',
        'dc.creator': paper.authorsList,
        'dc.date': formattedDate,
        'dc.subject': paper.keywords || '',
        'dc.description': paper.abstract || '',
        'dc.publisher': publisher,
        'dc.rights': 'https://creativecommons.org/licenses/by/4.0/',
        'dc.format': ['text/html', 'application/pdf'],
        'dc.source': `${journalTitle}; ISSN: ${issn || 'N/A'}`,
        'dc.language': 'en',
        'dc.type': ['Text.Serial.Journal', 'Research Article'],
    };

    if (authorInstitutions.length > 0) {
        otherMeta['citation_author_institution'] = authorInstitutions;
    }
    const authorOrcids = Array.isArray(paper.coAuthors)
        ? (paper.coAuthors.map(a => a.orcidId).filter(Boolean) as string[])
        : [];
    if (authorOrcids.length > 0) {
        otherMeta['citation_author_orcid'] = authorOrcids;
    }
    if (keywordsList.length > 0) {
        otherMeta['citation_keywords'] = keywordsList;
    }
    if (paper.doi) {
        otherMeta['citation_doi'] = paper.doi;
        otherMeta['dc.identifier'] = `doi:${paper.doi}`;
    } else {
        otherMeta['dc.identifier'] = canonicalUrl;
    }
    if (pdfFullUrl) {
        otherMeta['citation_pdf_url'] = pdfFullUrl;
    }

    // CrossMark standard metadata headers
    otherMeta['crossmark:policy'] = `${baseUrl}/ethics`;
    otherMeta['crossmark:date'] = formattedDate;
    otherMeta['crossmark:status'] = paper.retractedAt ? 'retracted' : (paper.status === 'corrigendum' ? 'corrected' : 'current');
    if (paper.doi) {
        otherMeta['crossmark:doi'] = paper.doi;
    }

    return {
        title: paper.title,
        description: description,
        openGraph: {
            title: paper.title,
            description: description,
            type: 'article',
            authors: paper.authorsList,
        },
        other: otherMeta,
        alternates: {
            canonical: canonicalUrl
        },
        twitter: {
            card: 'summary_large_image',
            title: paper.title,
            description: paper.abstract?.substring(0, 160)
        }
    };
}

export default async function PaperDetailPage({ params }: { params: Promise<PaperDetailParams> }) {
    const { volume, issue, paperId } = await params;

    const canonicalPaperId = paperId.toUpperCase();
    if (canonicalPaperId !== paperId) {
        redirect(`/archives/${volume}/${issue}/${canonicalPaperId}`);
    }

    const [paperRes, settings, relatedRes] = await Promise.all([
        getPaperById(canonicalPaperId),
        getSettingsData(),
        getRelatedArticles(canonicalPaperId, 4)
    ]);

    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) notFound();

    const rawBaseUrl = settings['journalWebsite'] || 'https://ijitest.org';
    const baseUrl = rawBaseUrl.startsWith('http') ? rawBaseUrl.replace(/\/$/, '') : `https://${rawBaseUrl.replace(/\/$/, '')}`;

    return (
        <div className="bg-white min-h-screen pb-8">
            <PageHeader
                disableBreadcrumbJsonLd
                title="Research Article"
                description={paper.paperId}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: paper.paperId, href: `/archives/${volume}/${issue}/${paperId}` },
                ]}
            />
            <PaperDetailClient
                paper={{
                    ...paper,
                    coAuthors: paper.coAuthors ?? null
                }}
                relatedArticles={relatedRes.success ? (relatedRes.data ?? []) : []}
            />

            <JsonLd
                id="scholarly-article"
                data={{
                    "@context": "https://schema.org",
                    "@type": "ScholarlyArticle",
                    "headline": paper.title,
                    "description": paper.abstract,
                    "inLanguage": "en",
                    "author": paper.authorsList.map(author => ({
                        "@type": "Person",
                        "name": author
                    })),
                    "datePublished": paper.publishedAt ? new Date(paper.publishedAt).toISOString() : (paper.publicationYear?.toString() || ""),
                    "publisher": {
                        "@type": "Organization",
                        "name": settings['journalName'] || "IJITEST",
                        "logo": {
                            "@type": "ImageObject",
                            "url": `${baseUrl}/favicon_io/apple-touch-icon.png`
                        }
                    },
                    "isPartOf": {
                        "@type": "ScholarlyJournal",
                        "name": settings['journalName'] || "IJITEST",
                        "issn": settings['issnNumber'] || ""
                    },
                    "pageStart": paper.startPage?.toString(),
                    "pageEnd": paper.endPage?.toString(),
                    "volumeNumber": paper.volumeNumber?.toString(),
                    "issueNumber": paper.issueNumber?.toString(),
                    "keywords": paper.keywords,
                    "identifier": paper.doi || "",
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
                            "item": `${baseUrl}`
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
                            "name": paper.paperId,
                            "item": `${baseUrl}/archives/${volume}/${issue}/${paperId}`
                        }
                    ]
                }}
            />
        </div>
    );
}

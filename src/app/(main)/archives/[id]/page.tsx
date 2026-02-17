import { getPaperById } from "@/actions/archives";
import PageHeader from "@/components/layout/PageHeader";
import PaperDetailClient from "@/features/archives/components/PaperDetailClient";
import { notFound } from "next/navigation";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const paper = await getPaperById(id);
    if (!paper) return { title: 'Article Not Found | IJITEST' };

    return {
        title: `${paper.title} | IJITEST Archive`,
        description: paper.abstract?.substring(0, 160) + "...",
        keywords: paper.keywords,
        openGraph: {
            title: paper.title,
            description: paper.abstract?.substring(0, 160),
            type: 'article',
            authors: [paper.author_name],
        }
    };
}

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paper = await getPaperById(id);

    if (!paper) notFound();

    return (
        <div className="bg-white min-h-screen pb-20">
            <PageHeader
                title="Research Article"
                description={paper.paper_id}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: paper.paper_id, href: `/archives/${id}` },
                ]}
            />
            <PaperDetailClient paper={paper} id={id} />
        </div>
    );
}

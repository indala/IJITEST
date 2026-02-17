import PageHeader from "@/components/layout/PageHeader";
import IndexingClient from '@/features/shared/components/IndexingClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Indexing & Abstracting | ${settings.journal_name}`,
        description: `Explore the global discovery hubs where ${settings.journal_short_name} research is archived and indexed. Discover our roadmap for major scientific databases including Google Scholar, CrossRef, and more.`,
        openGraph: {
            title: `Global Indexing - ${settings.journal_short_name}`,
            description: `Planned discovery hubs for inaugural 2026 volume.`,
            type: 'website',
        }
    };
}

export default function Indexing() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Indexing & Abstracting"
                description="Our roadmap for global discovery and technical metadata integration."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Indexing', href: '/indexing' },
                ]}
            />
            <IndexingClient />
        </div>
    );
}

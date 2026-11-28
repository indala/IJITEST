import PageHeader from "@/components/layout/PageHeader";
import IndexingClient from '@/features/indexing/components/IndexingClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: 'Indexing & Abstracting',
        description: `Explore the global discovery hubs where ${settings['journalShortName']} research is archived and indexed, including Google Scholar, CrossRef, and OpenAlex.`,
        alternates: {
            canonical: '/indexing',
        },
        openGraph: {
            title: `Global Indexing - ${settings['journalShortName']}`,
            description: `Planned discovery hubs for inaugural 2026 volume.`,
            url: '/indexing',
            type: 'website',
        }
    };
}

export default async function Indexing() {
    const settings = await getSettingsData();
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
            <IndexingClient settings={settings} />
        </div>
    );
}

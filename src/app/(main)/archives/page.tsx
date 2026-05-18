import PageHeader from "@/components/layout/PageHeader";
import { getArchivePapers } from '@/actions/archives';
import ArchivesClient from '@/features/shared/components/ArchivesClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Journal Archives | ${settings['journalName']}`,
        description: `Browse the digital repository of ${settings['journalShortName']}. Explore peer-reviewed research, technical reports, and innovative trends in engineering and science since ${settings['journalName']}'s inception.`,
        openGraph: {
            title: `Research repository - ${settings['journalShortName']}`,
            description: `Global access to peer-reviewed technical manuscripts.`,
            type: 'website',
        }
    };
}

export default async function Archives() {
    const res = await getArchivePapers();
    const papers = res.success ? res.data || [] : [];

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Journal Archives"
                description="Digital repository of peer-reviewed research and technical reports."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Archives', href: '/archives' },
                ]}
                scrollOnComplete={true}
            />

            <ArchivesClient initialPapers={papers} mode="archive" />
        </main>
    );
}

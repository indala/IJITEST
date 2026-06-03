import PageHeader from "@/components/layout/PageHeader";
import ArchivesClient from '@/features/shared/components/ArchivesClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

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

            <ArchivesClient mode="archive" />
        </main>
    );
}

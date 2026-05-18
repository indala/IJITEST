import PageHeader from "@/components/layout/PageHeader";
import { getLatestIssuePapers } from '@/actions/archives';
import ArchivesClient from '@/features/shared/components/ArchivesClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export const revalidate = 3600; // 1 hour

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Current Issue | ${settings['journalName']}`,
        description: `Explore the latest research and technical papers published in the current issue of ${settings['journalShortName']}.`,
        openGraph: {
            title: `Current Issue - ${settings['journalShortName']}`,
            description: `Access the latest peer-reviewed technical manuscripts.`,
            type: 'website',
        }
    };
}

export default async function CurrentIssue() {
    const res = await getLatestIssuePapers();
    const papers = res.data || [];

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Current Issue"
                description="Latest research publications and technical papers."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Current Issue', href: '/current-issue' },
                ]}
                scrollOnComplete={true}
            />

            <ArchivesClient initialPapers={papers} mode="current" />
        </div>
    );
}

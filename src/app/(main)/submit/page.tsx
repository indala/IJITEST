import PageHeader from "@/components/layout/PageHeader";
import SubmitClient from '@/features/shared/components/SubmitClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Submit Manuscript | ${settings['journalName']}`,
        description: `Submit your original research technical papers to ${settings['journalShortName']} for high-impact peer review and fast-track publication.`,
        alternates: {
            canonical: '/submit',
        },
        openGraph: {
            title: `Manuscript Submission - ${settings['journalShortName']}`,
            description: `Global call for papers in Engineering and Technology.`,
            type: 'website',
        }
    };
}

export default async function SubmitPaper() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Manuscript Submission"
                description="Submit your technical research for peer review and global indexing."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Submit Paper', href: '/submit' },
                ]}
            />
            <SubmitClient />
        </main>
    );
}


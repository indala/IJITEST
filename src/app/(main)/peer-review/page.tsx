import PageHeader from "@/components/layout/PageHeader";
import PeerReviewClient from '@/features/shared/components/PeerReviewClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Peer Review Process | ${settings['journalName']}`,
        description: `Explore the rigorous double-blind peer review process at ${settings['journalShortName']}. We ensure technical accuracy, originality, and scientific impact in all published research.`,
        alternates: {
            canonical: '/peer-review',
        },
        openGraph: {
            title: `Peer Review Excellence - ${settings['journalShortName']}`,
            description: `Quality assurance protocol for scientific manuscripts.`,
            type: 'website',
        }
    };
}

export default async function PeerReview() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Peer Review Process"
                description="Technical accuracy, originality, and scientific impact evaluation system."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Peer Review', href: '/peer-review' },
                ]}
            />
            <PeerReviewClient />
        </main>
    );
}

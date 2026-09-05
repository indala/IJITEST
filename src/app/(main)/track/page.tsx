import PageHeader from "@/components/layout/PageHeader";
import TrackClient from '@/features/shared/components/TrackClient';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Track Your Manuscript | ${settings['journalName']}`,
        description: `Check the real-time status of your research submission at ${settings['journalShortName']}. Transparent tracking of editorial screening, peer review, and publication journey.`,
        alternates: {
            canonical: '/track',
        },
        openGraph: {
            title: `Submission Tracking - ${settings['journalShortName']}`,
            description: `Real-time transparency for research submissions.`,
            type: 'website',
        }
    };
}

export default async function TrackManuscript() {
    const settings = await getSettingsData();

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Track Manuscript"
                description="Real-time transparency for your research submission."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Track', href: '/track' },
                ]}
            />

            <Suspense fallback={
                <section className="min-h-[50vh] bg-background flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </section>
            }>
                <TrackClient journalShortName={settings['journalShortName']} />
            </Suspense>
        </div>
    );
}

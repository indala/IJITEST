
import PageHeader from "@/components/layout/PageHeader";
import JoinUsClient from '@/features/shared/components/JoinUsClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Become a Reviewer | ${settings['journalName']}`,
        description: `Apply to become a reviewer for ${settings['journalShortName']}. Join our global network of experts and contribute to engineering excellence through high-quality peer review.`,
        alternates: {
            canonical: '/join-us',
        },
        openGraph: {
            title: `Editorial Opportunity - ${settings['journalShortName']}`,
            description: `Contribute to the future of engineering discourse.`,
            type: 'website',
        }
    };
}

export default async function JoinUsPage() {
    const settings = await getSettingsData();
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Become a Reviewer"
                description="Join our team of expert reviewers and help maintain the high standards of our journal."
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Join Us", href: "/join-us" }
                ]}
            />
            <JoinUsClient settings={settings} />
        </div>
    );
}

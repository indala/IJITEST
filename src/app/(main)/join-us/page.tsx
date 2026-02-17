
import PageHeader from "@/components/layout/PageHeader";
import JoinUsClient from '@/features/shared/components/JoinUsClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Join Our Editorial Team | ${settings.journal_name}`,
        description: `Apply to become a reviewer or editor for ${settings.journal_short_name}. Join our global network of experts and contribute to engineering excellence through high-quality peer review.`,
        openGraph: {
            title: `Editorial Opportunity - ${settings.journal_short_name}`,
            description: `Contribute to the future of engineering discourse.`,
            type: 'website',
        }
    };
}

export default function JoinUsPage() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Join Us"
                description="Join our global network of experts and contribute to engineering excellence."
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Join Us", href: "/join-us" }
                ]}
            />
            <JoinUsClient />
        </div>
    );
}

import PageHeader from "@/components/layout/PageHeader";
import ReviewerGuidelinesClient from '@/features/policies/components/ReviewerGuidelinesClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: 'Reviewer Guidelines',
        description: `Protocols and ethical standards for manuscript evaluation at ${settings['journalShortName']}. Detailed directives on methodology, originality, and confidentiality.`,
        alternates: {
            canonical: '/reviewer-guidelines',
        },
        openGraph: {
            title: `Technical Evaluation Protocols - ${settings['journalShortName']}`,
            description: `Expert standards for technical evaluation.`,
            url: '/reviewer-guidelines',
            type: 'website',
        }
    };
}

export default async function ReviewerGuidelines() {
    const settings = await getSettingsData();
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Reviewer Guidelines"
                description="Expert standards and ethical responsibilities for technical evaluation."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
                ]}
            />
            <ReviewerGuidelinesClient settings={settings} />
        </div>
    );
}


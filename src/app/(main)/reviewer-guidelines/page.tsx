import PageHeader from "@/components/layout/PageHeader";
import ReviewerGuidelinesClient from '@/features/shared/components/ReviewerGuidelinesClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Reviewer Guidelines | ${settings.journalName}`,
        description: `Elite protocols and ethical standards for manuscript evaluation at ${settings.journalShortName}. Detailed directives on methodology, originality, and confidentiality for domain experts.`,
        alternates: {
            canonical: '/reviewer-guidelines',
        },
        openGraph: {
            title: `Technical Evaluation Protocols - ${settings.journalShortName}`,
            description: `Expert standards for technical evaluation.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function ReviewerGuidelines() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Reviewer Guidelines"
                description="Expert standards and ethical responsibilities for technical evaluation."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
                ]}
            />
            <ReviewerGuidelinesClient />
        </main>
    );
}



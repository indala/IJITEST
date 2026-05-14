import PageHeader from "@/components/layout/PageHeader";
import TermsClient from '@/features/shared/components/TermsClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Terms & Conditions | ${settings.journalName}`,
        description: `Review the legal framework and terms governing your interactions with ${settings.journalShortName}. Detailed protocols on intellectual sovereignty, submission mandates, and ethical standards.`,
        alternates: {
            canonical: '/terms',
        },
        openGraph: {
            title: `Legal Framework - ${settings.journalShortName}`,
            description: `Academic interaction and submission terms.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function TermsAndConditions() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Terms & Conditions"
                description="The legal framework governing your academic interactions and submissions."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Terms & Conditions', href: '/terms' },
                ]}
            />
            <TermsClient />
        </main>
    );
}

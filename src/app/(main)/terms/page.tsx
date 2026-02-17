import PageHeader from "@/components/layout/PageHeader";
import TermsClient from '@/features/shared/components/TermsClient';
import { Metadata } from 'next';
import { getSettings } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettings();
    return {
        title: `Terms & Conditions | ${settings.journal_name}`,
        description: `Review the legal framework and terms governing your interactions with ${settings.journal_short_name}. Detailed protocols on intellectual sovereignty, submission mandates, and ethical standards.`,
        openGraph: {
            title: `Legal Framework - ${settings.journal_short_name}`,
            description: `Academic interaction and submission terms.`,
            type: 'website',
        }
    };
}

export default function TermsAndConditions() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Terms & Conditions"
                description="The legal framework governing your academic interactions and submissions."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Terms & Conditions', href: '/terms' },
                ]}
            />
            <TermsClient />
        </div>
    );
}

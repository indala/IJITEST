import PageHeader from "@/components/layout/PageHeader";
import PoliciesHubClient from '@/features/policies/components/PoliciesHubClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    const journalShort = settings.journalShortName || 'IJITEST';

    return {
        title: 'Policies',
        description: `Explore the complete policy framework of ${journalShort}, including peer review guidelines, publication ethics, open access licensing, plagiarism, and archiving.`,
        alternates: {
            canonical: '/policies',
        },
        openGraph: {
            title: `Journal Policies - ${journalShort}`,
            description: `Quality assurance benchmarks, COPE ethics, open access licensing, and preservation standards.`,
            url: '/policies',
            type: 'website',
        }
    };
}

export default async function PoliciesPage() {
    const settings = await getSettingsData();
    const journalShort = settings.journalShortName || 'IJITEST';

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Policies"
                description={`Comprehensive ethical, peer review, open access, and preservation protocols governing ${journalShort}.`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About Journal', href: '/about' },
                    { name: 'Policies', href: '/policies' },
                ]}
            />
            <PoliciesHubClient settings={settings} />
        </div>
    );
}

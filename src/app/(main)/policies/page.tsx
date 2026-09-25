import PageHeader from "@/components/layout/PageHeader";
import PoliciesHubClient from '@/features/policies/components/PoliciesHubClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    const journalName = settings['journalName'] || settings['journal_name'] || 'International Journal of Innovative Technology and Exploring Science';
    const journalShort = settings['journalShortName'] || settings['journal_short_name'] || 'IJITEST';

    return {
        title: `Policies | ${journalName}`,
        description: `Explore the complete policy framework of ${journalShort}, including peer review guidelines, publication ethics, open access licensing, plagiarism thresholds, and digital archiving protocols.`,
        alternates: {
            canonical: '/policies',
        },
        openGraph: {
            title: `Journal Policies - ${journalShort}`,
            description: `Quality assurance benchmarks, COPE ethics, open access licensing, and preservation standards.`,
            type: 'website',
        }
    };
}

export default async function PoliciesPage() {
    const settings = await getSettingsData();
    const journalShort = settings['journalShortName'] || settings['journal_short_name'] || 'IJITEST';

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

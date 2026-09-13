import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getSettingsData } from '@/actions/settings';
import PageHeader from '@/components/layout/PageHeader';
import PolicyPageClient from '@/features/policies/PolicyPageClient';
import { getPolicyDefinitions } from '@/features/policies/policy-data';

const SLUG = 'corrections-retractions';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    const policies = getPolicyDefinitions(settings);
    const policy = policies[SLUG];
    if (!policy) return { title: 'Not Found' };

    const journalShort = settings['journalShortName'] || 'IJITEST';

    return {
        title: `${policy.title} | ${journalShort}`,
        description: policy.metaDescription,
        alternates: {
            canonical: `/${SLUG}`,
        },
        openGraph: {
            title: `${policy.title} - ${journalShort}`,
            description: policy.metaDescription,
            url: `/${SLUG}`,
            type: 'website',
        }
    };
}

export default async function CorrectionsRetractionsPage() {
    const settings = await getSettingsData();
    const policies = getPolicyDefinitions(settings);
    const policy = policies[SLUG];
    if (!policy) notFound();

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title={policy.title}
                description={policy.description}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Policies', href: '/#policies' },
                    { name: policy.title, href: `/${SLUG}` },
                ]}
            />
            <PolicyPageClient
                sections={policy.sections}
                relatedLinks={policy.relatedLinks}
            />
        </div>
    );
}

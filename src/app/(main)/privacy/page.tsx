import PageHeader from "@/components/layout/PageHeader";
import PrivacyClient from '@/features/shared/components/PrivacyClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Privacy Policy | ${settings['journalName']}`,
        description: `Learn how ${settings['journalShortName']} protects your personal data and scholarly contributions. Our privacy protocols ensure a secure and confidential research environment.`,
        alternates: {
            canonical: '/privacy',
        },
        openGraph: {
            title: `Data Protection - ${settings['journalShortName']}`,
            description: `Scholarly data privacy and security benchmarks.`,
            type: 'website',
        }
    };
}

export default async function PrivacyPolicy() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Privacy Policy"
                description="Safeguarding personal data and scholarly contributions."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Privacy Policy', href: '/privacy' },
                ]}
            />
            <PrivacyClient />
        </main>
    );
}

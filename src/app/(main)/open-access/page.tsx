import PageHeader from "@/components/layout/PageHeader";
import OpenAccessClient from '@/features/shared/components/OpenAccessClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Open Access Policy | ${settings['journalName']}`,
        description: `Explore ${settings['journalShortName']}'s Open Access policy. All research articles are published under CC BY 4.0 license with immediate, unrestricted, and permanent global access.`,
        alternates: {
            canonical: '/open-access',
        },
        openGraph: {
            title: `Open Access & Licensing Policy - ${settings['journalShortName']}`,
            description: `Immediate, permanent, and free open access to peer-reviewed research under Creative Commons Attribution 4.0 International (CC BY 4.0).`,
            url: '/open-access',
            type: 'website',
        }
    };
}

export default async function OpenAccessPage() {
    const settings = await getSettingsData();
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Open Access Policy"
                description="Our commitment to immediate, free, and unrestricted access to scholarly research worldwide."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About', href: '/about' },
                    { name: 'Open Access Policy', href: '/open-access' },
                ]}
            />
            <OpenAccessClient settings={settings} />
        </div>
    );
}

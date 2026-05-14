import PageHeader from "@/components/layout/PageHeader";
import EthicsClient from '@/features/shared/components/EthicsClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Publication Ethics | ${settings.journalName}`,
        description: `Our commitment to scientific integrity and scholarly standards. ${settings.journalShortName} follows COPE guidelines to ensure ethical publishing and research excellence.`,
        alternates: {
            canonical: '/ethics',
        },
        openGraph: {
            title: `Integrity & Ethics - ${settings.journalShortName}`,
            description: `Quality assurance benchmarks for international publishing.`,
            type: 'website',
        }
    };
}

export const revalidate = 3600;

export default async function PublicationEthics() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Publication Ethics"
                description="Our commitment to scientific integrity and scholarly standards."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication Ethics', href: '/ethics' },
                ]}
            />
            <EthicsClient />
        </main>
    );
}

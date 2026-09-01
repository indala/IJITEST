import PageHeader from "@/components/layout/PageHeader";
import ContactClient from '@/features/shared/components/ContactClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Contact Us | ${settings['journalName']}`,
        description: `Get in touch with the editorial team of ${settings['journalShortName']}. We are available 24/7 for technical support and general inquiries regarding manuscript submissions.`,
        alternates: {
            canonical: '/contact',
        },
        openGraph: {
            title: `Contact ${settings['journalShortName']}`,
            description: `Author support and editorial desk contact information.`,
            type: 'website',
        }
    };
}

export default async function Contact() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Contact Us"
                description="Our editorial team is available to assist you with technical support and general inquiries."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Contact', href: '/contact' },
                ]}
            />
            <ContactClient />
        </div>
    );
}

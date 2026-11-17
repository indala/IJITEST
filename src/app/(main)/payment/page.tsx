import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import PageHeader from '@/components/layout/PageHeader';
import PaymentLookupClient from '@/features/payments/components/PaymentLookupClient';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    const shortName = settings['journalShortName'] || 'IJITEST';
    return {
        title: `Online APC Payment | ${shortName}`,
        description: `Disclose your Manuscript ID and registered correspondent email to access your official invoice and settle Article Processing Charges (APC).`,
        alternates: {
            canonical: '/payment',
        },
    };
}

export default async function PaymentPortalPage() {
    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Online APC Payment"
                description="Secure payment verification portal for accepted manuscripts and volume release grants."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Online Payment', href: '/payment' },
                ]}
            />
            <PaymentLookupClient />
        </div>
    );
}

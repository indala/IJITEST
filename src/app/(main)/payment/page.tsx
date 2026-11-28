import type { Metadata } from 'next';
import PageHeader from '@/components/layout/PageHeader';
import PaymentLookupClient from '@/features/payments/components/PaymentLookupClient';

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Online APC Payment',
        description: `Enter your Manuscript ID and registered email to access your official invoice and settle Article Processing Charges (APC).`,
        alternates: {
            canonical: '/payment',
        },
        openGraph: {
            title: 'Online APC Payment',
            description: 'Official invoice lookup and Article Processing Charges (APC) payment portal.',
            url: '/payment',
            type: 'website',
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

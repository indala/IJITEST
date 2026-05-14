import PaymentClient from '@/features/shared/components/PaymentClient';
import { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Manuscript Grant | ${settings.journalShortName}`,
        description: `Secure payment gateway for manuscript publication at ${settings.journalName}. Standardized IEEE Article Processing Fees (APC) and SJIF impact evaluation grants.`,
        robots: 'noindex, nofollow', // Payment pages should usually not be indexed
    };
}

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    return <PaymentClient id={id} />;
}

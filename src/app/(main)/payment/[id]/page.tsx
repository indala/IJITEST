import PaymentClient from '@/features/payments/components/PaymentClient';
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import type { SubmissionIdParam } from '@/db/types';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Manuscript Grant | ${settings['journalShortName']}`,
        description: `Secure payment gateway for manuscript publication at ${settings['journalName']}. Standardized IEEE Article Processing Fees (APC) and SJIF impact evaluation grants.`,
        robots: 'noindex, nofollow', // Payment pages should usually not be indexed
    };
}

export default async function PaymentPage({ params }: { params: Promise<SubmissionIdParam> }) {
    const { id } = await params;

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                    <p className="text-label text-muted-foreground opacity-50 m-0">Secure Session Initializing</p>
                </div>
            </div>
        }>
            <PaymentClient id={id} />
        </Suspense>
    );
}

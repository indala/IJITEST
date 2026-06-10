import PageHeader from "@/components/layout/PageHeader";
import FaqsClient from "@/features/home/components/FaqsClient";
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Frequently Asked Questions (FAQ) | IJITEST",
    description: "Get answers to common queries about manuscript submission, templates, peer-review timelines, publication fees, and indexing status.",
    alternates: {
        canonical: '/faqs',
    }
};

export default function FaqsPage() {
    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Frequently Asked Questions"
                description="Find answers to common queries regarding manuscript submissions, peer review timelines, publication policies, and other editorial matters."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'FAQ', href: '/faqs' },
                ]}
                scrollOnComplete={true}
            />
            <section className="container-responsive py-12 md:py-20 flex justify-center">
                <FaqsClient />
            </section>
        </main>
    );
}

import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import FaqsClient from "@/features/home/components/FaqsClient";
import { getSettingsData } from "@/actions/settings";
import { JsonLd } from "@/components/shared/JsonLd";

export const metadata: Metadata = {
    title: "Frequently Asked Questions (FAQ) | IJITEST",
    description: "Get answers to common queries about manuscript submission, templates, peer-review timelines, publication fees, and indexing status.",
    alternates: {
        canonical: '/faqs',
    }
};

export default async function FaqsPage() {
    const settings = await getSettingsData();
    const apcInr = settings['apcInr'] || '2500';
    const apcUsd = settings['apcUsd'] || '50';

    const faqsDataForSchema = [
        {
            question: "How long does the peer-review process take?",
            answer: "Our standard peer-review process typically takes 4-6 weeks. We prioritize quality and thoroughness while ensuring a fast-track publication path for groundbreaking research."
        },
        {
            question: "Is IJITEST indexed in major databases?",
            answer: "As a new scholarly startup, IJITEST is currently in the process of being indexed with major databases like Google Scholar and Crossref. We are committed to ensuring maximum visibility for all published research as we grow."
        },
        {
            question: "Does the journal have an ISSN number?",
            answer: "We have initiated the application process for the International Standard Serial Number (ISSN). Authors will be updated as soon as the formal registration is completed, which will apply retrospectively to all published volumes."
        },
        {
            question: "What are the submission guidelines for authors?",
            answer: "Authors should ensure their manuscripts follow our standard template, include an abstract, keywords, and properly formatted references. Detailed guidelines are available in our Author Resource Desk."
        },
        {
            question: "Do you provide Open Access publication?",
            answer: "Yes, IJITEST is a Gold Open Access journal. All published articles are immediately available to the global research community without any subscription barriers."
        },
        {
            question: "How can I join the Editorial Board or become a Reviewer?",
            answer: "We welcome experts from various engineering and science disciplines. You can apply through our Join Us page by submitting your CV and area of expertise."
        },
        {
            question: "What are the Article Processing Charges (APC)?",
            answer: `The Article Processing Charges (APC) are only applicable after acceptance. Standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors. However, we are offering a 100% APC Waiver for the inaugural 2026 volume.`
        },
        {
            question: "How can I track the status of my submitted paper?",
            answer: "You can track your paper in real-time on our Track Manuscript portal using your Submission ID or registered email."
        },
        {
            question: "Can I submit my manuscript in DOCX format?",
            answer: "Yes, we accept manuscripts in both DOCX and PDF formats. Our server automatically handles the layout conversion, and authors can review the generated PDF inside their dashboards."
        }
    ];

    const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://www.ijitest.org').replace(/\/$/, '');

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "@id": `${baseUrl}/faqs#faq-schema`,
        "mainEntity": faqsDataForSchema.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };

    return (
        <main className="bg-background min-h-screen">
            <JsonLd id="faqs-page-schema" data={faqSchema} />
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
                <FaqsClient apcInr={apcInr} apcUsd={apcUsd} />
            </section>
        </main>
    );
}

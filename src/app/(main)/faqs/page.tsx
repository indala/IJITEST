import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import FaqsClient from "@/features/home/components/FaqsClient";
import { getSettingsData } from "@/actions/settings";
import { JsonLd } from "@/components/shared/JsonLd";

export const metadata: Metadata = {
    title: "Frequently Asked Questions (FAQ)",
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
            answer: "Our peer-review process is designed to balance speed with rigor. Standard reviews take 4–6 weeks, while groundbreaking submissions may be considered for fast-track publication to ensure timely visibility."
        },
        {
            question: "How do I track and manage my manuscript after submission?",
            answer: "Upon submission, you can access your dedicated Author Dashboard Panel (/login) using your registered email. Inside, you can track peer-review status in real-time, view generated PDF drafts, upload revisions, and make APC payments."
        },
        {
            question: "Is IJITEST indexed in major databases?",
            answer: "IJITEST publications are indexed, registered, and preserved across recognized scholarly repositories and databases, including the ISSN International Centre (ROAD), Crossref (Official Member Prefix 10.68139), Zenodo (CERN), OpenAIRE EXPLORE, Semantic Scholar (AI2), Google Scholar, and SJIFactor (Passport ID 25877). Additional indexation evaluations (DOAJ, OpenAlex, CiteFactor) are in progress."
        },
        {
            question: "Does the journal have an ISSN number?",
            answer: "Yes. IJITEST is formally registered with the ISSN International Centre with official E-ISSN: 3139-6887 (Online), recognized by UNESCO ROAD for open access scientific resources."
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
            answer: `Article Processing Charges (APCs) are only applicable after acceptance. For the inaugural 2026 volume, we are currently offering a full waiver, meaning no APCs will be charged to either Indian or international authors. This waiver applies to accepted articles in 2026, though future volumes may introduce standard APCs (standard charges are INR ${apcInr} for Indian authors and USD ${apcUsd} for international authors).`
        },
        {
            question: "How can I track the status of my submitted paper?",
            answer: "You can track your paper in real-time on our Track Manuscript portal using your Submission ID and registered email."
        },
        {
            question: "What file format is required for manuscript submission?",
            answer: "Research manuscripts must be submitted in Microsoft Word (.docx) format formatted according to the official journal template. This enables editorial copyediting, double-blind review anonymization, and automatic generation of standard PDF proofs and JATS 1.3 XML. Supporting documents such as signed copyright agreements and reviewer rebuttals accept both DOCX and PDF formats."
        }
    ];

    const baseUrl = (process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');

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
        <div className="bg-background min-h-screen">
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
            <section className="container-responsive section-vertical flex justify-center">
                <FaqsClient apcInr={apcInr} apcUsd={apcUsd} />
            </section>
        </div>
    );
}

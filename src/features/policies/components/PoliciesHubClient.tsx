'use client';

import Link from 'next/link';
import {
    ShieldCheck,
    GitBranch,
    SearchCheck,
    AlertTriangle,
    Scale,
    RefreshCw,
    LockOpen,
    Copyright,
    FileCheck,
    CreditCard,
    Archive,
    Sparkles,
    Building2,
    BookOpen,
    ArrowUpRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ScrollSpyNav } from '@/components/common/ScrollSpyNav';
import { Button } from '@/components/ui/button';

interface PoliciesHubClientProps {
    settings: Record<string, string>;
}

export default function PoliciesHubClient({ settings }: PoliciesHubClientProps) {
    const journalName = settings['journalName'] || settings['journal_name'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalShort = settings['journalShortName'] || settings['journal_short_name'] || 'IJITEST';
    const issn = settings['issnNumber'] || settings['issn_number'] || '3139-6887';
    const publisher = settings['publisherName'] || settings['publisher_name'] || settings['publisher'] || 'Felix Academic Publications';
    const supportEmail = settings['supportEmail'] || settings['support_email'] || 'support@ijitest.org';
    const apcInr = settings['apcInr'] || settings['apc_inr'] || '2500';
    const apcUsd = settings['apcUsd'] || settings['apc_usd'] || '50';

    const policySections = [
        {
            id: 'policy-ethics',
            title: '1. Publication Ethics & Editorial Integrity',
            badge: 'COPE Compliant',
            icon: ShieldCheck,
            href: '/ethics',
            content: (
                <div className="space-y-4">
                    <p>
                        <strong>{journalName}</strong> (ISSN: {issn}) is committed to upholding the highest standards of publication ethics and research integrity. We strictly adhere to the guidelines established by the <strong>Committee on Publication Ethics (COPE)</strong>, <strong>World Association of Medical Editors (WAME)</strong>, and <strong>DOAJ Principles of Transparency and Best Practice in Scholarly Publishing</strong>.
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        {[
                            "Editorial independence is guaranteed; commercial considerations, sponsorship, or institutional affiliation never influence editorial decisions.",
                            "The Editor-in-Chief maintains absolute authority over all accepted and published scholarly content.",
                            "Authorship disputes, corrections, retractions, and ethical complaints are processed strictly according to official COPE flowcharts."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span className="text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/ethics">
                                <span>Dedicated Publication Ethics Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-peer-review',
            title: '2. Double-Blind Peer Review Process',
            badge: 'Double-Blind Review',
            icon: GitBranch,
            href: '/peer-review',
            content: (
                <div className="space-y-4">
                    <p>
                        All original research articles submitted to {journalShort} undergo a rigorous <strong>double-blind peer review process</strong> where the identities of both the authors and the reviewers remain undisclosed to each other throughout the evaluation lifecycle.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                            <span className="font-bold text-primary text-xs block">1. Desk Review (2-3 Days)</span>
                            <p className="text-muted-foreground text-caption m-0">Initial scope check, formatting compliance, and automated similarity verification.</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                            <span className="font-bold text-primary text-xs block">2. Double-Blind Review (2-3 Weeks)</span>
                            <p className="text-muted-foreground text-caption m-0">Evaluation by at least two independent expert referees in the subject field.</p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                            <span className="font-bold text-primary text-xs block">3. Editorial Decision (4-6 Weeks)</span>
                            <p className="text-muted-foreground text-caption m-0">Final formal decision: Accept, Minor/Major Revision, or Reject.</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/peer-review">
                                <span>Dedicated Peer Review Workflow Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-plagiarism',
            title: '3. Plagiarism & Academic Integrity Policy',
            badge: 'Turnitin < 15%',
            icon: SearchCheck,
            href: '/plagiarism-policy',
            content: (
                <div className="space-y-4">
                    <p>
                        {journalShort} enforces a strict, zero-tolerance protocol against all forms of plagiarism, verbatim text copying without attribution, data manipulation, and text recycling (self-plagiarism). Every submission is automatically screened using <strong>Turnitin / iThenticate</strong>.
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        {[
                            "Overall Similarity Index must strictly be under 15% (excluding standard bibliographical references and mathematical formulations).",
                            "No single source match may exceed 2% of overlapping content.",
                            "Papers with intentional plagiarism are rejected immediately with potential reporting to the authors' affiliated institutions."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span className="text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/plagiarism-policy">
                                <span>Dedicated Plagiarism Policy Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-coi',
            title: '4. Conflict of Interest & Competing Interests',
            badge: 'Mandatory Disclosure',
            icon: AlertTriangle,
            href: '/conflict-of-interest',
            content: (
                <div className="space-y-4">
                    <p>
                        To ensure objectivity and trust in scientific publications, all authors, peer reviewers, and editors must declare any direct financial or non-financial conflicts of interest that could influence or appear to influence the work.
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        {[
                            "All manuscripts must include a mandatory 'Declaration of Competing Interests' section immediately before the bibliography.",
                            "Reviewers and editors with personal, institutional, or co-authorship relationships (within past 36 months) must immediately recuse themselves.",
                            "Submissions by editorial board members are handled independently by external guest editors, adhering to the 25% annual endogeny threshold."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span className="text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/conflict-of-interest">
                                <span>Dedicated Conflict of Interest Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-misconduct',
            title: '5. Research Misconduct & Whistleblower Protection',
            badge: 'Whistleblower Protected',
            icon: Scale,
            href: '/research-misconduct',
            content: (
                <div className="space-y-4">
                    <p>
                        Research misconduct includes fabrication or falsification of data, image tampering, selective reporting of experimental metrics, ghost/gift authorship, and redundant submissions.
                    </p>
                    <p>
                        Documented concerns can be reported directly to the Editor-in-Chief in complete confidentiality. Whistleblowers are protected from institutional retaliation throughout the investigation.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/research-misconduct">
                                <span>Dedicated Research Misconduct Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-corrections',
            title: '6. Corrections, Retractions & Errata',
            badge: 'CrossMark Standards',
            icon: RefreshCw,
            href: '/corrections-retractions',
            content: (
                <div className="space-y-4">
                    <p>
                        Published scientific literature represents a permanent public record. Minor author errors that do not affect conclusions are published as a formal <strong>Corrigendum</strong>, while publisher errors are issued as an <strong>Erratum</strong>.
                    </p>
                    <p>
                        In cases of pervasive fabrication, invalid conclusions, or confirmed plagiarism, the article is formally retracted with a persistent <strong>RETRACTED</strong> watermark across all PDF pages in compliance with COPE Retraction Guidelines.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/corrections-retractions">
                                <span>Dedicated Corrections & Retractions Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-open-access',
            title: '7. Open Access Policy & Terms',
            badge: 'Gold Open Access',
            icon: LockOpen,
            href: '/open-access',
            content: (
                <div className="space-y-4">
                    <p>
                        <strong>{journalName}</strong> is a pure <strong>Gold Open Access</strong> journal. In accordance with the <strong>Budapest Open Access Initiative (BOAI)</strong> definition, all published articles are immediately, permanently, and freely accessible online worldwide without subscription fees or paywalls.
                    </p>
                    <p>
                        Readers are free to read, download, copy, distribute, print, search, or link to the full texts of the articles without barrier.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/open-access">
                                <span>Dedicated Open Access Policy Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-copyright',
            title: '8. Copyright & Author Rights Retention',
            badge: 'Authors Retain 100%',
            icon: Copyright,
            href: '/copyright-policy',
            content: (
                <div className="space-y-4">
                    <p>
                        Authors publishing with {journalShort} retain <strong>100% of their copyright and proprietary rights</strong> without restrictions. Authors grant the publisher a non-exclusive license to publish, index, and archive the Version of Record.
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        {[
                            "No copyright transfer or copyright assignment is required.",
                            "Green Open Access: Authors may deposit preprint (AOM), accepted postprint (AAM), and final publisher PDF (VoR) in institutional repositories immediately without embargo.",
                            "Subsequent citations must cite the original publication venue and persistent CrossRef DOI."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span className="text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/copyright-policy">
                                <span>Dedicated Copyright Policy Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-licensing',
            title: '9. Licensing Policy (Creative Commons CC-BY 4.0)',
            badge: 'CC-BY 4.0 International',
            icon: FileCheck,
            href: '/licensing-policy',
            content: (
                <div className="space-y-4">
                    <p>
                        All articles published by {journalShort} are distributed under the terms of the <strong>Creative Commons Attribution 4.0 International License (CC-BY 4.0)</strong>.
                    </p>
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white font-mono text-xs">CC BY 4.0</Badge>
                            <span className="font-bold text-foreground text-xs">Unrestricted Global Reuse</span>
                        </div>
                        <p className="text-muted-foreground text-xs m-0 leading-relaxed">
                            Permits anyone to share (copy, redistribute) and adapt (remix, transform, build upon) the material for any purpose, including commercial applications, provided proper credit is given to the original authors.
                        </p>
                    </div>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/licensing-policy">
                                <span>Dedicated Licensing Policy Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-apc',
            title: '10. Article Processing Charges (APC) & Waivers',
            badge: `₹${apcInr} INR / $${apcUsd} USD`,
            icon: CreditCard,
            href: '/apc-fees',
            content: (
                <div className="space-y-4">
                    <p>
                        Submitting an article and double-blind peer review are <strong>100% free</strong>. An Article Processing Charge (APC) of <strong>₹{apcInr} INR</strong> (India) / <strong>${apcUsd} USD</strong> (International) is invoiced <em>only after formal acceptance</em> by the Editor-in-Chief.
                    </p>
                    <p>
                        We provide up to 100% full publication fee waivers for authors from World Bank low-income economies and unfunded research scholars upon application during manuscript submission.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/apc-fees">
                                <span>Dedicated APC & Fee Transparency Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-archiving',
            title: '11. Digital Preservation & Archiving Policy',
            badge: 'JATS 1.3 XML & PDF/A',
            icon: Archive,
            href: '/archiving-policy',
            content: (
                <div className="space-y-4">
                    <p>
                        To ensure permanent readability and protection against technological obsolescence, all published research is preserved via:
                    </p>
                    <ul className="space-y-2 list-none pl-0">
                        {[
                            "Standard JATS 1.3 XML semantic conversion and PDF/A-1b archival galley generation with embedded fonts.",
                            "Persistent CrossRef DOI minting and Zenodo community open research repository deposit.",
                            "Public OAI-PMH 2.0 harvester metadata endpoint at /api/oai for discovery engines and academic libraries."
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <div className="mt-1.5 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span className="text-foreground/90">{item}</span>
                            </li>
                        ))}
                    </ul>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/archiving-policy">
                                <span>Dedicated Digital Archiving Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-ai',
            title: '12. Artificial Intelligence (AI) Policy',
            badge: 'DOAJ 2024 AI Standard',
            icon: Sparkles,
            href: '/ai-policy',
            content: (
                <div className="space-y-4">
                    <p>
                        In accordance with DOAJ 2024 standards and COPE guidelines, AI systems and LLMs (such as ChatGPT, Claude, Gemini) <strong>cannot be listed or credited as authors</strong> because they cannot assume legal or ethical accountability.
                    </p>
                    <p>
                        Any use of AI tools for data analysis, translation, or grammar assistance must be transparently disclosed in an <strong>&quot;AI and AI-Assisted Technologies Statement&quot;</strong> before the references. Generating synthetic experimental data or manipulating figures with AI is strictly prohibited.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/ai-policy">
                                <span>Dedicated AI Policy Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-publisher',
            title: '13. Publisher Information & Governance',
            badge: 'Corporate Governance',
            icon: Building2,
            href: '/publisher-info',
            content: (
                <div className="space-y-4">
                    <p>
                        <strong>{journalName}</strong> is published by <strong>{publisher}</strong>. Editorial leadership, paper acceptance, and retraction authority reside solely with the independent Editor-in-Chief and Editorial Board.
                    </p>
                    <div className="pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/publisher-info">
                                <span>Dedicated Publisher Information Page</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            id: 'policy-privacy-terms',
            title: '14. Privacy Policy & Terms of Use',
            badge: 'GDPR Compliant',
            icon: BookOpen,
            href: '/privacy',
            content: (
                <div className="space-y-4">
                    <p>
                        We respect the personal privacy of all authors, reviewers, and visitors. Editorial records and peer review files are kept strictly confidential. Access and use of the {journalShort} platform are governed by our standard institutional terms.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/privacy">
                                <span>Privacy Policy</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm" className="rounded-xl text-xs font-semibold gap-1">
                            <Link href="/terms">
                                <span>Terms of Use</span>
                                <ArrowUpRight className="size-3.5 text-primary" />
                            </Link>
                        </Button>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="bg-background min-h-screen">
            <Section>
                <SidebarLayout
                    cols={4}
                    sidebarClassName="hidden lg:block sticky top-28 h-fit"
                    sidebar={
                        <div className="space-y-3">
                            <h3 className="text-primary text-label m-0">Quick Navigation</h3>
                            <ScrollSpyNav
                                items={policySections.map((s) => ({
                                    id: s.id,
                                    title: s.title
                                }))}
                            />
                        </div>
                    }
                >
                    <div className="space-y-8 sm:space-y-10">
                        {policySections.map((section) => {
                            const SectionIcon = section.icon;
                            return (
                                <section key={section.id} id={section.id} className="scroll-mt-24">
                                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                                        <h2 className="text-foreground font-semibold flex items-center gap-2 m-0 text-base sm:text-lg">
                                            <SectionIcon className="size-4 text-primary shrink-0" />
                                            <span>{section.title}</span>
                                        </h2>
                                        <Badge variant="secondary" className="text-meta font-semibold px-2 py-0.5 bg-primary/10 text-primary border-transparent">
                                            {section.badge}
                                        </Badge>
                                    </div>
                                    <div className="text-justify text-foreground/80 space-y-2 border-l-2 border-primary/20 pl-3.5">
                                        {section.content}
                                    </div>
                                </section>
                            );
                        })}
                    </div>
                </SidebarLayout>
            </Section>

            {/* Assistance Section */}
            <Section background="gradient" padding={false} className="pb-8 sm:pb-12">
                <div className="bg-primary p-5 sm:p-7 rounded-xl text-white relative overflow-hidden shadow-md">
                    <div className="relative z-10 space-y-2 text-center">
                        <h2 className="text-white m-0">Need Policy Clarification?</h2>
                        <p className="text-white/70 max-w-xl mx-auto m-0 text-xs sm:text-sm">
                            For any inquiries regarding publication ethics, author rights, or waiver eligibility, contact our editorial office.
                        </p>
                        <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-rose-300 hover:text-white transition-colors font-bold text-xs sm:text-sm"
                            >
                                {supportEmail}
                            </a>
                            <span className="text-white/40">•</span>
                            <Link href="/contact" className="text-white underline hover:text-rose-300 text-xs sm:text-sm font-semibold">
                                Contact Editorial Office
                            </Link>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}

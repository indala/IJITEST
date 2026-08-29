"use client";

import {
    Download
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import { useSettingsContext } from '@/components/providers/SettingsContext';

export default function GuidelinesContent() {
    const settings = useSettingsContext();
    const supportEmail = settings['supportEmail'] || "support@ijitest.org";

    const sections = [
        {
            title: "Introduction",
            content: (
                <p>
                    Authors are requested to read and follow the instructions below carefully before submitting their papers; so that it will be helpful for the publication of your paper is as rapid and efficient as possible. The Publisher of the journal reserves the right to return manuscripts that are not prepared in according to the guidelines of the journal.
                </p>
            )
        },
        {
            title: "Paper Review",
            content: (
                <ul className="space-y-4 list-none pl-0">
                    {[
                        "All submitted papers are subject to peer review and are expected to meet standards of academic excellence.",
                        "The reviewers recommendations determine the process of whether the submitted paper should be accepted/accepted subject to changes/subject to resubmission with significant changes/rejected.",
                        "The papers which needs change, will be requested for change and the modified paper will be reviewed by the same reviewers.",
                        "The Review report of the reviewed articles will be kept in confidential.",
                        "Initial screening and desk-review decisions are completed within 2-3 days of submission. The double-blind peer-review evaluation takes 2-3 weeks, with final editorial decisions and acceptance notifications completed within 4-6 weeks."
                    ].map((item, i) => (
                        <li key={i} className="flex gap-4">
                            <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )
        },
        {
            title: "Open Access Policy & Licensing",
            content: (
                <div className="space-y-6">
                    <p className="leading-relaxed">
                        International Journal of Innovative Trends in Engineering Science and Technology ({settings['journalShortName'] || 'IJITEST'}) is a fully Open Access journal. All published articles are immediately and permanently available online to readers free of charge, without subscription, registration, or payment. The journal does not restrict access to its published research based on institutional membership or subscription status.
                    </p>
                    <p className="leading-relaxed">
                        Readers may access, read, download, copy, distribute, print, search, and link to the full text of published articles, subject to the terms of the applicable Creative Commons Licence. All articles are published under the <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> licence, unless otherwise stated on the individual article.
                    </p>
                    
                    {/* Creative Commons Attribution 4.0 Card */}
                    <div className="p-5 rounded-2xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded bg-[#000066] text-white font-mono font-bold text-xs tracking-wider">
                                    CC BY 4.0
                                </span>
                                <span className="font-bold text-primary text-sm">Creative Commons Attribution 4.0 International</span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed m-0">
                                Permits anyone to copy, redistribute, remix, transform, and build upon the work in any medium or format, provided appropriate credit is given to the original authors and journal.
                            </p>
                        </div>
                        <a
                            href="https://creativecommons.org/licenses/by/4.0/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-primary/20 text-[#000066] hover:text-secondary text-xs font-bold shadow-xs hover:shadow-sm transition-all shrink-0"
                        >
                            <span>Verify License</span>
                            <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </div>
                </div>
            )
        },
        {
            title: "Author Charges & Fee Transparency",
            content: (
                <div className="space-y-6">
                    <p className="leading-relaxed">
                        To maintain sustainable open-access publishing, rapid peer review, permanent DOI assignment, and digital repository archiving, {settings['journalShortName'] || 'IJITEST'} operates on a transparent, low-cost Article Processing Charge (APC) model. APCs are billed only after formal editorial acceptance. <strong>Charges do not affect editorial decisions or the double-blind peer-review process.</strong>
                    </p>

                    {/* Transparent Fee Table */}
                    <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-xs">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-primary/5 text-primary border-b border-border font-serif text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="py-3.5 px-4 font-bold">Fee Category</th>
                                    <th className="py-3.5 px-4 font-bold text-center">Indian Authors (INR)</th>
                                    <th className="py-3.5 px-4 font-bold text-center">Foreign Authors (USD)</th>
                                    <th className="py-3.5 px-4 font-bold">Details</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                <tr className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-foreground">Submission Fee</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">₹0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">$0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground">No fee for manuscript submission</td>
                                </tr>
                                <tr className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-foreground">Editorial Processing Charge</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">₹0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">$0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground">No fee for desk review or referee handling</td>
                                </tr>
                                <tr className="bg-primary/[0.02] hover:bg-primary/[0.05] transition-colors">
                                    <td className="py-3 px-4 font-bold text-primary">Article Processing Charge (APC)</td>
                                    <td className="py-3 px-4 text-center font-bold text-secondary font-mono">
                                        {settings['apcInr'] === '0' ? '₹0 (100% Waiver)' : settings['apcInr'] ? `INR ₹${settings['apcInr']}` : '₹0 (Full Waiver)'}
                                    </td>
                                    <td className="py-3 px-4 text-center font-bold text-secondary font-mono">
                                        {settings['apcUsd'] === '0' ? '$0 (100% Waiver)' : settings['apcUsd'] ? `USD $${settings['apcUsd']}` : '$0 (Full Waiver)'}
                                    </td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground">Covers up to 5 authors & standard 8 pages</td>
                                </tr>
                                <tr className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-foreground">Excess Page Charges</td>
                                    <td className="py-3 px-4 text-center font-mono font-semibold text-foreground/80">INR ₹500 / page</td>
                                    <td className="py-3 px-4 text-center font-mono font-semibold text-foreground/80">USD $10 / page</td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground">Applicable only for pages exceeding 8 pages</td>
                                </tr>
                                <tr className="hover:bg-muted/30 transition-colors">
                                    <td className="py-3 px-4 font-semibold text-foreground">Colour & Graphic Charges</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">₹0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-center text-emerald-700 font-bold font-mono">$0 (Free / Nil)</td>
                                    <td className="py-3 px-4 text-xs text-muted-foreground">No extra charges for color figures or diagrams</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )
        },
        {
            title: "Paper Formatting Guidelines",
            content: (
                <div className="space-y-8">
                    <div>
                        <h3 className="text-secondary  mb-4">1. Text and Type Area (Margins)</h3>
                        <p>Paper should of standard format (8.5 &ldquo; x 11&rdquo;) with the text fully justified.</p>
                        <p className="mt-2 ">Margins : Top 0.7&rdquo;, Bottom 0.7&rdquo;, Right 0.6&rdquo;, Left 0.6&rdquo;</p>
                        <p className="mt-2">Paper should be in two column format with column width 3.42&rdquo; and space between columns be 0.2&rdquo;. No figures should fall out of this text page.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary  mb-4">2. Titles Format</h3>
                        <ul className="space-y-2 list-none pl-0">
                            <li>• <b>Paper Title :</b> Capitalize Each Word case, 14 point type (Times Roman Bold)</li>
                            <li>• <b>Author(s) and Affiliation :</b> Capitalize Each Word case, 10 point type (Times Roman)</li>
                            <li>• <b>Head :</b> BOLD CAPITAL LETTERS. 10 point type (Times Roman)</li>
                            <li>• <b>Sub Head :</b> Lower case, 10 point (Times Roman)</li>
                        </ul>
                        <p className="mt-4 text-sm text-primary/60 ">Note: Leave two line spaces between title and author names/affiliation. Leave 3 lines spaces between author/affiliation and abstract.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary  mb-4">3. Text</h3>
                        <p>Text type should be 10 point Times Roman. Text should be single spaced. First line of all paragraphs should be indented and there should be one line gap between consecutive paragraphs.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary  mb-4">4. Heads / Sub Heads</h3>
                        <p>Levels of subheads should be easily distinguishable from each other with the use of numbers. There should be one line spaces before each subhead and one line space after each subhead.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary  mb-4">5. Figures and Tables</h3>
                        <p>Legends/Captions should be 9 point (Times Roman). Figure legend should be beneath the figure (Figure 1, Figure 2 etc..) and table legend should be above the table (Table 1, Table 2 etc….). Both must be cited in text.</p>
                    </div>

                    <div>
                        <h3 className="text-secondary mb-2 text-sm sm:text-base font-bold">6. References</h3>
                        <p className="mb-2">References text type should be 10 point (Times Roman) at the end of the paper. Format as follows:</p>
                        <div className="space-y-2 bg-primary/5 p-3.5 rounded-xl border border-primary/10 font-mono text-xs overflow-x-auto">
                            <p className="m-0">[1] Jesmin Nahar and Tasadduq Imam et al,&rdquo; Association rule mining to detect factors which contribute to heart disease in males and females&rdquo;, Journal of Expert Systems with Applications Vol.40, PP.1086&ndash;1093, 2013</p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Authors Limitation",
            content: (
                <p>Maximum number of five authors is allowed for each paper.</p>
            )
        },
        {
            title: "Proofs",
            content: (
                <p>Modified Papers must be returned to the publisher within 4-5 days of receipt. The publisher will do everything possible to ensure prompt publication.</p>
            )
        },
        {
            title: "Editorial Board & Reviewers",
            content: (
                <div className="space-y-4">
                    <p>We welcome Professors, Engineering Experts and Scientists to join in our Editorial Board Members or as Reviewers. Interested persons can send us an email, along with their curriculum vitae (CV), to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline">{supportEmail}</a>.</p>
                </div>
            )
        },
        {
            title: "Paper Submission Instructions",
            content: (
                <div className="space-y-6">
                    <p>
                        Authors are requested to submit their papers formatted according to the guidelines provided electronically through <Link href="/submit" className="text-secondary font-bold hover:underline cursor-pointer">Submit Your Manuscript</Link> or to <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline cursor-pointer">{supportEmail}</a>.
                    </p>
                    <p>
                        All submitted articles should report original, previously unpublished research results. The final paper (.doc/.docx) along with the signed COPYRIGHT FORM should be submitted. All authors should sign individually.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                        <Button asChild size="lg" className="btn-primary">
                            <Link href="/submit">Submit Manuscript</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="btn-outline">
                            <a href={settings['templateUrl'] || "/docs/template.docx"} download>
                                <Download className="w-5 h-5 2xl:w-8 2xl:h-8 mr-2" /> Download Template
                            </a>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="btn-outline">
                            <a href={settings['copyrightUrl'] || "/docs/copyright-form.docx"} download>
                                <Download className="w-5 h-5 2xl:w-8 2xl:h-8 mr-2" /> Copyright Form
                            </a>
                        </Button>
                    </div>
                </div>
            )
        },
        {
            title: "Author Dashboard Panel",
            content: (
                <div className="space-y-4">
                    <p>
                        Upon manuscript submission, authors gain access to their dedicated <b>Author Dashboard Panel</b>. By logging in, authors can manage and track their papers throughout the publishing cycle:
                    </p>
                    <ul className="space-y-3 list-none pl-0">
                        {[
                            "Track manuscript evaluation and peer-review status in real-time.",
                            "Download system-generated PDF proofs and review layout alignment.",
                            "Receive peer review reports and submit revised manuscript files directly.",
                            "Upload signed Copyright Forms and process APC payments securely after acceptance."
                        ].map((item, i) => (
                            <li key={i} className="flex gap-4">
                                <div className="mt-2 w-1.5 h-1.5 bg-secondary rounded-full shrink-0" />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="pt-2">
                        Authors can access their panel by clicking on <b>Login</b> at the top right of the homepage or navigating directly to <Link href="/login" className="text-secondary font-bold hover:underline">Portal Access</Link>.
                    </p>
                </div>
            )
        }
    ];

    return (
        <main className="bg-background min-h-screen">
            <PageHeader
                title="Author Guidelines"
                description={`Comprehensive protocol for submitting manuscripts to ${settings['journalShortName'] || 'IJITEST'}.`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Guidelines', href: '/guidelines' },
                ]}
            />

            <Section>
                <SidebarLayout
                    cols={4}
                    sidebarClassName="hidden lg:block sticky top-32 h-fit"
                    sidebar={
                        <>
                            <h3 className="text-primary mb-6 m-0  tracking-widest uppercase opacity-60">Quick Navigation</h3>
                            <nav className="space-y-4 border-l border-primary/10 pl-4">
                                {sections.map((section, idx) => (
                                    <a
                                        key={idx}
                                        href={`#guideline-${idx}`}
                                        className="text-primary/60 hover:text-secondary block py-1 m-0 text-sm font-medium transition-colors"
                                    >
                                        {section.title}
                                    </a>
                                ))}
                            </nav>
                        </>
                    }
                >
                    <div className="space-y-6 sm:space-y-8">
                        {sections.map((section, idx) => (
                            <section key={idx} id={`guideline-${idx}`} className="scroll-mt-24">
                                <h2 className="text-secondary mb-1.5 flex items-baseline gap-2 m-0">
                                    {section.title}
                                </h2>
                                <div className="text-justify text-primary/80 space-y-2 border-l-2 border-secondary/20 pl-3.5">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                </SidebarLayout>
            </Section>

            {/* Support Card - Separated for Emphasis */}
            <Section background="gradient" padding={false} className="pb-8 sm:pb-12">
                <div className="bg-[#000066] p-5 sm:p-7 rounded-xl text-white relative overflow-hidden shadow-md">
                    <div className="relative z-10 space-y-2 text-center">
                        <h2 className="text-white m-0">Need Assistance?</h2>
                        <p className="text-white/70 max-w-xl mx-auto m-0">For any queries regarding paper submission or formatting, contact our editorial team.</p>
                        <div className="pt-1">
                            <a
                                href={`mailto:${supportEmail}`}
                                className="text-secondary hover:text-white transition-colors font-bold inline-block"
                            >
                                {supportEmail}
                            </a>
                        </div>
                    </div>
                </div>
            </Section>
        </main>
    );
}


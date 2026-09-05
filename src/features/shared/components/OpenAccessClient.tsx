import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { ScrollSpyNav } from '@/components/common/ScrollSpyNav';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
    BookOpen, 
    CheckCircle2, 
    ExternalLink, 
    FileText, 
    Globe, 
    LockOpen, 
    Scale, 
    Sparkles, 
    UploadCloud 
} from 'lucide-react';
import Link from 'next/link';

import type { JournalSettings } from '@/db/types';

interface OpenAccessClientProps {
    settings: JournalSettings;
}

export default function OpenAccessClient({ settings }: OpenAccessClientProps) {
    const journalName = settings.journalName || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalShortName = settings.journalShortName || 'IJITEST';
    const supportEmail = settings.supportEmail || 'support@ijitest.org';
    const apcInr = settings.apcInr || '2500';
    const apcUsd = settings.apcUsd || '50';

    const sections = [
        {
            title: "Open Access Statement",
            content: (
                <div className="space-y-4">
                    <p className="leading-relaxed">
                        <strong>{journalName} ({journalShortName})</strong> is a fully Open Access journal. All published articles are immediately and permanently available online to readers worldwide free of charge, without subscription fees, registration barriers, or paywalls.
                    </p>
                    <p className="leading-relaxed">
                        The journal does not restrict access to its published research based on institutional affiliation, geographic location, or subscription status. Readers may access, read, download, copy, distribute, print, search, or link to the full texts of published articles, or use them for any other lawful purpose, subject to the terms of the applicable Creative Commons Licence.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/10 space-y-1">
                            <div className="flex items-center gap-2 text-primary font-bold text-xs">
                                <LockOpen className="size-4" />
                                <span>Zero Paywalls</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] m-0">
                                Unrestricted global access from the date of online publication.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 space-y-1">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs">
                                <Globe className="size-4" />
                                <span>Universal Reach</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] m-0">
                                Open for researchers, industry professionals, educators, and the public.
                            </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-blue-500/5 border border-blue-500/15 space-y-1">
                            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
                                <Scale className="size-4" />
                                <span>BOAI Compliant</span>
                            </div>
                            <p className="text-muted-foreground text-[11px] m-0">
                                Adheres to Budapest Open Access Initiative definitions of Open Access.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Licensing Terms (CC BY 4.0)",
            content: (
                <div className="space-y-4">
                    <p className="leading-relaxed">
                        All articles in {journalShortName} are published under the terms of the{' '}
                        <strong>Creative Commons Attribution 4.0 International (CC BY 4.0)</strong> license, unless explicitly stated otherwise on an individual article.
                    </p>
                    <div className="p-4 rounded-xl bg-card border border-border space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <Badge className="bg-primary text-white font-mono text-[11px] px-2 py-0.5">
                                CC BY 4.0
                            </Badge>
                            <span className="font-bold text-foreground text-xs sm:text-sm">
                                Creative Commons Attribution 4.0 International License
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed m-0">
                            Under this license, authors permit anyone to:
                        </p>
                        <ul className="space-y-1.5 text-xs text-muted-foreground list-none p-0 m-0">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Share</strong> — copy and redistribute the material in any medium or format.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Adapt</strong> — remix, transform, and build upon the material for any purpose, even commercially.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span><strong>Attribution</strong> — users must give appropriate credit, provide a link to the license, and indicate if changes were made.</span>
                            </li>
                        </ul>
                        <div className="pt-2 border-t border-border/50">
                            <a
                                href="https://creativecommons.org/licenses/by/4.0/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-secondary transition-colors"
                            >
                                <span>View Full Legal Code on Creative Commons</span>
                                <ExternalLink className="size-3" />
                            </a>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Copyright & Author Rights Retention",
            content: (
                <div className="space-y-4">
                    <p className="leading-relaxed">
                        Authors publishing with {journalShortName} <strong>retain copyright</strong> of their scholarly work without restriction. Authors grant {journalShortName} an exclusive first-publication license while allowing the public to freely access and share the work under the CC BY 4.0 license.
                    </p>
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>No Copyright Transfer:</strong> Authors are not required to transfer their copyright to the publisher or journal.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Commercial and Non-Commercial Reuse:</strong> Authors retain the right to reuse, distribute, and expand their research in future books, lectures, or academic works.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                            <span><strong>Moral Rights:</strong> Authors retain the moral right to be properly credited and identified as the creators of their work.</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Self-Archiving & Repository Policy",
            content: (
                <div className="space-y-4">
                    <p className="leading-relaxed">
                        {journalShortName} encourages and supports author self-archiving across institutional and public repositories. Authors may deposit all versions of their paper without embargo:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                        <Card className="border-border/70 shadow-2xs">
                            <CardContent className="p-3.5 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-secondary">
                                    <FileText className="size-3.5" />
                                    <span>Preprint Version</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed m-0">
                                    Authors may archive pre-refereed drafts on preprint servers (e.g., arXiv, SSRN, TechRxiv) at any time.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/70 shadow-2xs">
                            <CardContent className="p-3.5 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-secondary">
                                    <Sparkles className="size-3.5" />
                                    <span>Accepted Manuscript</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed m-0">
                                    Authors may deposit post-peer-review accepted manuscripts in university and subject repositories immediately.
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border-border/70 shadow-2xs">
                            <CardContent className="p-3.5 space-y-1.5">
                                <div className="flex items-center gap-1.5 font-bold text-xs text-secondary">
                                    <UploadCloud className="size-3.5" />
                                    <span>Published Version (VoR)</span>
                                </div>
                                <p className="text-muted-foreground text-[11px] leading-relaxed m-0">
                                    The final branded publisher PDF may be deposited anywhere immediately with a link to the official DOI.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <p className="text-xs text-muted-foreground m-0 pt-1">
                        All published papers are permanently preserved under digital repositories including <strong>Zenodo</strong> (Community: IJITEST) with persistent DOIs.
                    </p>
                </div>
            )
        },
        {
            title: "Article Processing Charges (APC) Policy",
            content: (
                <div className="space-y-4">
                    <p className="leading-relaxed">
                        To maintain open access without reader subscriptions, {journalShortName} operates on an Article Processing Charge (APC) model. APC is only invoiced <strong>after formal peer review and editorial acceptance</strong>.
                    </p>
                    <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-border/50">
                            <span className="font-bold text-foreground">Standard Publication APC:</span>
                            <span className="font-mono font-bold text-primary">₹{apcInr} (Indian Authors) / ${apcUsd} (International)</span>
                        </div>
                        <div className="space-y-1 text-muted-foreground pt-1">
                            <p className="m-0">
                                • <strong>No Submission Fees:</strong> Submitting a manuscript to {journalShortName} is completely free.
                            </p>
                            <p className="m-0">
                                • <strong>Editorial Independence:</strong> Peer review and editorial decisions are made solely based on scholarly merit and are entirely independent of payment status.
                            </p>
                            <p className="m-0">
                                • <strong>Fee Waivers:</strong> Partial waivers may be considered for authors from low-income economies or unfunded student researchers upon written request prior to review.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            title: "Editorial Independence & User Inquiries",
            content: (
                <div className="space-y-3">
                    <p className="leading-relaxed">
                        Commercial entities, advertisers, and financial sponsors have no influence over editorial decisions, paper acceptance, or publishing schedules. Editorial decisions are overseen strictly by the Editor-in-Chief and Associate Editors following international COPE standards.
                    </p>
                    <p className="leading-relaxed">
                        For questions regarding copyright, licensing permissions, or institutional repository deposits, please reach out to our editorial office at{' '}
                        <a href={`mailto:${supportEmail}`} className="text-secondary font-bold hover:underline">
                            {supportEmail}
                        </a>.
                    </p>
                </div>
            )
        }
    ];

    return (
        <Section>
            <SidebarLayout
                cols={4}
                sidebarClassName="hidden lg:block sticky top-28 h-fit"
                sidebar={
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h3 className="text-primary text-label m-0">Quick Navigation</h3>
                            <ScrollSpyNav
                                items={sections.map((s, idx) => ({
                                    id: `section-${idx}`,
                                    title: s.title
                                }))}
                            />
                        </div>

                        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-xs text-primary">
                                <BookOpen className="size-3.5" />
                                <span>Related Policies</span>
                            </div>
                            <div className="flex flex-col gap-1.5 text-xs">
                                <Link href="/ethics" className="text-muted-foreground hover:text-primary transition-colors">
                                    • Publication Ethics
                                </Link>
                                <Link href="/peer-review" className="text-muted-foreground hover:text-primary transition-colors">
                                    • Peer Review Policy
                                </Link>
                                <Link href="/guidelines" className="text-muted-foreground hover:text-primary transition-colors">
                                    • Author Guidelines
                                </Link>
                            </div>
                        </div>
                    </div>
                }
            >
                <div className="space-y-6 sm:space-y-8">
                    {sections.map((section, idx) => (
                        <section key={idx} id={`section-${idx}`} className="scroll-mt-24 space-y-2">
                            <h2 className="m-0">
                                {section.title}
                            </h2>
                            <div className="text-muted-foreground border-l-2 border-border pl-3.5">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </div>
            </SidebarLayout>
        </Section>
    );
}

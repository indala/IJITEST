import { ShieldCheck, BookOpen, ChevronRight, ShieldAlert, MessageCircle, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';

import type { JournalSettings } from '@/db/types';

interface ReviewerGuidelinesClientProps {
    settings: JournalSettings;
}

export default function ReviewerGuidelinesClient({ settings }: ReviewerGuidelinesClientProps) {
    const supportEmail = settings.supportEmail || '';
    const supportPhone = settings.supportPhone || '';
    const journalShortName = settings.journalShortName || 'IJITEST';

    const directives = [
        { title: "Originality", desc: "Evaluate the significant empirical novelty or conceptual innovation presented in the manuscript." },
        { title: "Methodology", desc: "Assess the rigor of experimental design and the validity of analytical protocols." },
        { title: "Clarity", desc: "Ensure concise language and precise data visualization for effective communication." },
        { title: "Impact", desc: "Determine the potential contribution to the global scientific community." }
    ];

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                    <section className="space-y-2">
                        <h2 className="font-semibold m-0">
                            &quot;Peer reviewers are fundamental to scientific discourse, ensuring the rigorous validation and ethical integrity of published research.&quot;
                        </h2>
                    </section>

                    <section className="space-y-3">
                        <h3 className="flex items-center gap-2 m-0">
                            <span className="text-meta">01.</span>
                            Evaluation Directives
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {directives.map((item, i) => (
                                <Card key={i} className="p-3.5 border-border/70 bg-card rounded-xl hover:border-primary/30 transition-all shadow-2xs">
                                    <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center mb-2.5 text-primary">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <h4 className="mb-1 m-0">{item.title}</h4>
                                    <p className="text-muted-foreground m-0">{item.desc}</p>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <Card className="p-4 sm:p-5 border-border/70 bg-muted/20 rounded-xl shadow-2xs">
                        <div className="relative z-10 flex flex-col md:flex-row gap-4 items-center text-left">
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 border border-primary/20">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="m-0">Confidentiality Protocol</h3>
                                <p className="text-muted-foreground border-l-2 border-primary/30 pl-3.5 m-0">
                                    &quot;Reviewers must treat all manuscript assets as privileged intellectual property. Unauthorized dissemination or use of unpublished data is strictly prohibited.&quot;
                                </p>
                            </div>
                        </div>
                    </Card>

                    <section className="bg-[#000066] text-white p-4 sm:p-6 rounded-xl relative overflow-hidden shadow-md">
                        <div className="relative z-10 space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-white m-0">Join Our Reviewer Network</h3>
                                    <p className="text-white/70 max-w-xl m-0">
                                        Contribute your expertise to {journalShortName} and help maintain the standards of engineering research.
                                    </p>
                                </div>
                                <div className="bg-white/10 p-2.5 rounded-xl border border-white/20 shrink-0 hidden sm:block">
                                    <BookOpen className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2.5 w-full">
                                <Button asChild size="sm" className="h-8 px-4 bg-white text-primary hover:bg-white/90 text-xs font-bold rounded-lg transition-all flex-1 sm:flex-none">
                                    <a href={`mailto:${supportEmail}`}><Mail className="w-3.5 h-3.5 mr-1.5" /> {supportEmail}</a>
                                </Button>
                                <Button asChild size="sm" className="h-8 px-4 bg-white/10 text-white hover:bg-white/20 text-xs font-bold rounded-lg transition-all border border-white/20 flex-1 sm:flex-none">
                                    <a href={`https://wa.me/${supportPhone.replace(/[\s+]/g, '')}`} className="flex items-center"><MessageCircle className="w-3.5 h-3.5 mr-1.5" /> WhatsApp Support</a>
                                </Button>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                        <TrackManuscriptWidget />
                    </div>

                    <div className="p-4 border-border/70 bg-card rounded-xl space-y-2 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <h3 className="text-primary m-0">Ethics Matrix</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed m-0">
                            All reviewers are expected to follow COPE guidelines for ethical evaluation and disclosure.
                        </p>
                        <div className="pt-1">
                            <Link href="/ethics" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors">
                                <span>View Full Policy</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}


import { ShieldCheck, Clock, ChevronRight, Search, Gavel, Users } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

import type { JournalSettings } from '@/db/types';

interface PeerReviewClientProps {
    settings: JournalSettings;
}

export default function PeerReviewClient({ settings }: PeerReviewClientProps) {
    const journalShortName = settings.journalShortName || '';

    const stages = [
        {
            title: "Preliminary Screening",
            desc: "The editorial board performs an initial triage to verify scope alignment, formatting compliance, and plagiarism benchmarks. Manuscripts that fail this stage are returned immediately.",
            icon: Search
        },
        {
            title: "Double-Blind Evaluation",
            desc: "The manuscript is assigned to at least two independent global domain experts. To ensure technical objectivity, both author and reviewer identities remain fully anonymous.",
            icon: Users
        },
        {
            title: "Final Adjudication",
            desc: "The Editor-in-Chief synthesizes expert feedback to issue a final decision: Accepted, Minor/Major Revision required, or Rejected.",
            icon: Gavel
        }
    ];

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Hero Statement */}
                    <section className="bg-primary p-5 sm:p-6 rounded-xl text-white relative overflow-hidden shadow-xs">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
                            <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 shrink-0">
                                <ShieldCheck className="w-6 h-6 text-secondary" />
                            </div>
                            <div className="space-y-1.5">
                                <h2 className="font-semibold m-0 text-white">Scientific Integrity</h2>
                                <p className="text-white/90 border-l-2 border-secondary/50 pl-4 m-0">
                                    Every manuscript submitted to {journalShortName} undergoes a rigorous double-blind peer review process to ensure technical accuracy and originality.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Review Pipeline */}
                    <section className="space-y-4">
                        <h2 className="m-0">
                            Review Pipeline
                        </h2>

                        <div className="space-y-4">
                            {stages.map((stage, idx) => (
                                <article key={idx} className="group relative flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary border border-primary/10 transition-colors shrink-0">
                                            <stage.icon className="w-4 h-4" />
                                        </div>
                                        {idx !== stages.length - 1 && <div className="w-px flex-1 bg-border/50 my-1.5" />}
                                    </div>
                                    <div className="pb-3">
                                        <h3 className="mb-0.5 m-0">
                                            {stage.title}
                                        </h3>
                                        <p className="text-muted-foreground m-0">
                                            {stage.desc}
                                        </p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>

                    {/* Velocity Highlight */}
                    <section className="p-4 sm:p-5 bg-card border border-border/70 rounded-xl shadow-2xs border-l-4 border-l-secondary">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center shrink-0 border border-secondary/20">
                                <Clock className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="space-y-0.5">
                                <h3 className="m-0">Rapid Verdict</h3>
                                <p className="text-muted-foreground leading-relaxed m-0 italic">
                                    &quot;Our peer-review process is designed to balance speed with rigor. Standard reviews take 2–4 weeks, while groundbreaking submissions may be considered for fast-track publication to ensure timely visibility.&quot;
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 sm:space-y-5">
                    <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                        <TrackManuscriptWidget />
                    </div>

                    <div className="p-4 bg-card border border-border/70 rounded-xl shadow-2xs border-l-4 border-l-primary/20 space-y-2">
                        <h3 className="text-primary m-0">COPE Standards</h3>
                        <p className="text-muted-foreground leading-relaxed m-0">
                            Adherence to the Committee on Publication Ethics (COPE) guidelines for transparency and scientific rigor.
                        </p>
                        <div className="pt-1">
                            <Link href="/ethics" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-primary transition-colors">
                                <span>View Policy</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </div>

                    <div className="p-4 bg-[#000066] rounded-xl shadow-md text-white space-y-2.5">
                        <h3 className="m-0 text-white">Join as Reviewer</h3>
                        <p className="text-white/70 leading-relaxed m-0">Interested in joining our global panel? Share your technical profile with our board.</p>
                        <Button asChild size="sm" className="w-full h-8 bg-white text-primary border-none hover:bg-white/90 font-bold text-xs rounded-lg transition-all">
                            <Link href="/join-us" className="w-full h-full flex items-center justify-center">Submit Profile</Link>
                        </Button>
                    </div>
                </aside>
            </div>
        </section>
    );
}


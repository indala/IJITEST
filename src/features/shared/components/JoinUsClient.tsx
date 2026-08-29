import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award } from 'lucide-react';

import type { JournalSettings } from '@/db/types';


const BENEFITS = [
    {
        icon: Globe,
        title: "Credit",
        desc: "Get credit for your quality review work."
    },
    {
        icon: Users,
        title: "Connect",
        desc: "Connect with fellow researchers."
    },
    {
        icon: Award,
        title: "Award",
        desc: "Receive official certificates for your review work."
    }
];

const REQUIREMENTS = [
    "PhD in Engineering or a related technical field",
    "Active research background with recent publications",
    "Minimum 5 peer-reviewed papers published",
    "Affiliation with a recognized academic or research institution"
];



interface JoinUsClientProps {
    settings: JournalSettings;
}

export default function JoinUsClient({ settings: _settings }: JoinUsClientProps) {
    return (
        <section className="container-responsive py-6 sm:py-8" aria-labelledby="join-us-heading">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Benefits & Requirements */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-4 sm:space-y-5">
                    <header className="space-y-1">
                        <h2 id="join-us-heading" className="m-0">
                            Join Editorial & Reviewer Board
                        </h2>
                        <p className="text-muted-foreground m-0">
                            Contribute your technical expertise and help evaluate breakthrough research.
                        </p>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2.5" role="list" aria-label="Benefits of joining">
                        {BENEFITS.map((benefit, i) => (
                            <article key={i} role="listitem" className="p-3 bg-card border border-border/70 rounded-xl transition-all group hover:bg-muted/20">
                                <div className="flex gap-3 items-center">
                                    <div className="w-8 h-8 bg-[#000066]/5 rounded-lg flex items-center justify-center shrink-0 text-[#000066]" aria-hidden="true">
                                        <benefit.icon className="w-4 h-4" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <h3 className="text-foreground m-0">{benefit.title}</h3>
                                        <p className="text-muted-foreground m-0">{benefit.desc}</p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    <section className="p-4 rounded-xl bg-muted/20 border border-border/70 space-y-2.5" aria-labelledby="eligibility-heading">
                        <h3 id="eligibility-heading" className="m-0">Eligibility Criteria</h3>
                        <ul className="space-y-2 list-none p-0 m-0">
                            {REQUIREMENTS.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <div className="bg-card p-4 sm:p-6 rounded-xl border border-border/70 shadow-2xs overflow-hidden">
                        <ReviewerApplicationForm />
                    </div>
                </div>
            </div>
        </section>
    );
}

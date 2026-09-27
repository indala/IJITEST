import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award } from 'lucide-react';

import type { JournalSettings } from '@/db/protocols';


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
        <section className="container-responsive section-vertical" aria-labelledby="join-us-heading">
            {/* Top Header & 3-Column Benefits Grid */}
            <div className="space-y-4 mb-6 sm:mb-8">
                <header className="space-y-1">
                    <h1 id="join-us-heading" className="panel-title m-0">
                        Join Editorial & Reviewer Board
                    </h1>
                    <p className="panel-subtitle m-0">
                        Contribute your technical expertise and help evaluate breakthrough research.
                    </p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4" role="list" aria-label="Benefits of joining">
                    {BENEFITS.map((benefit, i) => (
                        <article key={i} role="listitem" className="p-3.5 sm:p-4 bg-card border border-border/70 rounded-xl transition-all group hover:bg-muted/20 shadow-2xs">
                            <div className="flex gap-3 items-center">
                                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 text-primary" aria-hidden="true">
                                    <benefit.icon className="w-4.5 h-4.5" />
                                </div>
                                <div className="space-y-0.5">
                                    <h3 className="card-title-brand text-[15px] sm:text-[16px] m-0">{benefit.title}</h3>
                                    <p className="text-caption text-muted-foreground m-0">{benefit.desc}</p>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {/* Application Section: Eligibility Criteria Sidebar + Multi-step Application Form */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Eligibility Criteria */}
                <div className="lg:col-span-4 xl:col-span-4 space-y-4">
                    <section className="p-4 sm:p-5 rounded-xl bg-card border border-border/70 shadow-2xs space-y-3" aria-labelledby="eligibility-heading">
                        <h3 id="eligibility-heading" className="card-title-brand m-0">Eligibility Criteria</h3>
                        <ul className="space-y-2.5 list-none p-0 m-0">
                            {REQUIREMENTS.map((item, i) => (
                                <li key={i} className="flex items-start gap-2.5 text-caption text-muted-foreground leading-relaxed">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-8 xl:col-span-8">
                    <div className="bg-card p-4 sm:p-6 rounded-xl border border-border/70 shadow-2xs overflow-hidden">
                        <ReviewerApplicationForm />
                    </div>
                </div>
            </div>
        </section>
    );
}

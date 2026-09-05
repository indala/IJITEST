import { BookOpen, History, ChevronRight } from 'lucide-react';
import type { JournalSettings } from '@/db/types';

const disciplines = [
    "All Engineering Disciplines",
    "Science & Applied Sciences",
    "Technology & Innovation",
    "Computer Science and Information Technology",
    "AI, Artificial Intelligence, Machine Learning, and Data Science",
    "Electronics & Communication Engineering",
    "Mechanical & Civil Engineering",
    "Internet of Things (IoT), Robotics, and Automation",
    "Renewable Energy and Sustainable Technologies"
];

interface AimAndScopeProps {
    shortName?: JournalSettings['journalShortName'] | undefined;
}

export default function AimAndScope({ shortName }: AimAndScopeProps) {
    const displayShortName = shortName || '';

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Aim & Scope */}
            <section
                className="space-y-4"
                aria-labelledby="aim-scope-heading"
            >
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary border border-primary/10" aria-hidden="true">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 id="aim-scope-heading" className="m-0">Aims & Research Scope</h2>
                </div>

                <div className="space-y-3">
                    <p className="text-muted-foreground m-0">
                        {displayShortName} covers all major domains of Engineering, Applied Sciences, and Modern Technology, including:
                    </p>

                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none p-0">
                        {disciplines.map((item, i) => (
                            <li
                                key={i}
                                className="flex items-center justify-between p-2 px-3 2xl:py-2.5 2xl:px-4 bg-card rounded-lg border border-border/60 hover:border-primary/30 transition-all group"
                            >
                                <div className="flex items-center gap-2 text-left">
                                    <div className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:bg-primary transition-colors" aria-hidden="true" />
                                    <span className="text-xs 2xl:text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors">{item}</span>
                                </div>
                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Publication Process */}
            <section className="bg-primary p-4 sm:p-5 2xl:p-7 rounded-xl text-white overflow-hidden relative shadow-md border border-white/5 group/proc" aria-labelledby="publication-heading">
                <div className="absolute top-0 right-0 w-60 h-60 bg-secondary opacity-20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 animate-blob pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent opacity-20 rounded-full blur-[60px] animate-blob pointer-events-none [--delay:2s]" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 2xl:gap-6">
                    <div className="w-10 h-10 2xl:w-12 2xl:h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center shrink-0 border border-white/20 group-hover/proc:rotate-6 transition-all duration-300" aria-hidden="true">
                        <History className="w-5 h-5 2xl:w-6 2xl:h-6 text-secondary" />
                    </div>
                    <div className="space-y-1.5">
                        <h2 id="publication-heading" className="text-white m-0">Publication Process</h2>
                        <p className="text-white/80 m-0">
                            Accepted papers will be published online, upon receiving the final version from the authors in the recent upcoming issue. Our streamlined workflow minimizes time-to-publication while maintaining elite peer-review standards.
                        </p>
                        <div className="flex items-center gap-2 text-secondary text-xs 2xl:text-sm font-bold pt-0.5">
                            <span className="w-6 h-[2px] bg-secondary" aria-hidden="true" />
                            Excellence in Motion
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

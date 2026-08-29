import { BookOpen, Target, Building2, FlaskConical, Cpu, Globe, Sparkles } from 'lucide-react';

import type { JournalSettings } from '@/db/types';

interface AboutClientProps {
    settings: JournalSettings;
}

export default function AboutClient({ settings }: AboutClientProps) {
    const journalName = settings.journalName || '';
    const journalShortName = settings.journalShortName || '';
    const publisherName = settings.publisherName || '';

    return (
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Journal Overview */}
            <section className="relative group">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary border border-border/50">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <h2 className="m-0">Journal Overview</h2>
                </div>
                <div className="text-muted-foreground space-y-2 border-l-2 border-border pl-3.5">
                    <p className="m-0">
                        {journalName} ({journalShortName}) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles.
                    </p>
                    <p className="font-medium text-foreground italic bg-primary/5 p-2.5 rounded-lg border-l-4 border-primary m-0 text-xs">
                        Subject: {settings.journalSubject || 'Multidisciplinary'} • Language: English
                    </p>
                    <p className="m-0">
                        {journalShortName} is dedicated to the dissemination of high-quality research, covering fundamental and applied research, interdisciplinary studies, and emerging technologies that contribute to academic knowledge and industrial growth.
                    </p>
                </div>
            </section>

            {/* Aims Section */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary border border-border/50">
                        <Target className="w-4 h-4" />
                    </div>
                    <h2 className="m-0">Aim of the Journal</h2>
                </div>
                <div className="p-4 sm:p-5 bg-muted/20 border border-border/70 rounded-xl space-y-3">
                    <p className="text-muted-foreground border-l-2 border-primary/30 pl-3.5 m-0">
                        {journalShortName} aims to provide a high-quality international platform for researchers, academicians, industry professionals, and scholars to publish original research in emerging areas of science and technology.
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-none p-0 m-0 pt-1">
                        {[
                            "Promoting innovative research and technological advancements",
                            "Encouraging interdisciplinary research and collaboration",
                            "Bridging the gap between academia and industry",
                            "Publishing high-quality, peer-reviewed research articles",
                            "Supporting young researchers and scholars globally",
                            "Ensuring technical soundness and research relevance"
                        ].map((commitment, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <div className="mt-1 w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                                <span>{commitment}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Scope Section */}
            <section className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary/5 rounded-lg text-primary border border-border/50">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <h2 className="m-0">Scope of the Journal</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                        {
                            icon: <Cpu className="w-4 h-4 text-primary" />,
                            title: "Engineering & Technology",
                            items: ["Electronics & Communication", "Computer Science & IT", "AI & Machine Learning", "Data Science & Big Data", "IoT & Embedded Systems", "Quantum Computing", "5G/6G Communication", "Renewable Energy Systems", "Robotics & Automation"]
                        },
                        {
                            icon: <FlaskConical className="w-4 h-4 text-primary" />,
                            title: "Applied Sciences",
                            items: ["Physics & Applied Physics", "Mathematics & Modeling", "Chemistry & Materials", "Environmental Science"]
                        },
                        {
                            icon: <Globe className="w-4 h-4 text-primary" />,
                            title: "Information & Communication Technologies",
                            items: ["Cloud Computing", "Cyber Security", "Blockchain Technology", "Signal & Image Processing", "Wireless Sensor Networks"]
                        },
                        {
                            icon: <Sparkles className="w-4 h-4 text-primary" />,
                            title: "Healthcare & Management",
                            items: ["Biomedical Engineering", "Medical Electronics", "Health Informatics", "Operations & Supply Chain", "Business Analytics"]
                        }
                    ].map((category, idx) => (
                        <article
                            key={idx}
                            className="p-3.5 bg-card rounded-xl border border-border/70 hover:border-primary/30 transition-all shadow-2xs"
                        >
                            <div className="flex items-center gap-2.5 mb-2">
                                <div className="p-1.5 bg-primary/5 rounded-md border border-border/50">
                                    {category.icon}
                                </div>
                                <h3 className="text-foreground m-0">{category.title}</h3>
                            </div>
                            <ul className="space-y-1 list-none p-0 m-0">
                                {category.items.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <div className="w-1 h-1 bg-muted-foreground/40 rounded-full shrink-0" />
                                        <span className="text-xs text-muted-foreground">
                                            {item}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                    ))}
                </div>
            </section>

            {/* Technical Specifications */}
            <section className="bg-muted/10 p-4 sm:p-5 rounded-xl border border-border/70 relative overflow-hidden">
                <h2 className="mb-3 flex items-center gap-2 m-0">
                    <span className="w-4 h-[2px] bg-primary" /> Technical Details
                </h2>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-2">
                    {[
                        { label: "Commencement", value: "2026" },
                        { label: "Frequency", value: "12 Issues / Year" },
                        { label: "E-ISSN", value: (settings.issnNumber || '3139-6887') },
                        { label: "Format", value: "Online, Open" },
                    ].map((item, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-card border border-border/70 shadow-2xs">
                            <dt className="text-meta uppercase mb-0.5">{item.label}</dt>
                            <dd className="text-xs font-bold text-foreground m-0">{item.value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {/* Open Access & Creative Commons Model */}
            <section className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/15 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-[#000066] text-white font-mono font-bold text-[10px]">
                                CC BY 4.0
                            </span>
                            <h2 className="m-0">Open Access Publishing Model</h2>
                        </div>
                        <p className="text-muted-foreground m-0">
                            {journalShortName} is a fully Open Access journal. All articles are published under the Creative Commons Attribution 4.0 International License (CC BY 4.0), ensuring free, immediate, and permanent global access.
                        </p>
                    </div>
                    <a
                        href="https://creativecommons.org/licenses/by/4.0/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-primary/20 text-[#000066] hover:text-secondary text-xs font-bold shadow-2xs transition-all shrink-0"
                    >
                        <span>License Terms</span>
                    </a>
                </div>
            </section>

            {/* Publisher Info */}
            <section className="bg-[#000066] p-4 sm:p-6 rounded-xl text-white relative overflow-hidden shadow-md">
                <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-white m-0">Journal Publisher</h2>
                            <p className="text-white/70 text-xs m-0">{publisherName}</p>
                        </div>
                    </div>
                    <div className="text-xs text-white/80 space-y-2 border-l-2 border-white/20 pl-4">
                        <p className="m-0 leading-relaxed">
                            {publisherName} is dedicated to bridging the gap between theoretical research and industrial application on a global scale.
                        </p>
                        <p className="m-0 leading-relaxed">
                            Support for {journalShortName} ensures a stable, high-impact platform for researchers, backed by professional editorial handling and world-class indexing infrastructure.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

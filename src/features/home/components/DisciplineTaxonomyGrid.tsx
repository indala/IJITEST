'use client';

import { memo } from 'react';
import { 
    Cpu, 
    Code2, 
    Radio, 
    Cog, 
    Building2, 
    Zap, 
    Activity, 
    Layers, 
    ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface DisciplineItem {
    title: string;
    description: string;
    icon: typeof Cpu;
    tags: string[];
}

const DISCIPLINES: DisciplineItem[] = [
    {
        title: "AI, Machine Learning & Data Science",
        description: "Deep learning, neural networks, natural language processing, LLMs, computer vision, predictive analytics.",
        icon: Cpu,
        tags: ["Deep Learning", "LLMs", "Computer Vision", "Analytics"]
    },
    {
        title: "Computer Science & Cybersecurity",
        description: "Distributed computing, cryptography, cloud architecture, blockchain, software engineering, edge systems.",
        icon: Code2,
        tags: ["Cloud", "Cybersecurity", "Blockchain", "DevOps"]
    },
    {
        title: "Electronics, Wireless & VLSI",
        description: "5G/6G communication, microelectronics, semiconductor design, IoT architectures, signal processing.",
        icon: Radio,
        tags: ["5G/6G", "VLSI Design", "IoT", "Embedded"]
    },
    {
        title: "Mechanical, Robotics & Automation",
        description: "Mechatronics, thermal dynamics, CAD/CAM, additive manufacturing, autonomous robotics, aerospace systems.",
        icon: Cog,
        tags: ["Robotics", "CAD/CAM", "Mechatronics", "Aerospace"]
    },
    {
        title: "Civil & Environmental Engineering",
        description: "Smart infrastructure, structural engineering, geotechnical analysis, sustainable materials, environmental tech.",
        icon: Building2,
        tags: ["Smart Cities", "Structures", "Green Materials"]
    },
    {
        title: "Electrical Power & Clean Energy",
        description: "Smart grids, photovoltaic systems, wind turbines, energy storage, power electronics, electric vehicles.",
        icon: Zap,
        tags: ["Smart Grids", "Solar/Wind", "EV Tech", "Batteries"]
    },
    {
        title: "Biomedical & Health Informatics",
        description: "Bio-signals, medical device hardware, bioinformatics, neural engineering, clinical data systems.",
        icon: Activity,
        tags: ["Bio-Sensors", "Health AI", "Medical Devices"]
    },
    {
        title: "Interdisciplinary Engineering",
        description: "Nanotechnology, applied physics, materials science, industrial engineering, mathematical modeling.",
        icon: Layers,
        tags: ["Nanotech", "Materials", "Applied Math"]
    }
];

function DisciplineTaxonomyGrid() {
    return (
        <section className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 2xl:p-8 shadow-2xs relative overflow-hidden space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/50 pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary/5 rounded-lg text-primary">
                            <Layers className="w-4 h-4 text-secondary" />
                        </span>
                        <span className="text-label text-secondary">Multidisciplinary Engineering Scope</span>
                    </div>
                    <h2 className="m-0">
                        Explore Research Disciplines
                    </h2>
                    <p className="text-muted-foreground m-0">
                        IJITEST invites original high-impact research, surveys, and technical briefs across all major engineering tracks.
                    </p>
                </div>

                <Link
                    href="/submit"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-primary transition-colors shrink-0"
                >
                    <span>Submit to Track</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {DISCIPLINES.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.title}
                            className="p-4 rounded-xl bg-muted/25 border border-border/60 hover:border-primary/30 hover:bg-muted/40 transition-all duration-200 flex flex-col justify-between group shadow-2xs"
                        >
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <div className="w-8 h-8 rounded-lg bg-primary/5 group-hover:bg-primary group-hover:text-white text-primary flex items-center justify-center transition-colors duration-200">
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-[10px] font-mono text-muted-foreground/60 group-hover:text-secondary transition-colors font-semibold">
                                        Track {idx + 1}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <h4 className="m-0 group-hover:text-secondary transition-colors leading-snug">
                                        {item.title}
                                    </h4>
                                    <p className="text-muted-foreground text-xs leading-relaxed m-0 line-clamp-2">
                                        {item.description}
                                    </p>
                                </div>
                            </div>

                            {/* Tags list */}
                            <div className="pt-3 mt-3 border-t border-border/40 flex flex-wrap gap-1">
                                {item.tags.map((t) => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-muted/60 text-[10px] font-medium text-foreground/70 group-hover:text-primary transition-colors">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(DisciplineTaxonomyGrid);

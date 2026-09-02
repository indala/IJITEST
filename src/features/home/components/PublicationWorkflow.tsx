'use client';

import { memo } from 'react';
import { 
    SendHorizontal, 
    SearchCheck, 
    FileSignature, 
    Sparkles, 
    Globe2, 
    Clock, 
    ShieldCheck, 
    ArrowRight 
} from 'lucide-react';
import Link from 'next/link';

interface WorkflowStep {
    number: string;
    title: string;
    timeframe: string;
    description: string;
    icon: typeof SendHorizontal;
    highlight?: boolean;
}

const WORKFLOW_STEPS: WorkflowStep[] = [
    {
        number: "01",
        title: "Manuscript Submission",
        timeframe: "Day 1",
        description: "Author submits DOCX manuscript through the real-time online submission portal. Immediate tracking ID issued.",
        icon: SendHorizontal
    },
    {
        number: "02",
        title: "Editorial Screening",
        timeframe: "24–48 Hours",
        description: "Desk screening for scope alignment, plagiarism verification (<15% similarity), and formatting compliance.",
        icon: ShieldCheck
    },
    {
        number: "03",
        title: "Double-Blind Peer Review",
        timeframe: "2–3 Weeks",
        description: "Two independent domain experts evaluate originality, methodology, clarity, and scientific contribution.",
        icon: SearchCheck,
        highlight: true
    },
    {
        number: "04",
        title: "Editorial Decision & Revisions",
        timeframe: "3–5 Days",
        description: "Formal decision notification with synthesized reviewer feedback. Authors submit revisions if requested.",
        icon: FileSignature
    },
    {
        number: "05",
        title: "Production, DOI & Archiving",
        timeframe: "Immediate",
        description: "Galley proof generation, permanent DOI assignment (DataCite / Crossref), and global digital repository indexing.",
        icon: Globe2
    }
];

function PublicationWorkflow() {
    return (
        <section className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 2xl:p-8 shadow-2xs relative overflow-hidden space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-5">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary/5 rounded-lg text-primary">
                            <Sparkles className="w-4 h-4 text-secondary" />
                        </span>
                        <span className="text-label text-secondary">Transparent Editorial Standards</span>
                    </div>
                    <h2 className="m-0">
                        Rapid & Rigorous Publication Workflow
                    </h2>
                    <p className="text-muted-foreground m-0">
                        From initial submission to worldwide indexing, our streamlined double-blind peer review guarantees academic rigor with rapid turnarounds.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-semibold">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Average Review: 14–21 Days</span>
                    </div>
                    <Link
                        href="/peer-review"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary transition-colors"
                    >
                        <span>Full Policy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Workflow Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 sm:gap-4 relative">
                {WORKFLOW_STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.number}
                            className={`p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between group relative ${
                                step.highlight
                                    ? 'bg-primary/5 border-primary/20 shadow-xs'
                                    : 'bg-muted/30 hover:bg-muted/50 border-border/60 hover:border-primary/20'
                            }`}
                        >
                            <div className="space-y-3">
                                {/* Top Badge Row */}
                                <div className="flex items-center justify-between">
                                    <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                                        step.highlight
                                            ? 'bg-primary text-white'
                                            : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'
                                    }`}>
                                        {step.number}
                                    </span>
                                    <span className="text-[10px] font-semibold text-secondary flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {step.timeframe}
                                    </span>
                                </div>

                                {/* Icon & Title */}
                                <div className="space-y-1.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        step.highlight
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-card text-primary/70 group-hover:text-primary border border-border/50'
                                    }`}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="m-0 leading-snug group-hover:text-secondary transition-colors">
                                        {step.title}
                                    </h4>
                                </div>

                                <p className="text-muted-foreground text-xs leading-relaxed m-0">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(PublicationWorkflow);

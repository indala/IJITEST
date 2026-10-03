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
        description: "Authors submit a complete manuscript and receive a structured tracking ID with transparent submission status updates.",
        icon: SendHorizontal
    },
    {
        number: "02",
        title: "Editorial Screening",
        timeframe: "24–48 Hours",
        description: "Each submission is checked for scope, originality, plagiarism safeguards, and formatting compliance before review.",
        icon: ShieldCheck
    },
    {
        number: "03",
        title: "Double-Blind Peer Review",
        timeframe: "2–3 Weeks",
        description: "Two independent experts assess originality, methodology, clarity, and contribution using our transparent review process.",
        icon: SearchCheck,
        highlight: true
    },
    {
        number: "04",
        title: "Decision & Revision",
        timeframe: "3–5 Days",
        description: "Editorial decisions are communicated clearly with constructive reviewer feedback and a defined revision pathway.",
        icon: FileSignature
    },
    {
        number: "05",
        title: "Production, DOI & Archiving",
        timeframe: "Immediate",
        description: "Accepted work is prepared for publication, assigned a DOI, and preserved for long-term digital access and indexing.",
        icon: Globe2
    }
];

const TRUST_SIGNALS = [
    'Double-blind peer review',
    'Ethics-led editorial checks',
    'Indexed, citable DOI workflow',
    'Open-access publication model'
];

function PublicationWorkflow() {
    return (
        <section className="bg-card border border-border/70 rounded-2xl p-5 sm:p-7 2xl:p-8 shadow-2xs relative overflow-hidden space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-5">
                <div className="space-y-1.5 max-w-2xl">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-primary/5 rounded-lg text-primary">
                            <Sparkles className="w-4 h-4 text-secondary" />
                        </span>
                        <span className="text-label text-secondary">Trust, Integrity & Editorial Transparency</span>
                    </div>
                    <h2 className="m-0">
                        A Clear Publication Workflow Built on Trust
                    </h2>
                    <p className="text-muted-foreground m-0">
                        Every manuscript follows a documented, ethical, and transparent process designed to protect author quality, reviewer independence, and reader confidence.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap justify-end">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary/10 border border-secondary/20 rounded-lg text-secondary text-body-sm font-semibold">
                        <Clock className="w-3.5 h-3.5 text-secondary" />
                        <span>Average Review: 14–21 Days</span>
                    </div>
                    <Link
                        href="/peer-review"
                        className="inline-flex items-center gap-1 text-body-sm font-bold text-primary hover:text-secondary transition-colors"
                    >
                        <span>Full Policy</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {TRUST_SIGNALS.map((signal) => (
                    <span
                        key={signal}
                        className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1.5 text-caption font-medium text-primary"
                    >
                        {signal}
                    </span>
                ))}
            </div>

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
                            } `}
                        >
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className={`font-mono font-bold text-meta px-2 py-0.5 rounded ${
                                        step.highlight
                                            ? 'bg-primary text-white'
                                            : 'bg-muted/80 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors'
                                    } `}>
                                        {step.number}
                                    </span>
                                    <span className="text-body-sm font-semibold text-secondary flex items-center gap-1">
                                        <Clock className="w-2.5 h-2.5" />
                                        {step.timeframe}
                                    </span>
                                </div>

                                <div className="space-y-1.5">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                                        step.highlight
                                            ? 'bg-primary/10 text-primary'
                                            : 'bg-card text-primary/70 group-hover:text-primary border border-border/50'
                                    } `}>
                                        <Icon className="w-4 h-4" />
                                    </div>
                                    <h4 className="m-0 leading-snug group-hover:text-secondary transition-colors">
                                        {step.title}
                                    </h4>
                                </div>

                                <p className="text-muted-foreground text-caption leading-relaxed m-0">
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

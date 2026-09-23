'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChevronRight, HelpCircle, CheckCircle2, FilePlus, RefreshCw, Award } from 'lucide-react';
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import RevisedSubmissionForm from '@/features/submissions/components/RevisedSubmissionForm';
import FinalSubmissionForm from '@/features/submissions/components/FinalSubmissionForm';
import TrackManuscriptWidget from '@/features/tracking/components/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import type { Section } from "@/db/models";

export type SubmissionType = 'new' | 'revised' | 'final';

const REQUIREMENTS = [
    { title: "Formatting", desc: "Manuscripts must follow the IEEE standard format." },
    { title: "Originality", desc: "Submissions must be original and not published elsewhere." },
    { title: "Ethics", desc: "Full adherence to COPE ethical standards is mandatory." },
    { title: "Copyright", desc: "A signed copyright transfer form is required upon acceptance." }
];

const SUBMISSION_MODES: {
    id: SubmissionType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}[] = [
    {
        id: 'new',
        label: 'New Submission',
        icon: FilePlus,
        title: 'Submit Research Manuscript',
        description: 'Fill in the manuscript details below to submit your research for double-blind peer review.'
    },
    {
        id: 'revised',
        label: 'Revised Submission',
        icon: RefreshCw,
        title: 'Submit Revised Manuscript',
        description: 'Upload your revised research paper and point-by-point response to reviewer comments.'
    },
    {
        id: 'final',
        label: 'Final Submission',
        icon: Award,
        title: 'Final Camera-Ready Submission',
        description: 'Submit your camera-ready manuscript, signed copyright agreement, and fee confirmation.'
    }
];

interface SubmitClientProps {
    initialSections?: Section[] | undefined;
}

function SubmitClientContent({ initialSections }: SubmitClientProps) {
    const searchParams = useSearchParams();
    const router = useRouter();

    const typeParam = searchParams.get('type') as SubmissionType | null;
    const initialType: SubmissionType = (typeParam && ['new', 'revised', 'final'].includes(typeParam))
        ? typeParam
        : 'new';

    const [activeType, setActiveType] = useState<SubmissionType>(initialType);

    useEffect(() => {
        if (typeParam && ['new', 'revised', 'final'].includes(typeParam)) {
            setActiveType(typeParam);
        }
    }, [typeParam]);

    const handleTypeChange = (newType: SubmissionType) => {
        setActiveType(newType);
        const params = new URLSearchParams(searchParams.toString());
        params.set('type', newType);
        router.replace(`/submit?${params.toString()}`, { scroll: false });
    };

    const currentMode = SUBMISSION_MODES.find(m => m.id === activeType) || SUBMISSION_MODES[0]!;

    return (
        <section className="container-responsive section-vertical">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 2xl:gap-12 items-start">
                {/* Main Submission Area */}
                <div className="lg:col-span-2 space-y-6 2xl:space-y-8">
                    {/* Submission Type Segmented Selector */}
                    <div className="bg-card border border-border/70 rounded-xl p-2 shadow-2xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                            {SUBMISSION_MODES.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = activeType === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        onClick={() => handleTypeChange(mode.id)}
                                        className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-label font-bold transition-all cursor-pointer ${
                                            isActive
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-primary'}`} />
                                        <span>{mode.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Form Card */}
                    <section className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-primary p-4 sm:p-6 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-1.5">
                                <h2 className="m-0 text-white">{currentMode.title}</h2>
                                <p className="text-white/70 m-0 border-l-2 border-white/30 pl-3.5">
                                    {currentMode.description}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6">
                            {activeType === 'new' && (
                                <SubmissionForm initialSections={initialSections} />
                            )}
                            {activeType === 'revised' && (
                                <RevisedSubmissionForm />
                            )}
                            {activeType === 'final' && (
                                <FinalSubmissionForm />
                            )}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                        <TrackManuscriptWidget />
                    </div>

                    <div className="p-4 bg-card border border-border/70 rounded-xl shadow-2xs space-y-3">
                        <h3 className="m-0">Submission Checklist</h3>
                        <div className="space-y-2.5">
                            {REQUIREMENTS.map((item, idx) => (
                                <div key={idx} className="flex gap-2.5 items-start">
                                    <div className="w-4 h-4 rounded-md bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="text-primary m-0">{item.title}</h4>
                                        <p className="text-muted-foreground m-0 leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button asChild size="sm" className="btn-primary w-full h-8 text-label uppercase tracking-wider rounded-lg shadow-xs transition-all">
                            <Link href="/guidelines">View Author Guidelines</Link>
                        </Button>
                    </div>

                    <div className="p-4 bg-primary rounded-xl shadow-md text-white space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <h3 className="m-0 text-white">Need Support?</h3>
                        </div>
                        <p className="text-white/70 leading-relaxed m-0">
                            Encountering technical issues? Our editorial desk is available to assist you.
                        </p>
                        <Link href="/contact" className="text-caption font-bold text-rose-300 hover:text-white inline-flex items-center gap-1 m-0 transition-colors pt-1">
                            <span>Contact Support</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </aside>
            </div>
        </section>
    );
}

export default function SubmitClient({ initialSections }: SubmitClientProps) {
    return (
        <Suspense fallback={
            <div className="container-responsive py-12 text-center text-muted-foreground text-caption">
                Loading submission portal…
            </div>
        }>
            <SubmitClientContent initialSections={initialSections} />
        </Suspense>
    );
}

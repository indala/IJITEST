'use client'

import { Search, Loader2, CheckCircle2, ShieldAlert, FileText, Calendar, CreditCard, ArrowRight, User } from 'lucide-react';
import { useState, useEffect, useRef, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { useSettingsContext } from '@/components/providers/SettingsContext';
import { trackManuscript } from '@/actions/track';
import { type ActionResponse, type TrackedManuscript, type Submission, type User as DBUser } from "@/db/types";

import type { LucideIcon } from 'lucide-react';
 
interface MilestoneProps {
    title: string;
    date?: string;
    description: string;
    icon: LucideIcon;
    active: boolean;
    last?: boolean;
}
 
function Milestone({ title, date, description, icon: Icon, active, last }: MilestoneProps) {
    return (
        <div className="flex gap-4 relative items-start group/milestone">
            {!last && (
                <div className="absolute left-5 2xl:left-6 top-10 2xl:top-12 bottom-0 w-px bg-border/50" />
            )}

            <div className={`relative z-10 w-10 h-10 2xl:w-12 2xl:h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${active
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 animate-pulse-slow'
                : 'bg-muted/20 text-muted-foreground border-border/50 group-hover/milestone:border-muted-foreground/30'
                }`}>
                <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-500 group-hover/milestone:scale-110" />
            </div>

            <div className="pb-8 pt-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className={`text-sm 2xl:text-base font-semibold m-0 transition-colors duration-300 ${active ? 'text-primary' : 'text-muted-foreground/50 group-hover/milestone:text-muted-foreground/80'}`}>{title}</h3>
                    {date && (
                        <span className="text-xs sm:text-sm 2xl:text-base text-muted-foreground bg-muted/50 px-2 py-0.5 2xl:px-3 2xl:py-1 rounded border border-border/50 font-mono transition-colors duration-300 group-hover/milestone:border-muted-foreground/20">
                            {new Date(date).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <p className={`text-sm 2xl:text-base leading-relaxed transition-colors duration-300 ${active ? 'text-muted-foreground' : 'text-muted-foreground/30 group-hover/milestone:text-muted-foreground/50'}`}>{description}</p>
            </div>
        </div>
    );
}

function TrackButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-12 2xl:h-14 bg-[#000066] hover:bg-[#000088] text-white rounded-xl shadow-sm transition-all active:scale-[0.99] hover:shadow-md hover:-translate-y-0.5 cursor-pointer font-bold text-sm 2xl:text-base tracking-wider uppercase duration-300"
        >
            {pending ? (
                <div className="flex items-center gap-3">
                    Searching <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    Track Manuscript <ArrowRight className="w-4 h-4" />
                </div>
            )}
        </Button>
    );
}

export default function TrackClient() {
    const settings = useSettingsContext();
    const searchParams = useSearchParams();
    const [paperIdInput, setPaperIdInput] = useState<Submission['paperId']>(searchParams.get('id') || '');
    const [emailInput, setEmailInput] = useState<DBUser['email']>('');

    const [localState, setLocalState] = useState<ActionResponse<{ manuscript: TrackedManuscript }> | null>(null);

    const [, formAction] = useActionState(
        async (
            _prevState: ActionResponse<{ manuscript: TrackedManuscript }> | null,
            formData: FormData
        ): Promise<ActionResponse<{ manuscript: TrackedManuscript }> | null> => {
            const paperId = formData.get('paperId') as string;
            const email = formData.get('email') as string;
            if (!paperId || !paperId.trim()) {
                const err: ActionResponse<{ manuscript: TrackedManuscript }> = { success: false, error: "Manuscript ID is required." };
                setLocalState(err);
                return err;
            }
            if (!email || !email.trim()) {
                const err: ActionResponse<{ manuscript: TrackedManuscript }> = { success: false, error: "Email Address is required." };
                setLocalState(err);
                return err;
            }
            setLocalState(null);
            const result = await trackManuscript(paperId.trim(), email.trim());
            setLocalState(result);
            return result;
        },
        null
    );

    const manuscript = localState?.success ? localState.data?.manuscript : null;
    const errorMessage = localState?.success ? null : localState?.error;
    const isSuccess = !!localState?.success;
    const isError = localState !== null && !localState.success;

    const resultsRef = useRef<HTMLDivElement>(null);
    const journalShortName = settings['journalShortName'] || '';

    useEffect(() => {
        if ((isSuccess || isError) && resultsRef.current) {
            const offset = 80;
            const elementPosition = resultsRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [isSuccess, isError]);

    const isStepActive = (step: 'submitted' | 'review' | 'decision') => {
        if (!manuscript) return false;
        const s = manuscript.status;
        if (step === 'submitted') return true;
        if (step === 'review') return ['underReview', 'revisionRequested', 'accepted', 'rejected', 'paymentPending', 'published'].includes(s);
        if (step === 'decision') return ['accepted', 'rejected', 'paymentPending', 'published'].includes(s);
        return false;
    };

    return (
        <section className="container-responsive py-6 sm:py-8">
            {/* Tracking Form */}
            <div className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs max-w-3xl mx-auto w-full group">
                <div className="bg-[#000066] p-4 sm:p-6 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4">
                        <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white border border-white/20 shrink-0">
                            <Search className="w-6 h-6" />
                        </div>
                        <div className="text-center sm:text-left space-y-0.5">
                            <h2 className="m-0 text-white">Track Manuscript Status</h2>
                            <p className="text-white/70 m-0 flex items-center justify-center sm:justify-start gap-1.5">
                                <ShieldAlert className="w-3.5 h-3.5 text-white/50" /> Secure Double-Blind Tracking
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-4 sm:p-6">
                    <form action={formAction} className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Manuscript ID</label>
                            <div className="relative">
                                <Input
                                    name="paperId"
                                    value={paperIdInput}
                                    onChange={(e) => {
                                        setPaperIdInput(e.target.value);
                                        setLocalState(null);
                                    }}
                                    required
                                    className="h-10 rounded-lg bg-muted/20 border-border/70 text-primary px-3 text-xs"
                                    placeholder={`${journalShortName}-2026-XXX`}
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                    <FileText className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-0.5">Corresponding Author Email</label>
                            <div className="relative">
                                <Input
                                    type="email"
                                    name="email"
                                    value={emailInput}
                                    onChange={(e) => {
                                        setEmailInput(e.target.value);
                                        setLocalState(null);
                                    }}
                                    required
                                    className="h-10 rounded-lg bg-muted/20 border-border/70 text-primary px-3 text-xs"
                                    placeholder="author@institution.edu"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40">
                                    <User className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                        <div className="sm:col-span-2 pt-2">
                            <TrackButton />
                            <p className="text-label text-muted-foreground text-center mt-3 m-0">
                                Real-Time Editorial Workflow Pipeline
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Results Section */}
            <div id="tracking-results" ref={resultsRef} className="mt-6 sm:mt-8 scroll-mt-24 max-w-3xl mx-auto w-full">
                {isSuccess && manuscript && (
                    <div className="space-y-6">
                        <div className="p-4 sm:p-6 bg-card border border-border/70 rounded-xl shadow-2xs relative overflow-hidden border-t-4 border-t-secondary">
                            <section className="mb-6 space-y-4 relative z-10">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-3">
                                        <Badge className="bg-primary/5 text-primary border-primary/20 px-4 h-8 2xl:h-9 2xl:px-5 2xl:text-base rounded-lg">
                                            Status: {manuscript.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                        </Badge>
                                        <span className="text-meta bg-muted/50 px-2.5 py-0.5 rounded border border-border/50">
                                            ID: {manuscript.paperId}
                                        </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" /> {manuscript.submittedAt ? new Date(manuscript.submittedAt).getFullYear() : 'N/A'}
                                    </div>
                                </div>

                                <h2 className="max-w-4xl border-l-3 border-secondary/30 pl-3.5 m-0">
                                    {manuscript.title}
                                </h2>

                                <div className="flex items-center gap-3 text-primary pt-1">
                                    <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                                        <User className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-label text-muted-foreground m-0">Corresponding Author</p>
                                        <p className="font-semibold text-foreground m-0">{manuscript.authorName}</p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 pt-4 border-t border-border/50 max-w-3xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <p className="text-label text-muted-foreground m-0">Manuscript Timeline</p>
                                </div>

                                <div className="space-y-3">
                                    <Milestone
                                        title="Manuscript Received"
                                        {...(manuscript.submittedAt ? { date: new Date(manuscript.submittedAt).toISOString() } : {})}
                                        description="Initial submission received and queued for editorial screening."
                                        icon={FileText}
                                        active={isStepActive('submitted')}
                                    />
                                    <Milestone
                                        title="Peer Review"
                                        {...(manuscript.reviewStartedAt ? { date: new Date(manuscript.reviewStartedAt).toISOString() } : {})}
                                        description="Assigned to experts for technical evaluation."
                                        icon={Search}
                                        active={isStepActive('review')}
                                    />
                                    <Milestone
                                        title="Editorial Decision"
                                        {...((manuscript.status !== 'underReview' && manuscript.status !== 'submitted' && manuscript.updatedAt) ? { date: new Date(manuscript.updatedAt).toISOString() } : {})}
                                        description={
                                            manuscript.status === 'accepted' ? "Accepted for publication in the upcoming volume." :
                                            manuscript.status === 'rejected' ? "Returned following scientific evaluation." :
                                            manuscript.status === 'published' ? "Published and indexed in digital archives." :
                                            "Awaiting final verification."
                                        }
                                        icon={ShieldAlert}
                                        active={isStepActive('decision')}
                                        last
                                    />
                                </div>
                            </section>

                            {/* Action Cards */}
                            <div className="mt-4 pt-4 border-t border-border/50">
                                {manuscript.status === 'accepted' && (
                                    <div className="bg-[#000066] p-4 sm:p-5 rounded-xl text-white relative overflow-hidden shadow-md">
                                        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
                                                        <CreditCard className="w-4 h-4" />
                                                    </div>
                                                    <h3 className="m-0 leading-none text-white">Access Fees Required</h3>
                                                </div>
                                                <p className="text-white/70 leading-relaxed max-w-2xl border-l-2 border-white/20 pl-3.5 m-0">
                                                    Your manuscript has been approved. Please finalize the Article Processing Charge (APC) to proceed with publication.
                                                </p>
                                            </div>
                                            <Button asChild size="sm" className="h-8 px-4 bg-white text-primary hover:bg-white/90 rounded-lg shadow-xs transition-all shrink-0 font-bold text-xs tracking-wider uppercase">
                                                <Link href={`/payment/${manuscript.paperId}`} className="flex items-center gap-1.5">
                                                    Process Payment <CreditCard className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                )}

                                {manuscript.status === 'published' && (
                                    <div className="bg-emerald-50 p-4 sm:p-5 rounded-xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4">
                                        <div className="space-y-1 text-center md:text-left">
                                            <div className="flex items-center justify-center md:justify-start gap-2.5">
                                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <h3 className="font-bold text-emerald-800 m-0">Fully Indexed</h3>
                                            </div>
                                            <p className="text-emerald-700/80 max-w-2xl m-0">
                                                Your research is now live in the global scientific archives.
                                            </p>
                                        </div>
                                        <Button asChild size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all shrink-0 font-bold text-xs tracking-wider uppercase">
                                            <Link href={`/archives`} className="flex items-center gap-1.5">
                                                View in Archive <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {manuscript.status === 'rejected' && (
                                    <div className="p-4 sm:p-5 bg-destructive/5 border border-destructive/10 rounded-xl space-y-3">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-destructive m-0">Editorial Decision</h3>
                                            <p className="text-muted-foreground max-w-3xl leading-relaxed m-0">
                                                The committee has concluded its review. While the current version does not meet publication criteria, please see the feedback below.
                                            </p>
                                        </div>
                                        {manuscript.reviewerFeedback && manuscript.reviewerFeedback.length > 0 && (
                                            <div className="grid grid-cols-1 gap-2.5">
                                                {manuscript.reviewerFeedback.filter((f): f is string => f !== null).map((feedback, i) => (
                                                    <div key={i} className="p-3.5 bg-card border border-border/50 rounded-lg text-xs sm:text-sm leading-relaxed flex gap-3">
                                                        <div className="w-1 h-auto bg-destructive/20 rounded-full shrink-0" />
                                                        <div className="italic">&quot;{feedback}&quot;</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {isError && (
                    <div className="p-12 sm:p-20 bg-card border border-border/50 rounded-xl text-center space-y-8 max-w-3xl mx-auto w-full shadow-sm">
                        <div className="w-16 h-16 bg-destructive/5 rounded-xl flex items-center justify-center mx-auto text-destructive border border-destructive/10">
                            <ShieldAlert className="w-8 h-8" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-semibold m-0">Access Denied</h2>
                            <p className="text-muted-foreground m-0">
                                Manuscript not found or credentials mismatched.
                            </p>
                            <p className="text-destructive/60 italic m-0">&quot;{errorMessage}&quot;</p>
                        </div>
                        <Button
                            onClick={() => setLocalState(null)}
                            className="h-12 px-10 bg-[#000066] hover:bg-[#000088] text-white rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 font-bold text-sm tracking-wider uppercase"
                        >
                            Try Again
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
}

'use client'

import { Search, Loader2, CheckCircle2, Clock, ShieldAlert, FileText, Calendar, CreditCard, ChevronRight, Check, ArrowRight, User } from 'lucide-react';
import { trackManuscript } from '@/actions/track';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

function Milestone({ title, date, description, icon: Icon, active, last }: { title: string, date?: string, description: string, icon: any, active: boolean, last?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-6 relative items-start"
        >
            {!last && (
                <div className="absolute left-6 top-12 bottom-0 w-[2px] bg-primary/5 -translate-x-1/2 overflow-hidden">
                    {active && <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className="w-full bg-secondary"
                    />}
                </div>
            )}

            <div className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-700 border-2 ${active
                ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20'
                : 'bg-white text-primary/30 border-primary/5'
                }`}>
                <Icon className={`w-5 h-5 ${active ? 'animate-pulse' : ''}`} />
                {active && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full border-2 border-primary flex items-center justify-center"
                    >
                        <Check className="w-3 h-3 text-white stroke-[4]" />
                    </motion.div>
                )}
            </div>

            <div className="pb-12 pt-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
                    <h3 className={`text-sm font-black tracking-tight uppercase ${active ? 'text-primary' : 'text-primary/30'}`}>{title}</h3>
                    {date && (
                        <Badge variant="secondary" className="text-[10px] font-black uppercase tracking-[0.2em] px-3 h-5 rounded-full bg-primary/5 text-primary/60 border-primary/10">
                            {new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </Badge>
                    )}
                </div>
                <p className={`text-[11px] font-medium leading-relaxed italic border-l-2 pl-4 ${active ? 'text-primary/60 border-secondary/50' : 'text-primary/20 border-primary/5'}`}>{description}</p>
            </div>
        </motion.div>
    );
}

export default function TrackClient() {
    const searchParams = useSearchParams();
    const [paperId, setPaperId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [manuscript, setManuscript] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');
    const resultsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            setPaperId(id);
        }
    }, [searchParams]);

    useEffect(() => {
        if ((status === 'success' || status === 'error') && resultsRef.current) {
            const offset = 80;
            const elementPosition = resultsRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }, [status]);

    async function handleTrack(e: React.FormEvent) {
        e.preventDefault();
        setStatus('loading');

        const result = await trackManuscript(paperId, email);

        if (result.success) {
            setManuscript(result.manuscript);
            setStatus('success');
        } else {
            setErrorMessage(result.error || 'An error occurred');
            setStatus('error');
        }
    }

    const isStepActive = (step: 'submitted' | 'review' | 'decision') => {
        if (!manuscript) return false;
        const s = manuscript.status;
        if (step === 'submitted') return true;
        if (step === 'review') return ['under_review', 'accepted', 'rejected', 'published'].includes(s);
        if (step === 'decision') return ['accepted', 'rejected', 'published'].includes(s);
        return false;
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
            {/* Tracking Form */}
            <Card className="border-primary/5 shadow-vip rounded-[3rem] mb-16 overflow-hidden bg-white group">
                <CardHeader className="p-10 pb-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center">
                            <Search className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black tracking-tighter italic">Search <span className="text-secondary not-italic">Database</span></CardTitle>
                            <CardDescription className="text-xs font-black uppercase tracking-[0.2em] text-primary/30">Enter your paper credentials</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em] ml-2">Paper ID</label>
                            <Input
                                value={paperId}
                                onChange={(e) => setPaperId(e.target.value)}
                                required
                                className="h-14 rounded-2xl bg-primary/5 border-primary/10 focus-visible:ring-primary font-bold text-primary shadow-inner px-6"
                                placeholder="IJITEST-2026-001"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[11px] font-black text-primary/40 uppercase tracking-[0.3em] ml-2">Author Email</label>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="h-14 rounded-2xl bg-primary/5 border-primary/10 focus-visible:ring-primary font-bold text-primary shadow-inner px-6"
                                placeholder="u.author@example.com"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4">
                            <Button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full h-16 bg-primary hover:bg-primary/90 text-white font-black text-sm uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                {status === 'loading' ? (
                                    <>Searching Archives... <Loader2 className="ml-3 w-5 h-5 animate-spin" /></>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Track My Manuscript <ArrowRight className="ml-2 w-5 h-5" />
                                    </div>
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div id="tracking-results" ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-8 duration-700 min-h-[50px]">
                <AnimatePresence mode="wait">
                    {status === 'success' && manuscript && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ type: 'spring', damping: 25 }}
                            className="space-y-8"
                        >
                            <Card className="border-primary/5 shadow-vip-hover rounded-[3rem] overflow-hidden relative bg-white group">
                                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                                    <FileText className="w-48 h-48 text-primary" />
                                </div>

                                <div className="p-8 md:p-12 border-b border-primary/5 bg-gradient-to-br from-primary/5 to-transparent">
                                    <div className="flex flex-wrap items-center gap-4 mb-6">
                                        <Badge className="bg-secondary text-white border-none text-[10px] font-black uppercase tracking-[0.3em] px-4 h-6 rounded-full shadow-lg shadow-secondary/20">
                                            Manuscript Verified
                                        </Badge>
                                        <span className="text-[11px] font-black text-primary/40 uppercase tracking-widest bg-white/50 px-3 py-1 rounded-lg border border-primary/5"># {manuscript.paper_id}</span>
                                    </div>
                                    <h2 className="text-2xl md:text-4xl font-black text-primary leading-tight tracking-tighter mb-8 italic">
                                        {manuscript.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-6 items-center">
                                        <div className="flex items-center gap-4 text-primary font-black uppercase tracking-widest text-[11px]">
                                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center border border-primary/5">
                                                <User className="w-5 h-5 text-secondary" />
                                            </div>
                                            {manuscript.author_name}
                                        </div>
                                        <Badge variant="outline" className="h-10 border-primary/10 text-primary uppercase text-[10px] font-black tracking-[0.2em] flex items-center gap-3 px-5 rounded-2xl bg-white shadow-sm italic">
                                            <div className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-glow" />
                                            {manuscript.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="p-8 md:p-12 bg-white">
                                    <h4 className="text-[11px] font-black text-primary/30 uppercase tracking-[0.4em] mb-12 flex items-center gap-4">
                                        <div className="w-8 h-[2px] bg-secondary" /> Publication Journey
                                    </h4>

                                    <div className="max-w-2xl px-2">
                                        <Milestone
                                            title="Manuscript Received"
                                            date={manuscript.submitted_at}
                                            description="Initial version captured and queued for mandatory editorial screening."
                                            icon={FileText}
                                            active={isStepActive('submitted')}
                                        />
                                        <Milestone
                                            title="Technical Evaluation"
                                            date={manuscript.review_started_at}
                                            description="Assigned to elite global domain experts for peer review process."
                                            icon={Search}
                                            active={isStepActive('review')}
                                        />
                                        <Milestone
                                            title="Final Decision"
                                            date={manuscript.status !== 'under_review' && manuscript.status !== 'submitted' ? manuscript.updated_at : undefined}
                                            description={
                                                manuscript.status === 'accepted' ? "Elite approval granted for publication and permanent hosting." :
                                                    manuscript.status === 'rejected' ? "Returned with critical reviewer feedback for improvement." :
                                                        "Awaiting final verification from the editorial board."
                                            }
                                            icon={ShieldAlert}
                                            active={isStepActive('decision')}
                                            last
                                        />
                                    </div>

                                    {/* Status Specific Actions */}
                                    <div className="mt-8">
                                        {manuscript.status === 'accepted' && (
                                            <Card className="bg-primary p-1 border-none rounded-[2.5rem] shadow-vip overflow-hidden group/pay">
                                                <div className="bg-white/10 backdrop-blur-md p-8 sm:p-10 rounded-[2.3rem] relative">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover/pay:scale-150 transition-transform duration-700" />
                                                    <div className="flex flex-col md:items-center justify-between gap-8 relative z-10">
                                                        <div className="text-center space-y-2">
                                                            <h3 className="text-2xl font-black text-white tracking-tighter italic">Final Step: <span className="text-secondary not-italic">APC Payment</span></h3>
                                                            <p className="text-sm text-white/60 font-medium italic max-w-md mx-auto">
                                                                "Your research is approved. Complete the hosting fee to finalize global indexing and DOI registry."
                                                            </p>
                                                        </div>
                                                        <Button asChild className="h-14 px-12 bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-secondary/20 transition-all hover:scale-105 active:scale-95">
                                                            <Link href={`/payment/${manuscript.paper_id}`} className="flex items-center gap-3">
                                                                Launch Payment Portal <CreditCard className="w-5 h-5" />
                                                            </Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}

                                        {manuscript.status === 'rejected' && (
                                            <Card className="bg-white border-2 border-destructive/10 p-8 md:p-10 rounded-[2.5rem] shadow-sm italic">
                                                <div className="flex items-start gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-destructive/5 flex items-center justify-center shrink-0 border border-destructive/10">
                                                        <ShieldAlert className="w-8 h-8 text-destructive" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-xl font-black text-primary tracking-tighter mb-2">Editorial Feedback</h4>
                                                        <p className="text-sm text-primary/40 font-medium mb-8">The board has reached a decision. Use the following feedback for revision.</p>

                                                        {manuscript.reviewer_feedback && manuscript.reviewer_feedback.length > 0 && (
                                                            <div className="space-y-4">
                                                                {manuscript.reviewer_feedback.map((feedback: string, i: number) => (
                                                                    <div key={i} className="bg-primary/5 p-6 rounded-2xl border border-primary/5 text-sm text-primary/60 leading-relaxed relative overflow-hidden group/feedback">
                                                                        <div className="absolute top-0 left-0 w-1 h-full bg-destructive/30" />
                                                                        "{feedback}"
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {status === 'error' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="bg-white border border-primary/5 p-12 rounded-[3.5rem] shadow-vip flex flex-col items-center text-center max-w-2xl mx-auto group">
                            <div className="w-20 h-20 bg-destructive/5 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-destructive group-hover:text-white transition-all duration-500">
                                <ShieldAlert className="w-10 h-10 text-destructive group-hover:text-white" />
                            </div>
                            <h3 className="text-2xl font-black text-primary tracking-tighter mb-2 italic">Tracking <span className="text-destructive not-italic">Failed</span></h3>
                            <p className="text-sm text-primary/40 font-medium max-w-sm mb-10 italic">"{errorMessage}"</p>
                            <Button
                                onClick={() => setStatus('idle')}
                                className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg transition-all"
                            >
                                Force Restart Search
                            </Button>
                        </Card>
                    </motion.div>
                )}
            </div>
        </div>
    );
}

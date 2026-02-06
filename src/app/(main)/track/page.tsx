"use client";

import { Search, Loader2, CheckCircle2, Clock, ShieldAlert, FileText, Calendar, CreditCard, ChevronRight, Check } from 'lucide-react';
import { trackManuscript } from '@/actions/track';
import { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

function Milestone({ title, date, description, icon: Icon, active, last }: { title: string, date?: string, description: string, icon: any, active: boolean, last?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex gap-8 relative items-start"
        >
            {!last && (
                <div className={`absolute left-7 top-14 bottom-0 w-1 ${active ? 'bg-primary' : 'bg-gray-100'} -translate-x-1/2 rounded-full overflow-hidden`}>
                    {active && <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="w-full bg-primary"
                    />}
                </div>
            )}

            <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-colors duration-500 ${active ? 'bg-primary text-white shadow-primary/20' : 'bg-white text-gray-300 border border-gray-100'
                }`}>
                <Icon className="w-6 h-6" />
                {active && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
                    >
                        <Check className="w-3 h-3 text-white stroke-[4]" />
                    </motion.div>
                )}
            </div>

            <div className="pb-16 pt-2">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className={`text-xl font-black font-serif ${active ? 'text-gray-900' : 'text-gray-400'}`}>{title}</h3>
                    {date && (
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded">
                            {new Date(date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </span>
                    )}
                </div>
                <p className={`font-medium ${active ? 'text-gray-500' : 'text-gray-300'}`}>{description}</p>
            </div>
        </motion.div>
    );
}

function TrackContent() {
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
            const offset = 100; // Header height offset
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
        <div className="min-h-screen bg-gray-50/30 py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-black text-gray-900 mb-4 tracking-tight uppercase">Track Manuscript</h1>
                    <p className="text-gray-500 font-medium text-lg">Check the real-time status of your submission.</p>
                </div>

                {/* Tracking Form */}
                <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 mb-12">
                    <form onSubmit={handleTrack} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Paper ID</label>
                            <input
                                value={paperId}
                                onChange={(e) => setPaperId(e.target.value)}
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-gray-900"
                                placeholder="IJITEST-2026-001"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1">Author Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold text-gray-900"
                                placeholder="u.author@example.com"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-primary text-white py-5 rounded-2xl flex items-center justify-center gap-4 text-xl font-black shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50"
                            >
                                {status === 'loading' ? (
                                    <>Searching Database <Loader2 className="w-6 h-6 animate-spin" /></>
                                ) : (
                                    <>Track My Paper <Search className="w-6 h-6" /></>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results Section */}
                <div id="tracking-results" ref={resultsRef} className="animate-in fade-in slide-in-from-bottom-8 duration-500 min-h-[50px]">
                    <AnimatePresence mode="wait">
                        {status === 'success' && manuscript && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8"></div>

                                <div className="p-10 md:p-14 border-b border-gray-50">
                                    <div className="flex items-center gap-3 mb-4">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-full">Manuscript Verified</span>
                                        <span className="text-[10px] font-mono text-gray-400"># {manuscript.paper_id}</span>
                                    </div>
                                    <h2 className="text-3xl font-serif font-black text-gray-900 leading-tight mb-4">
                                        {manuscript.title}
                                    </h2>
                                    <div className="flex flex-wrap gap-6 items-center">
                                        <div className="flex items-center gap-2 text-gray-500 font-bold">
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-gray-400" />
                                            </div>
                                            {manuscript.author_name}
                                        </div>
                                        <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest">
                                            <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                                            {manuscript.status.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-10 md:p-14 bg-gray-50/30">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
                                        <ChevronRight className="w-4 h-4 text-primary" /> Progress Timeline
                                    </h4>

                                    <div className="max-w-xl mx-auto md:mx-0">
                                        <Milestone
                                            title="Manuscript Submitted"
                                            date={manuscript.submitted_at}
                                            description="Initial version received and queued for editorial check."
                                            icon={FileText}
                                            active={isStepActive('submitted')}
                                        />
                                        <Milestone
                                            title="Peer Review Started"
                                            date={manuscript.review_started_at}
                                            description="Assigned to expert reviewers for technical evaluation."
                                            icon={Search}
                                            active={isStepActive('review')}
                                        />
                                        <Milestone
                                            title="Editorial Decision"
                                            date={manuscript.status !== 'under_review' && manuscript.status !== 'submitted' ? manuscript.updated_at : undefined}
                                            description={
                                                manuscript.status === 'accepted' ? "Approved for publication with positive feedback." :
                                                    manuscript.status === 'rejected' ? "Returned with reviewer feedback for improvement." :
                                                        "Waiting for final evaluation from the editorial board."
                                            }
                                            icon={ShieldAlert}
                                            active={isStepActive('decision')}
                                            last
                                        />
                                    </div>

                                    {/* Action Cards based on status */}
                                    <div className="mt-8">
                                        {manuscript.status === 'accepted' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-green-600 p-10 rounded-[2.5rem] text-white shadow-2xl shadow-green-600/20"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                                                        <CreditCard className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-2xl font-serif font-black mb-2">Final Step: APC Payment</h4>
                                                        <p className="text-green-50 font-medium mb-8 leading-relaxed max-w-md">Your manuscript is ready for publication. Please complete the Article Processing Charge to finalize the process.</p>
                                                        <Link
                                                            href={`/payment/${manuscript.paper_id}`}
                                                            className="bg-white text-green-700 px-8 py-4 rounded-xl font-black shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
                                                        >
                                                            Launch Payment Portal <ChevronRight className="w-5 h-5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {manuscript.status === 'rejected' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="bg-white p-10 rounded-[2.5rem] border-2 border-red-50"
                                            >
                                                <div className="flex items-start gap-6">
                                                    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center shrink-0">
                                                        <ShieldAlert className="w-8 h-8 text-red-500" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-2xl font-serif font-black text-gray-900 mb-2">Editorial Feedback</h4>
                                                        <p className="text-gray-500 font-medium mb-8 leading-relaxed">The editorial board has reached a decision. You can review the aggregated feedback below.</p>

                                                        {manuscript.reviewer_feedback && manuscript.reviewer_feedback.length > 0 && (
                                                            <div className="space-y-4">
                                                                {manuscript.reviewer_feedback.map((feedback: string, i: number) => (
                                                                    <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm text-gray-700 leading-relaxed italic">
                                                                        "{feedback}"
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {status === 'error' && (
                        <div className="bg-red-50 p-10 rounded-[2.5rem] border border-red-100 flex flex-col items-center text-center">
                            <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
                            <h3 className="text-xl font-black text-red-900 mb-2">Tracking Failed</h3>
                            <p className="text-red-600 font-medium max-w-sm">{errorMessage}</p>
                            <button
                                onClick={() => setStatus('idle')}
                                className="mt-8 text-red-900 font-black underline underline-offset-4 decoration-2"
                            >
                                Try again
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function TrackManuscript() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        }>
            <TrackContent />
        </Suspense>
    );
}

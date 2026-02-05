"use client";

import { Search, Loader2, CheckCircle2, Clock, ShieldAlert, FileText, Calendar, CreditCard } from 'lucide-react';
import { trackManuscript } from '@/actions/track';
import { useState } from 'react';
import Link from 'next/link';

export default function TrackManuscript() {
    const [paperId, setPaperId] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [manuscript, setManuscript] = useState<any>(null);
    const [errorMessage, setErrorMessage] = useState('');

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

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'submitted': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: <Clock className="w-6 h-6" /> };
            case 'under_review': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: <Search className="w-6 h-6" /> };
            case 'accepted': return { bg: 'bg-green-50', text: 'text-green-600', icon: <CheckCircle2 className="w-6 h-6" /> };
            case 'rejected': return { bg: 'bg-red-50', text: 'text-red-600', icon: <ShieldAlert className="w-6 h-6" /> };
            case 'published': return { bg: 'bg-primary/5', text: 'text-primary', icon: <FileText className="w-6 h-6" /> };
            default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: <Clock className="w-6 h-6" /> };
        }
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
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                    {status === 'success' && manuscript && (
                        <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-[5rem] -mr-8 -mt-8"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 relative">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-full">Manuscript Verified</span>
                                        <span className="text-[10px] font-mono text-gray-400"># {manuscript.paper_id}</span>
                                    </div>
                                    <h2 className="text-3xl font-serif font-black text-gray-900 leading-tight">
                                        {manuscript.title}
                                    </h2>
                                    <p className="text-gray-500 font-bold">Corresponding Author: {manuscript.author_name}</p>
                                </div>
                                <div className={`flex flex-col items-center justify-center p-8 rounded-[2rem] min-w-[180px] ${getStatusStyles(manuscript.status).bg} ${getStatusStyles(manuscript.status).text}`}>
                                    {getStatusStyles(manuscript.status).icon}
                                    <span className="text-sm font-black uppercase tracking-widest mt-2">{manuscript.status.replace('_', ' ')}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-50 pt-10">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Submission Timeline</h4>
                                    <div className="flex items-center gap-4 text-gray-700">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-400">Submitted On</p>
                                            <p className="font-black">{new Date(manuscript.submitted_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                        </div>
                                    </div>
                                </div>

                                {manuscript.status === 'accepted' && (
                                    <div className="bg-green-50/50 p-8 rounded-[2rem] border border-green-100/50">
                                        <h4 className="text-xs font-black text-green-700 uppercase tracking-widest mb-4">Required Action</h4>
                                        <p className="text-sm text-green-800 font-medium mb-6">Congratulations! Your manuscript has been approved for publication. Please complete the Article Processing Charge (APC) to proceed.</p>
                                        <Link
                                            href={`/payment/${manuscript.paper_id}`}
                                            className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20"
                                        >
                                            Proceed to Payment <CreditCard className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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

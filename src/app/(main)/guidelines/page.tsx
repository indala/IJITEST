"use client";

import { Download, FileText, CheckCircle, Search, ShieldAlert,ChevronRight, BookOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';


export default function AuthorGuidelines() {
    const [paperId, setPaperId] = useState('');
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (paperId.trim()) {
            router.push(`/track?id=${paperId}`);
        }
    };

    return (
        <div className="bg-white">
            <PageHeader
                title="Author Guidelines"
                description="Comprehensive instructions for preparing, submitting, and publishing your technical research with IJITEST."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Guidelines', href: '/guidelines' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-20">
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 italic">Manuscript Preparation</h2>
                            </div>

                            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
                                <p>Authors are requested to follow the standardized IJITEST formatting to ensure rapid processing and global indexing compatibility.</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
                                        <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-widest mb-4">Formatting Rules</h4>
                                        <ul className="text-sm space-y-4">
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <span>Font: Times New Roman Style</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <span>Size: 10pt Main / 9pt Abstract</span>
                                            </li>
                                            <li className="flex items-center gap-3">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                <span>Minimum Keywords: 04 Required</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="p-8 bg-primary text-white rounded-[2.5rem] shadow-xl shadow-primary/20 flex flex-col items-center text-center group">
                                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-12">
                                            <Download className="w-7 h-7" />
                                        </div>
                                        <h4 className="font-black text-xl mb-1 italic">Word Template</h4>
                                        <p className="text-[10px] opacity-70 uppercase font-bold tracking-widest mb-8">IEEE Standardized</p>
                                        <a href="/docs/template.docx" download className="w-full py-4 bg-white text-primary rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-lg shadow-black/10">
                                            Download DOCX
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="pt-12 border-t border-gray-100">
                            <h2 className="text-3xl font-serif font-black text-gray-900 mb-10 italic">Review & Publication</h2>
                            <div className="space-y-8 text-gray-600 font-medium">
                                <p>All submissions undergo a rigorous **Double-Blind Peer Review** process by at least two domain experts. Typical decision time is **3-5 working days** after submission.</p>
                                <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 space-y-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">Direct Submission Email</p>
                                            <p className="text-2xl font-black text-primary">editor@ijitest.org</p>
                                        </div>
                                        <a href="mailto:editor@ijitest.org" className="bg-white text-gray-900 border-2 border-gray-100 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm hover:border-primary hover:text-primary transition-all text-center">
                                            Send Manuscript
                                        </a>
                                    </div>
                                    <div className="pt-6 border-t border-gray-200/50">
                                        <p className="text-[10px] italic text-gray-400 leading-relaxed font-bold">
                                            * Please include your affiliation and a short abstract in the body of your initial email submission to expedite the screening phase.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-primary/5">
                            <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Track Your Paper</h3>
                            <form onSubmit={handleTrack} className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Manuscript ID</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. IJITEST-2026-101"
                                        value={paperId}
                                        onChange={(e) => setPaperId(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm font-bold outline-none"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                                    <Search className="w-4 h-4" /> Track Now
                                </button>
                            </form>
                        </div>

                        {/* Ethics Statements */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Statements</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE (Committee on Publication Ethics) guidelines for all research contributions.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Policy <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* APC Summary */}
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-xl font-serif font-black mb-6 italic">Quick APC</h3>
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-50 font-bold uppercase text-[9px] tracking-widest">India</span>
                                    <span className="font-black text-secondary">₹2,500</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-50 font-bold uppercase text-[9px] tracking-widest">Africa</span>
                                    <span className="font-black text-secondary">$55</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="opacity-50 font-bold uppercase text-[9px] tracking-widest">Global</span>
                                    <span className="font-black text-secondary">$65</span>
                                </div>
                            </div>
                            <p className="text-[9px] text-white/30 italic font-medium leading-relaxed">
                                * Fees include DOI assignment and lifetime archiving.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

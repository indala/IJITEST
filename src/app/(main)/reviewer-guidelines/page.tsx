"use client";

import { ShieldCheck, UserCheck, BookOpen, Search, ChevronRight, ShieldAlert, MessageCircle, Mail } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ReviewerGuidelines() {
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
                title="Reviewer Guidelines"
                description="Expert standards and ethical responsibilities for evaluating high-impact scientific research."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                Reviewers play a critical role in maintaining the academic integrity and quality of the research published in IJITEST. Their primary responsibility is to provide objective, critical, and constructive evaluation.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                            <h2 className="text-3xl font-serif font-black text-primary mb-10 italic">Evaluation Criteria</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { title: "Originality", desc: "Significant new research or innovative ideas" },
                                    { title: "Methodology", desc: "Design and methodology must be sound and appropriate" },
                                    { title: "Clarity", desc: "Well-written, concise, and easy to interpret" },
                                    { title: "Contribution", desc: "Provides high value to the scientific community" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 hover:border-primary transition-colors">
                                        <div className="p-3 bg-primary/5 rounded-xl text-primary">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-gray-900 uppercase text-[10px] tracking-widest mb-1">{item.title}</h4>
                                            <p className="text-sm font-medium text-gray-500 italic">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-serif font-black text-gray-900 mb-8 italic">Confidentiality</h2>
                            <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="flex flex-col md:flex-row gap-10 items-center">
                                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                                        <ShieldAlert className="w-10 h-10 text-secondary" />
                                    </div>
                                    <p className="text-lg text-white/70 font-medium leading-relaxed italic">
                                        Reviewers must treat manuscripts as **strictly confidential** documents. No part of the manuscript should be shared, discussed, or used for personal benefit before publication.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-primary p-12 rounded-[3.5rem] text-white">
                            <h3 className="text-3xl font-serif font-black mb-6 italic">Join our Reviewer Panel</h3>
                            <p className="text-lg mb-10 opacity-80 font-medium italic">Help us maintain global standards of scientific excellence.</p>
                            <div className="flex flex-col sm:flex-row gap-6">
                                <a href="mailto:editor@ijitest.org" className="bg-white text-primary px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-gray-50 transition-all">
                                    <Mail className="w-5 h-5" /> editor@ijitest.org
                                </a>
                                <a href="https://wa.me/918919643590" className="bg-emerald-500 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 transition-all">
                                    <MessageCircle className="w-5 h-5" /> WhatsApp Expert Line
                                </a>
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
                            <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Policy</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">Essential reading for all newly appointed reviewers.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Ethics <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Direct Support */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Editorial Support</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Have questions about a specific manuscript assignment?</p>
                            <Link href="/contact" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">Contact US</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client'
import { Globe, ShieldCheck, Database, Award, CheckCircle2, Search, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Indexing() {
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
                title="Indexing & Abstracting"
                description="Ensuring high visibility, global accessibility, and permanent digital archiving for all research published in IJITEST."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Indexing', href: '/indexing' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                IJITEST is committed to maximizing the reach and impact of your research. We ensure that every published article is easily discoverable through major academic engines and permanent digital repositories.
                            </p>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                <div className="p-4 bg-primary/5 rounded-2xl text-primary mb-6 group-hover:rotate-12 transition-transform">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Live Discovery</h3>
                                <p className="text-2xl font-serif font-black text-gray-900 italic mb-4">Applied & Verified</p>
                                <p className="text-sm font-medium text-gray-500 max-w-[240px]">We are actively indexing with Google Scholar, CrossRef, and OpenAIRE for immediate visibility.</p>
                            </div>

                            <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                <div className="p-4 bg-secondary/5 rounded-2xl text-secondary mb-6 group-hover:-rotate-12 transition-transform">
                                    <Database className="w-8 h-8" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Permanent ID</h3>
                                <p className="text-2xl font-serif font-black text-gray-900 italic mb-4">CrossRef DOI</p>
                                <p className="text-sm font-medium text-gray-500 max-w-[240px]">A unique digital identifier is assigned to every manuscript to ensure permanent citation tracking.</p>
                            </div>
                        </section>

                        <section className="bg-primary p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                                <div>
                                    <h2 className="text-3xl font-serif font-black mb-2 italic tracking-tight">Institutional Roadmaps</h2>
                                    <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Our Future Indexing Objectives</p>
                                </div>
                                <Globe className="w-12 h-12 text-white/20 hidden md:block" />
                            </div>

                            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                                {[
                                    { name: "Google Scholar", status: "Active Processing" },
                                    { name: "CrossRef", status: "Full Assignment" },
                                    { name: "ROAD Directory", status: "Verified Entry" },
                                    { name: "UGC CARE", status: "Upcoming Goal" },
                                    { name: "Scopus / WOS", status: "Strategic Target" },
                                    { name: "ResearchGate", status: "Auto-Integration" }
                                ].map((item, idx) => (
                                    <li key={idx} className="flex flex-col gap-2 p-6 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                                            <span className="font-serif font-black text-lg tracking-tight italic">{item.name}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.status}</span>
                                    </li>
                                ))}
                            </ul>
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

                        {/* Quick Guidelines */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Author Resources</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Download templates and read formatting rules to ensure acceptance.</p>
                            <Link href="/guidelines" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">View Guidelines</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

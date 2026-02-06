"use client";

import { GraduationCap, Mail, MapPin, Search, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const board = [
    {
        role: "Editor-in-Chief",
        members: [
            {
                name: "Dr. Ravibabu T.",
                designation: "Associate Professor, Dept. of ECE",
                affiliation: "MES Group of Institutions, Vizianagaram, AP, India",
                email: "editor@ijitest.org"
            }
        ]
    },
    {
        role: "Editorial Board Members",
        members: [
            {
                name: "Dr. Y. Prasanna Kumar",
                designation: "Professor of Mining Engineering",
                affiliation: "Papua New Guinea University of Technology, Papua New Guinea",
                email: "editor@ijitest.org"
            },
            {
                name: "Dr. Cheekatla Swapna Priya",
                designation: "Associate Professor, Dept. of CSE",
                affiliation: "Vignan's Institute of Information Technology (A), Visakhapatnam, AP, India",
                email: "editor@ijitest.org"
            },
            {
                name: "Dr. Mahendra Narla",
                designation: "Associate Professor, Dept. of AI",
                affiliation: "G. Pullaiah College of Engineering and Technology, Kurnool, India",
                email: "editor@ijitest.org"
            }
        ]
    }
];

export default function EditorialBoard() {
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
                title="Editorial Board"
                description="Our esteemed panel of global academic experts and researchers committed to scientific excellence."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Editorial Board', href: '/editorial-board' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-20">
                        {board.map((section, idx) => (
                            <section key={idx}>
                                <h2 className="text-3xl font-serif font-black text-gray-900 mb-12 italic border-b-2 border-primary/10 inline-block pb-2">
                                    {section.role}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {section.members.map((member, mIdx) => (
                                        <div key={mIdx} className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 hover:border-primary/20 transition-all hover:shadow-xl hover:shadow-primary/5 group">
                                            <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:bg-primary transition-colors">
                                                <GraduationCap className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{member.name}</h3>
                                            <p className="text-primary font-black text-[10px] uppercase tracking-widest mb-6">{member.designation}</p>
                                            <div className="space-y-4 text-sm text-gray-600 font-medium">
                                                <div className="flex items-start gap-3">
                                                    <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                                                    <span className="leading-relaxed">{member.affiliation}</span>
                                                </div>
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <Mail className="w-4 h-4 text-secondary flex-shrink-0" />
                                                    <span className="truncate md:whitespace-nowrap md:overflow-visible md:text-clip block break-all">{member.email}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}

                        <section className="bg-primary/5 p-12 rounded-[3.5rem] border border-primary/10 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h2 className="text-3xl font-serif font-black text-primary mb-6 italic">Technical Reviewers</h2>
                            <p className="text-lg text-gray-600 mb-10 font-medium italic italic">IJITEST is supported by a global network of more than 50 technical reviewers across diverse scientific disciplines.</p>

                            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm max-w-2xl mx-auto border border-gray-100">
                                <h3 className="text-xl font-serif font-black mb-4 italic">Join Our Editorial Team</h3>
                                <p className="text-gray-500 mb-8 text-sm font-medium">We seek esteemed experts to help maintain our high standards. Please mail your curriculum vitae to:</p>
                                <a href="mailto:editor@ijitest.org" className="text-secondary font-black text-2xl hover:underline">editor@ijitest.org</a>
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
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE guidelines to ensure scientific integrity.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Policy <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Quick Guidelines */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Call for Papers</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Submit your manuscript for our inaugural 2026 edition.</p>
                            <Link href="/submit" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">Submit Now</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

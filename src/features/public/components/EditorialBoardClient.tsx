'use client';

import { useState, useMemo } from 'react';
import { Mail, Search, Globe, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { staticEditorialBoardMembers, type BoardMember } from '../data/editorial-board';
import type { JournalSettings } from '@/db/protocols';

interface EditorialBoardClientProps {
    settings: JournalSettings;
}

export default function EditorialBoardClient({ settings }: EditorialBoardClientProps) {
    const supportEmail = settings.supportEmail || 'support@ijitest.org';
    const [searchQuery, setSearchQuery] = useState('');

    const membersToUse: BoardMember[] = staticEditorialBoardMembers;

    const editorInChief: BoardMember = useMemo(() => ({
        full_name: "Dr. Ravibabu T.",
        designation: "Associate Professor",
        department: "Department of Electronics and Communication Engineering",
        institute: "MES Group of Institutions",
        email: "editor@ijitest.org",
        secondaryEmail: "rthorlapati@miracleeducationalsociety.com",
        profileLink: "",
        officialAddress: "Vizianagaram, Andhra Pradesh, India - 530048",
        role: "admin"
    }), []);

    const boardReviewers = useMemo(() => {
        return membersToUse.filter((m) => m.email !== editorInChief.email && m.full_name !== editorInChief.full_name);
    }, [membersToUse, editorInChief]);

    const filteredReviewers = useMemo(() => {
        if (!searchQuery.trim()) return boardReviewers;
        const q = searchQuery.toLowerCase().trim();
        return boardReviewers.filter((m) => 
            Boolean(m.full_name?.toLowerCase().includes(q)) ||
            Boolean(m.department?.toLowerCase().includes(q)) ||
            Boolean(m.institute?.toLowerCase().includes(q)) ||
            Boolean(m.designation?.toLowerCase().includes(q)) ||
            Boolean(m.officialAddress?.toLowerCase().includes(q))
        );
    }, [boardReviewers, searchQuery]);

    return (
        <section className="space-y-6 max-w-full lg:max-w-6xl 2xl:max-w-7xl mx-auto pb-6">
            {/* Search Bar */}
            <div className="bg-card border border-border/70 rounded-xl p-3.5 sm:p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full">
                    <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder="Search by name, department, institute..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-muted/30 border border-border/70 text-body-sm focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                </div>
            </div>

            {/* 1. Editor-in-Chief Section */}
            {!searchQuery.trim() && (
                <section className="overflow-hidden rounded-xl border border-primary/20 shadow-xs bg-slate-200/60">
                    <div className="bg-primary p-3 px-5 sm:px-6 flex items-center justify-between">
                        <h2 className="text-white m-0">Editor-in-Chief</h2>
                    </div>

                    <div className="border-t border-primary/20">
                        <article className="group hover:bg-primary/5 transition-colors">
                            <header className="bg-muted/70 py-2 px-5 sm:px-6 border-b border-primary/10">
                                <h3 className="m-0 text-primary font-bold">
                                    {editorInChief.full_name}
                                </h3>
                            </header>

                            <div className="py-3.5 px-5 sm:px-6 space-y-2">
                                <div className="text-slate-700/90 space-y-0.5">
                                    <p className="leading-tight text-foreground font-semibold m-0">{editorInChief.designation}</p>
                                    <p className="leading-tight text-foreground m-0">{editorInChief.department}</p>
                                    <p className="leading-tight text-foreground font-medium m-0">{editorInChief.institute}</p>
                                    <p className="leading-tight text-muted-foreground m-0">{editorInChief.officialAddress}</p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-primary/15">
                                    {editorInChief.email && (
                                        <div className="flex items-center gap-1.5 text-body-sm text-primary">
                                            <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                            <a href={`mailto:${editorInChief.email}`} className="hover:text-primary hover:underline transition-colors font-semibold">
                                                {editorInChief.email}
                                            </a>
                                        </div>
                                    )}
                                    {editorInChief.secondaryEmail && (
                                        <div className="flex items-center gap-1.5 text-body-sm text-primary/60 border-l border-primary/20 pl-3">
                                            <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                            <a href={`mailto:${editorInChief.secondaryEmail}`} className="hover:text-primary hover:underline transition-colors font-medium">
                                                {editorInChief.secondaryEmail}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </article>
                    </div>
                </section>
            )}

            {/* 2. Editorial Board Members & Reviewers Section */}
            <section className="overflow-hidden rounded-xl border border-primary/20 shadow-xs bg-slate-200/60">
                <div className="bg-primary p-3 px-5 sm:px-6 flex items-center justify-between">
                    <h2 className="text-white m-0">Editorial Board Members & Reviewers</h2>
                </div>

                <div className="divide-y divide-primary/20 border-t border-primary/20">
                    {filteredReviewers.length === 0 ? (
                        <div className="p-8 text-center bg-card text-muted-foreground">
                            <p className="m-0">No editorial board members found matching &quot;{searchQuery}&quot;</p>
                        </div>
                    ) : (
                        filteredReviewers.map((member: BoardMember, mIdx: number) => (
                            <article key={mIdx} className="group hover:bg-primary/5 transition-colors border-b border-primary/20 last:border-0">
                                <header className="bg-muted/70 py-1.5 px-5 sm:px-6 border-b border-primary/10">
                                    <h3 className="m-0 text-primary font-bold">
                                        {member.full_name}
                                    </h3>
                                </header>

                                <div className="py-3 px-5 sm:px-6 space-y-2">
                                    <div className="text-slate-700/90 space-y-0.5">
                                        <p className="leading-tight text-foreground font-semibold m-0">{member.designation}</p>
                                        <p className="leading-tight text-foreground m-0">{member.department}</p>
                                        <p className="leading-tight text-foreground font-medium m-0">{member.institute}</p>
                                        <p className="leading-tight text-muted-foreground m-0">{member.officialAddress}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary/15">
                                        {member.email && (
                                            <div className="flex items-center gap-1.5 text-body-sm text-primary">
                                                <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.email}`} className="hover:text-primary hover:underline transition-colors font-semibold">
                                                    {member.email}
                                                </a>
                                            </div>
                                        )}
                                        {member.secondaryEmail && (
                                            <div className="flex items-center gap-1.5 text-body-sm text-primary/60 border-l border-primary/20 pl-3">
                                                <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.secondaryEmail}`} className="hover:text-primary hover:underline transition-colors font-medium">
                                                    {member.secondaryEmail}
                                                </a>
                                            </div>
                                        )}
                                        {member.profileLink && (
                                            <div className="flex items-center gap-1.5 text-body-sm">
                                                <a
                                                    href={member.profileLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary/60 hover:text-primary flex items-center gap-1 transition-all group/link"
                                                >
                                                    <Globe className="w-3 h-3" />
                                                    Institutional Profile
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            {/* Bottom Support & Application Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <section className="bg-slate-200/80 rounded-xl p-4 sm:p-5 border border-primary/10 shadow-2xs space-y-2">
                    <h3 className="mb-2 m-0 text-primary font-bold">Editorial Headquarters</h3>
                    <div className="space-y-2 text-slate-700">
                        <p className="text-foreground whitespace-pre-line m-0">
                            Dr. Ravibabu T.<br />
                            Associate Professor<br />
                            Department of Electronics and Communication Engineering<br />
                            MES Group of Institutions, Vizianagaram,<br />
                            Andhra Pradesh, India - 530048
                        </p>
                        <div className="pt-2 flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary/40" />
                                <a href="mailto:editor@ijitest.org" className="text-primary font-semibold hover:underline">
                                    editor@ijitest.org
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary/40 opacity-50" />
                                <a href="mailto:rthorlapati@miracleeducationalsociety.com" className="text-primary/70 hover:underline">
                                    rthorlapati@miracleeducationalsociety.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary/5 rounded-xl p-4 sm:p-5 border border-primary/10 flex flex-col justify-between shadow-2xs space-y-3">
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-secondary" />
                            <h3 className="m-0 text-primary font-bold">Join Our Reviewer Network</h3>
                        </div>
                        <p className="text-muted-foreground m-0">
                            We invite experienced PhD holders, professors, and industry specialists to review manuscripts and shape journal excellence.
                        </p>
                    </div>
                    <div className="pt-2 flex items-center gap-3">
                        <Link
                            href="/join-us"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white font-bold text-body-sm hover:bg-primary/90 transition-all shadow-xs"
                        >
                            <span>Apply as Reviewer</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <a
                            href={`mailto:${supportEmail}`}
                            className="text-body-sm font-semibold text-primary hover:underline"
                        >
                            Email Inquiry
                        </a>
                    </div>
                </section>
            </div>
        </section>
    );
}

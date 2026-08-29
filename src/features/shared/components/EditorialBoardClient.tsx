'use client';

import { Mail } from 'lucide-react';
import { useMemo } from 'react';
// import { useEditorialBoard } from '@/hooks/queries/usePublic'; // TODO: enable when dynamic board members are ready
import { staticEditorialBoardMembers, type BoardMember } from '../data/editorial-board';
import type { SafeUserWithProfile, JournalSettings } from '@/db/types';

interface EditorialBoardClientProps {
    initialMembers: SafeUserWithProfile[];
    settings: JournalSettings;
}

export default function EditorialBoardClient({ initialMembers: _initialMembers, settings }: EditorialBoardClientProps) {
    // const { data: dynamicMembers = [], isLoading } = useEditorialBoard(initialMembers); // TODO: enable when dynamic board members are ready
    const supportEmail = settings.supportEmail || '';

    const groupedBoard = useMemo(() => {
        const board = [
            {
                role: "Editor-in-Chief",
                members: [
                    {
                        full_name: "Dr. Ravibabu T.",
                        designation: "Associate Professor",
                        department: "Department of Electronics and Communication Engineering",
                        institute: "MES Group of Institutions",
                        email: "editor@ijitest.org",
                        secondaryEmail: "rthorlapati@miracleeducationalsociety.com",
                        profileLink: "",
                        officialAddress: "Vizianagaram, Andhra Pradesh, India - 530048",
                        role: "admin"
                    }
                ]
            },
            {
                role: "Editorial Board Members & Reviewers",
                members: staticEditorialBoardMembers
            },
        ];
        return board;
    }, []);

    return (
        <section className="space-y-6 max-w-full lg:max-w-6xl 2xl:max-w-7xl mx-auto pb-6">
            {groupedBoard.map((category, idx) => (
                <section key={idx} className="overflow-hidden rounded-xl border border-primary/20 shadow-xs bg-slate-200/60">
                    <div className="bg-[#000066] p-3 px-5 sm:px-6">
                        <h2 className="text-white m-0">
                            {category.role}
                        </h2>
                    </div>

                    <div className="divide-y divide-primary/20 border-t border-primary/20">
                        {category.members.map((member: BoardMember, mIdx: number) => (
                            <article key={mIdx} className="group hover:bg-primary/5 transition-colors border-b border-primary/20 last:border-0">
                                <header className="bg-muted/70 py-1.5 px-5 sm:px-6 border-b border-primary/10">
                                    <h3 className="m-0">
                                        {member.full_name}
                                    </h3>
                                </header>

                                <div className="py-3 px-5 sm:px-6 space-y-2">
                                    <div className="text-slate-700/90 space-y-0.5">
                                        <p className="leading-tight text-foreground m-0">{member.designation}</p>
                                        <p className="leading-tight text-foreground m-0">{member.department}</p>
                                        <p className="leading-tight text-foreground m-0">{member.institute}</p>
                                        <p className="leading-tight text-foreground m-0">{member.officialAddress}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-primary/15">
                                        {member.email && (
                                            <div className="flex items-center gap-1.5 text-xs text-primary">
                                                <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.email}`} className="hover:text-primary hover:underline transition-colors font-semibold">
                                                    {member.email}
                                                </a>
                                            </div>
                                        )}
                                        {member.secondaryEmail && (
                                            <div className="flex items-center gap-1.5 text-xs text-primary/60 border-l border-primary/20 pl-3">
                                                <Mail className="w-3.5 h-3.5 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.secondaryEmail}`} className="hover:text-primary hover:underline transition-colors font-medium">
                                                    {member.secondaryEmail}
                                                </a>
                                            </div>
                                        )}
                                        {member.profileLink && (
                                            <div className="flex items-center gap-1.5 text-xs">
                                                <a
                                                    href={member.profileLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary/60 hover:text-primary flex items-center gap-1 transition-all group/link"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/30 group-hover/link:bg-primary transition-colors" />
                                                    Institutional Profile
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            ))}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/50">
                <section className="bg-slate-200/80 rounded-xl p-4 sm:p-5 border border-primary/10 shadow-2xs">
                    <h3 className="mb-2 m-0">Editorial Headquarters</h3>
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
                                <a href="mailto:editor@ijitest.org" className="text-[#000066] font-semibold hover:underline">
                                    editor@ijitest.org
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary/40 opacity-50" />
                                <a href="mailto:rthorlapati@miracleeducationalsociety.com" className="text-[#000066]/70 hover:underline">
                                    rthorlapati@miracleeducationalsociety.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary/5 rounded-xl p-4 sm:p-5 border border-primary/10 flex flex-col justify-between shadow-2xs">
                    <div>
                        <h3 className="mb-1 m-0">Join Our Board</h3>
                        <p className="text-muted-foreground m-0">
                            We are constantly looking for experts to join our editorial and reviewer network. If you are interested in contributing, please reach out to our desk.
                        </p>
                    </div>
                    <div className="pt-3">
                        <a
                            href={`mailto:${supportEmail}`}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#000066] text-white font-bold text-xs hover:bg-[#000088] transition-all w-fit shadow-xs"
                        >
                            Contact Us
                        </a>
                    </div>
                </section>
            </div>
        </section>
    );
}

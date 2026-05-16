'use client';

import { Mail, Loader2 } from 'lucide-react';
import { useMemo } from 'react';
import { useEditorialBoard } from '@/hooks/queries/usePublic';
import { staticEditorialBoardMembers, type BoardMember } from '../data/editorial-board';
import { SafeUserWithProfile } from '@/db/types';

import { useSettingsStore } from '@/store/useSettingsStore';

interface EditorialBoardClientProps {
    initialMembers: SafeUserWithProfile[];
}

export default function EditorialBoardClient({ initialMembers }: EditorialBoardClientProps) {
    const { data: dynamicMembers = [], isLoading } = useEditorialBoard(initialMembers);
    const settings = useSettingsStore((state) => state.settings);
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
                role: "Editorial Board Members",
                members: staticEditorialBoardMembers
            },
        ];
        return board;
    }, []);

    if (isLoading && dynamicMembers.length === 0) {
        return (
            <div className="p-24 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary/10" />
            </div>
        );
    }

    return (
        <section className="space-y-12 max-w-full lg:max-w-6xl 2xl:max-w-7xl mx-auto pb-12">
            {groupedBoard.map((category, idx) => (
                <section key={idx} className="overflow-hidden rounded-xl border border-primary/20 shadow-md bg-slate-200/60">
                    <div className="bg-[#000066] p-4 px-6 xl:px-8">
                        <h2 className="text-white m-0 font-serif font-semibold text-lg xl:text-xl 2xl:text-3xl">
                            {category.role}
                        </h2>
                    </div>

                    <div className="divide-y divide-primary/20 border-t  border-primary/20">
                        {category.members.map((member: BoardMember, mIdx: number) => (
                            <article key={mIdx} className="group hover:bg-primary/5 transition-colors  border-b-2  border-primary/70 last:border-0">
                                <header className="bg-muted/70 py-2 px-6 xl:px-8 border-b border-primary/10">
                                    <h3 className="text-primary m-0 font-semibold text-sm xl:text-2xl 2xl:text-2xl">
                                        {member.full_name}
                                    </h3>
                                </header>

                                <div className="py-4   px-8 xl:px-12 space-y-3">
                                    <div className=" sm:items-baseline gap-x-3  text-slate-700/90">
                                        
                                            <p className="leading-tight  text-foreground text-sm xl:text-xl 2xl:text-2xl wrap-break-word">{member.designation}</p>
                                            <p className="leading-tight  text-foreground text-sm xl:text-xl 2xl:text-2xl wrap-break-word">{member.department}</p>
                                            <p className="leading-tight  text-foreground text-sm xl:text-xl 2xl:text-2xl wrap-break-word">{member.institute}</p>
                                            <p className="leading-tight  text-foreground text-sm xl:text-xl 2xl:text-2xl wrap-break-word">{member.officialAddress}</p>
                                    </div>

                                    

                                    <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-primary/20">
                                        {member.email && (
                                            <div className="flex items-center gap-2 text-sm xl:text-xl 2xl:text-2xl text-primary">
                                                <Mail className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.email}`} className="hover:text-primary hover:underline transition-colors ">
                                                    {member.email}
                                                </a>
                                            </div>
                                        )}
                                        {member.secondaryEmail && (
                                            <div className="flex items-center gap-2 text-sm xl:text-xl 2xl:text-2xl text-primary/60 border-l border-primary/20 pl-4">
                                                <Mail className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-primary/40 shrink-0" />
                                                <a href={`mailto:${member.secondaryEmail}`} className="hover:text-primary hover:underline transition-colors font-medium">
                                                    {member.secondaryEmail}
                                                </a>
                                            </div>
                                        )}
                                        {member.profileLink && (
                                            <div className="flex items-center gap-2 text-sm xl:text-xl 2xl:text-2xl">
                                                <a
                                                    href={member.profileLink}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary/60 hover:text-primary flex items-center gap-1.5 transition-all group/link"
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary/20 group-hover/link:bg-primary transition-colors" />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-12 border-t border-border/50">
                <section className="bg-slate-200/80 rounded-2xl p-8 xl:p-10 border border-primary/10 shadow-sm">
                    <h3 className="text-xl xl:text-2xl font-serif font-bold text-[#000066] mb-6">Editorial Headquarters</h3>
                    <div className="space-y-4 text-slate-700 text-sm xl:text-lg 2xl:text-xl">
                        <p className="text-foreground whitespace-pre-line">
                            Dr. Ravibabu T.<br />
                            Associate Professor<br />
                            Department of Electronics and Communication Engineering<br />
                            MES Group of Institutions, Vizianagaram,<br />
                            Andhra Pradesh, India - 530048
                        </p>
                        <div className="pt-4 flex flex-col gap-2">
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary/40" />
                                <a href="mailto:editor@ijitest.org" className="text-[#000066] font-semibold hover:underline">
                                    editor@ijitest.org
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary/40 opacity-50" />
                                <a href="mailto:rthorlapati@miracleeducationalsociety.com" className="text-[#000066]/70 text-sm 2xl:text-base hover:underline">
                                    rthorlapati@miracleeducationalsociety.com
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-primary/5 rounded-2xl p-8 xl:p-10 border border-primary/5 flex flex-col justify-center">
                    <h3 className="text-xl xl:text-2xl font-serif font-bold text-primary mb-2">Join Our Board</h3>
                    <p className="text-sm xl:text-lg 2xl:text-xl text-slate-700 mb-6">
                        We are constantly looking for experts to join our editorial team. If you are interested in contributing, please reach out to us.
                    </p>
                    <a
                        href={`mailto:${supportEmail}`}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[#000066] text-white font-semibold hover:bg-[#000066]/90 transition-all w-fit"
                    >
                        Contact Us
                    </a>
                </section>
            </div>
        </section>
    );
}

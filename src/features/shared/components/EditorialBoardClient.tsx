'use client'

import { GraduationCap, Mail, MapPin } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { motion } from 'framer-motion';

interface Member {
    name: string;
    designation: string;
    affiliation: string;
    email: string;
}

interface Section {
    role: string;
    members: Member[];
}

interface EditorialBoardClientProps {
    board: Section[];
}

export default function EditorialBoardClient({ board }: EditorialBoardClientProps) {
    return (
        <div className="lg:col-span-2 space-y-16">
            {board.map((section, idx) => (
                <motion.section
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                >
                    <h2 className="text-3xl font-black text-primary mb-8 tracking-tighter flex items-center gap-4">
                        <span className="w-1.5 h-10 bg-secondary rounded-full shadow-lg shadow-secondary/20" />
                        {section.role}
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {section.members.map((member, mIdx) => (
                            <div key={mIdx} className="group relative">
                                <div className="absolute -inset-2 bg-gradient-to-r from-primary/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                                <Card className="h-full bg-white border border-primary/5 shadow-vip hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-500 rounded-3xl overflow-hidden">
                                    <CardContent className="p-7">
                                        <div className="flex items-start gap-5">
                                            <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                <GraduationCap className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="space-y-3 min-w-0">
                                                <div>
                                                    <h3 className="text-lg font-black text-primary leading-tight tracking-tight group-hover:text-secondary transition-colors duration-500">{member.name}</h3>
                                                    <div className="inline-block px-3 py-1 bg-secondary/10 rounded-full mt-2">
                                                        <p className="text-secondary font-black text-[10px] uppercase tracking-[0.2em]">{member.designation}</p>
                                                    </div>
                                                </div>
                                                <div className="space-y-2 text-[13px] text-primary/60 font-medium leading-relaxed">
                                                    <div className="flex items-start gap-2">
                                                        <MapPin className="w-4 h-4 text-secondary/40 mt-1 shrink-0" />
                                                        <span className="leading-snug italic">{member.affiliation}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="w-4 h-4 text-secondary/40 shrink-0" />
                                                        <span className="truncate border-b border-primary/5 group-hover:border-secondary/20 transition-colors">{member.email}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>
                </motion.section>
            ))}

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-primary p-1 rounded-[3.5rem] shadow-vip"
            >
                <div className="bg-white/5 backdrop-blur-md p-10 sm:p-14 rounded-[3.3rem] text-center relative overflow-hidden text-white border border-white/10">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/20 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                        <h2 className="text-3xl sm:text-4xl font-sans font-black mb-6 tracking-tighter italic">Technical <span className="text-secondary not-italic">Reviewers</span></h2>
                        <p className="text-lg text-white/70 mb-10 font-medium leading-relaxed max-w-2xl mx-auto italic">
                            "IJITEST is supported by a elite global network of more than 50 technical reviewers across diverse scientific disciplines, ensuring peer-review excellence."
                        </p>

                        <div className="bg-white/10 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] border border-white/20 max-w-xl mx-auto shadow-2xl">
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight">Join Our Editorial Team</h3>
                            <p className="text-white/60 mb-8 text-sm font-medium">We seek world-class experts to help maintain our high standards. Please mail your CV to our editorial desk:</p>
                            <a href="mailto:editor@ijitest.org" className="group inline-flex flex-col items-center gap-2">
                                <span className="text-secondary font-black text-2xl sm:text-3xl tracking-tighter group-hover:scale-110 transition-transform">editor@ijitest.org</span>
                                <div className="h-[2px] w-12 bg-secondary group-hover:w-full transition-all" />
                            </a>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

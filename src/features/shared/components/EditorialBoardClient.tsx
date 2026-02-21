"use client";

import { motion } from 'framer-motion';
import { Mail, GraduationCap, MapPin, ExternalLink, UserPlus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface BoardCategory {
    role: string;
    members: Array<{
        name: string;
        designation: string;
        affiliation: string;
    }>;
}

const boardData: BoardCategory[] = [
    {
        role: "Editor-in-Chief",
        members: [
            {
                name: "Dr. Ravibabu T.",
                designation: "Associate Professor",
                affiliation: "Department of Electronics and Communication Engineering, MES Group of Institutions, Vizianagaram, Andhra Pradesh, India"
            }
        ]
    },
    {
        role: "Editorial Board Members & Reviewers",
        members: [
            {
                name: "Dr. Y. Prasanna Kumar",
                designation: "Professor of Mining Engineering",
                affiliation: "Papua New Guinea University of Technology, Papua New Guinea"
            },
            {
                name: "Dr. Cheekatla Swapna Priya",
                designation: "Associate Professor, Department of CSE",
                affiliation: "Vignan’s Institute of Information Technology (A), Visakhapatnam, AP, INDIA"
            },
            {
                name: "Dr. Mahendra Narla",
                designation: "Associate Professor, Department of Artificial Intelligence",
                affiliation: "G. Pullaiah College of Engineering and Technology, Kurnool, India"
            },
            {
                name: "Dr. VA Narayana",
                designation: "Associate Professor, Department of Electronics and Communication Engineering",
                affiliation: "GVP Engineering college, Visakhapatnam, India"
            },
            {
                name: "Dr. B. Somasekhar",
                designation: "Professor, Department of Electronics and Communication Engineering",
                affiliation: "ANITS Engineering college, Visakhapatnam, India"
            },
            {
                name: "Dr. R. Sridevi",
                designation: "Associate Professor, Department of Electronics and Communication Engineering",
                affiliation: "Sree Vahini Institute of Science & Technology (A), Nuzvidu, India"
            },
            {
                name: "Dr. D. Raveendra",
                designation: "Associate Professor, Department of Electrical Engineering",
                affiliation: "Motilal Nehru National Institute of Technology, Allahabad, India"
            },
            {
                name: "Dr. K. Srinivas",
                designation: "Associate Professor, Department of Electronics and Communication Engineering",
                affiliation: "GITAM (Deemed to be University), Visakhapatnam, India"
            },
            {
                name: "Dr. CH. Trinadha Rao",
                designation: "Associate Professor, Department of Master of Business Administration",
                affiliation: "MES Group of Institutions, Vizianagaram, Andhra Pradesh, India"
            }
        ]
    }
];

export default function EditorialBoardClient({ board }: { board: any[] }) {
    return (
        <div className="lg:col-span-2 space-y-16">
            {/* Join CTA */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="bg-primary rounded-3xl p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"
                />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="max-w-xl">
                        <h3 className="text-3xl md:text-4xl font-sans font-black mb-4 tracking-tighter drop-shadow-sm text-white">Join our Academic Network</h3>
                        <p className="text-white/90 font-medium leading-relaxed text-sm md:text-base border-l-4 border-secondary/80 pl-4">
                            Contribute your expertise to scientific excellence. We welcome Professors, Engineering Experts, and Researchers to join our global editorial board.
                        </p>
                    </div>
                    <div>
                        <Button asChild className="h-14 px-8 bg-secondary hover:bg-secondary/90 text-white rounded-2xl shadow-xl hover:-translate-y-1 transition-all duration-300 group shrink-0 relative overflow-hidden">
                            <a href="/join-us" className="flex items-center gap-3">
                                <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shine" />
                                <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform relative z-10" />
                                <span className="text-xs font-black uppercase tracking-widest relative z-10">Apply for Board</span>
                            </a>
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Board Members */}
            {boardData.map((category, idx) => (
                <div key={idx} className="space-y-10">
                    <div className="flex items-center gap-6">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-primary/10 to-transparent" />
                        <h2 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">{category.role}</h2>
                        <div className="h-0.5 w-12 bg-secondary" />
                    </div>

                    <motion.div
                        className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-5"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.15 } }
                        }}
                    >
                        {category.members.map((member, mIdx) => (
                            <motion.div
                                key={mIdx}
                                variants={{
                                    hidden: { opacity: 0, y: 30 },
                                    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
                                }}
                            >
                                <Card className="h-full bg-gradient-to-br from-white to-primary/[0.02] border border-primary/5 shadow-vip hover:shadow-vip-hover hover:border-primary/20 hover:-translate-y-2 transition-all duration-500 rounded-2xl sm:rounded-[1.5rem] group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/10 transition-colors duration-500 animate-blob pointer-events-none" />
                                    <CardContent className="p-4 sm:p-5 relative z-10 flex flex-col h-full justify-between">
                                        <div>
                                            <div className="flex flex-wrap items-start justify-between gap-3 mb-4 sm:mb-6">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500 shadow-inner animate-float-slow">
                                                    <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                                                </div>
                                            </div>

                                            <h4 className="text-base sm:text-xl font-black text-primary leading-tight mb-1.5 group-hover:text-secondary transition-colors duration-300">{member.name}</h4>
                                            <p className="text-[9px] sm:text-[10px] font-black text-primary/60 uppercase tracking-widest mb-3 sm:mb-4">{member.designation}</p>
                                        </div>

                                        <div className="flex gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t border-primary/5 mt-auto">
                                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-secondary shrink-0 mt-0.5 animate-bounce-slow" />
                                            <p className="text-[10px] sm:text-xs text-primary/80 font-medium leading-relaxed">
                                                {member.affiliation}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            ))}
        </div>
    );
}

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
        email?: string;
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
                affiliation: "Sree Vahini Institute of Science & Technology (A), Nuzvidu, India",
                email: "rsridevi@sreevahini.edu.in"
            },
            {
                name: "Dr. D. Raveendra",
                designation: "Associate Professor, Department of Electrical Engineering",
                affiliation: "Motilal Nehru National Institute of Technology, Allahabad, India",
                email: "raveendogga@mnnit.ac.in"
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
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <h3 className="text-2xl md:text-3xl font-black mb-4 tracking-tighter">Become an editorial member of IJITEST</h3>
                    <p className="text-slate-400 mb-8 max-w-xl font-medium leading-relaxed">
                        Join our global network of academic experts and contribute to scientific excelence. We welcome Professors, Engineering Experts, and Scientists.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Button asChild className="h-14 px-8 bg-secondary hover:bg-secondary/90 text-white rounded-2xl shadow-xl shadow-secondary/20 group">
                            <a href="mailto:support@ijitest.com" className="flex items-center gap-3">
                                <Mail className="w-5 h-5" />
                                <span className="text-xs font-black uppercase tracking-widest">Mail your CV</span>
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {category.members.map((member, mIdx) => (
                            <motion.div
                                key={mIdx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: mIdx * 0.1 }}
                            >
                                <Card className="h-full border border-slate-100 shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all duration-500 rounded-[2rem] group overflow-hidden">
                                    <CardContent className="p-8">
                                        <div className="flex items-start gap-4 mb-6">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                                                <GraduationCap className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-primary leading-tight mb-1">{member.name}</h4>
                                                <p className="text-xs font-bold text-secondary uppercase tracking-widest">{member.designation}</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex gap-3">
                                                <MapPin className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
                                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                    {member.affiliation}
                                                </p>
                                            </div>

                                            {member.email && (
                                                <div className="flex items-center gap-3 pt-2">
                                                    <Mail className="w-4 h-4 text-slate-300" />
                                                    <a href={`mailto:${member.email}`} className="text-sm font-bold text-primary hover:text-secondary transition-colors truncate">
                                                        {member.email}
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

'use client';

import { ShieldCheck, UserCheck, BookOpen, ChevronRight, ShieldAlert, MessageCircle, Mail } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ReviewerGuidelinesClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="relative">
                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-secondary via-primary to-transparent opacity-20 hidden md:block" />
                        <p className="text-xl md:text-2xl font-black leading-relaxed text-primary tracking-tight italic">
                            "Peer reviewers are the sovereign guardians of scientific integrity, orchestrating the rigorous validation of breakthrough engineering research."
                        </p>
                    </section>

                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.4em] bg-primary/5 text-primary px-4 h-7 rounded-full shadow-sm border border-primary/5 italic">Protocol Matrix</Badge>
                            <h2 className="text-3xl font-black text-primary tracking-tighter italic">Evaluation <span className="text-secondary not-italic">Directives</span></h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { title: "Originality", desc: "Significant empirical novelty or profound conceptual innovation." },
                                { title: "Methodology", desc: "Rigorous experimental design and validated analytical protocols." },
                                { title: "Clarity", desc: "Concise linguistic orchestration and precise data visualization." },
                                { title: "Contribution", desc: "High-impact advancement for the global scientific collective." }
                            ].map((item, i) => (
                                <Card key={i} className="bg-white border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[2rem] group overflow-hidden">
                                    <CardContent className="p-8 flex items-start gap-6">
                                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center shrink-0 text-primary border border-primary/5 shadow-inner group-hover:rotate-12 transition-transform">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-primary uppercase text-[10px] tracking-widest mb-2 italic">{item.title}</h4>
                                            <p className="text-[11px] font-medium text-primary/40 leading-relaxed italic">{item.desc}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    <Card className="bg-primary border-none shadow-vip rounded-[3rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                        <CardContent className="p-10 sm:p-14 flex flex-col md:flex-row gap-10 items-center relative z-10">
                            <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                <ShieldAlert className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-white tracking-tighter italic">Immutable <span className="text-secondary not-italic">Confidentiality</span></h3>
                                <p className="text-base text-white/50 font-medium italic leading-relaxed">
                                    "Reviewers are mandated to treat all manuscript assets as privileged intellectual property. Unauthorized dissemination is a strictly prohibited protocol violation."
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="bg-primary text-white p-12 sm:p-20 rounded-[4rem] shadow-vip-hover relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col items-center md:items-start space-y-10">
                            <div className="bg-white/10 p-5 rounded-3xl border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
                                <BookOpen className="w-12 h-12 text-secondary" />
                            </div>
                            <div className="space-y-4 text-center md:text-left">
                                <h3 className="text-4xl sm:text-5xl font-black tracking-tighter italic leading-none">Join the <span className="text-secondary not-italic">Elite</span> Panel</h3>
                                <p className="text-xl text-white/50 font-medium italic max-w-xl">
                                    "Ascend to the IJITEST reviewer collective and influence the trajectory of global scientific discourse."
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Button asChild className="h-14 px-10 bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-lg transition-all">
                                    <a href="mailto:editor@ijitest.org"><Mail className="w-4 h-4 mr-3" /> editor@ijitest.org</a>
                                </Button>
                                <Button asChild className="h-14 px-10 bg-secondary text-white hover:bg-secondary/90 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-lg border-none transition-all">
                                    <a href="https://wa.me/918919643590" className="flex items-center"><MessageCircle className="w-4 h-4 mr-3" /> WhatsApp Desk</a>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <TrackManuscriptWidget />

                    <Card className="bg-primary/5 border-primary/5 shadow-vip rounded-[2.5rem] group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-secondary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardContent className="p-8 relative z-10">
                            <ShieldAlert className="w-10 h-10 mb-6 text-secondary/40 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-black text-primary mb-2 tracking-tighter italic">Ethics <span className="text-secondary not-italic">Framework</span></h3>
                            <p className="text-[11px] text-primary/40 mb-8 font-black uppercase tracking-widest italic leading-relaxed">Essential Evaluator Policy</p>
                            <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-11 bg-primary hover:bg-primary/95 rounded-xl transition-all group/btn shadow-lg shadow-primary/20">
                                <Link href="/ethics" className="flex justify-between w-full px-6">
                                    <span>Read Policy</span>
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary border-none shadow-vip rounded-[2.5rem] overflow-hidden relative group">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-white tracking-tighter italic">Editorial <span className="text-secondary not-italic">Support</span></CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-[11px] text-white/40 font-black uppercase tracking-widest italic leading-relaxed">Direct synchronization with the assignment desk.</p>
                            <Button asChild className="w-full h-12 bg-white text-primary border-none hover:bg-white/90 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg transition-all group/btn">
                                <Link href="/contact" className="flex justify-between w-full px-6">
                                    <span>Contact US</span>
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

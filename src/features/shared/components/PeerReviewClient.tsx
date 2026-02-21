'use client';

import { ShieldCheck, Clock, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function PeerReviewClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <Card className="bg-primary border-none text-white shadow-lg rounded-[2.5rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                            <CardContent className="p-10 sm:p-14 flex flex-col md:flex-row items-center gap-10">
                                <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10 shadow-inner">
                                    <ShieldCheck className="w-12 h-12 text-secondary" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl sm:text-4xl text-white font-black tracking-tighter">Double-Blind Integrity</h2>
                                    <p className="text-base sm:text-lg text-white/50 leading-relaxed">
                                        "Every manuscript is evaluated under a strict **double-blind protocol**. Author and reviewer identities are fully protected to ensure technical objectivity without compromise."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-primary tracking-tighter">Evaluation Stages</h2>
                            <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-2">Standardized Review Pipeline</p>
                        </div>

                        <Accordion type="single" collapsible className="w-full space-y-4">
                            {[
                                { step: "01", title: "Preliminary Screening", desc: "Our editorial board performs sub-second triage to verify scope alignment, format compliance, and plagiarism benchmarks via iThenticate." },
                                { step: "02", title: "Peer-Evaluation", desc: "The manuscript is disseminated to a minimum of two global domain experts for exhaustive technical, mathematical, and impact scrutiny." },
                                { step: "03", title: "Final Adjudication", desc: "The Editor-in-Chief synthesizes expert feedback to issue a decisive verdict: Accept, Revise, or Re-transmit." }
                            ].map((item, i) => (
                                <AccordionItem key={i} value={`step-${i}`} className="border-primary/5 shadow-vip rounded-[1.5rem] bg-white px-6 group transition-all duration-300 overflow-hidden">
                                    <AccordionTrigger className="hover:no-underline py-6">
                                        <div className="flex items-center gap-6 text-left">
                                            <Badge className="h-10 w-10 rounded-xl flex items-center justify-center font-black text-white p-0 bg-primary">
                                                {item.step}
                                            </Badge>
                                            <span className="text-xl font-black text-primary tracking-tight transition-colors">{item.title}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-primary/50 text-base font-medium pl-16 pb-6 leading-relaxed">
                                        {item.desc}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </section>

                    <section>
                        <Card className="bg-primary/5 border-primary/5 rounded-[2.5rem] shadow-inner group overflow-hidden relative">
                            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000 animate-blob pointer-events-none" />
                            <CardContent className="p-10 flex flex-col md:flex-row items-center gap-10 relative z-10">
                                <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center shrink-0 border border-primary/5 shadow-vip group-hover:scale-110 transition-transform duration-500 animate-float-slow">
                                    <Clock className="w-10 h-10 text-secondary" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-black text-primary tracking-tighter">High-Speed Verdict</h2>
                                    <p className="text-base text-primary/40 font-medium leading-relaxed">
                                        "Recognizing the urgency of innovation, IJITEST provides the first peer-review decision **within 3-5 Business Days**."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <div className="animate-float">
                        <TrackManuscriptWidget />
                    </div>

                    <Card className="bg-primary border-none text-white shadow-vip rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-120 transition-transform duration-1000 animate-blob pointer-events-none" />
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-2xl font-black text-white tracking-tighter">Reviewer Panel</CardTitle>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.4em] mt-1">Certified Evaluation</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <Link href="/join-us" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/link shadow-inner">
                                <span className="text-[10px] font-black uppercase text-white/40 group-hover/link:text-white transition-colors tracking-widest">Protocol Manual</span>
                                <ChevronRight className="w-4 h-4 text-secondary group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                            <div className="space-y-4 pt-4 border-t border-white/5">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">Ethical Standard</h4>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">"Adhering to COPE (Committee on Publication Ethics) benchmarks for all scientific evaluations."</p>
                                <Link href="/ethics" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-secondary hover:text-white transition-all pb-1 border-b border-secondary/20 hover:border-white">
                                    View Ethics Matrix <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

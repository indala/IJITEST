'use client';

import { Scale, FileText, Copyright, ShieldAlert, ChevronRight, Gavel } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TermsClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="relative">
                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />
                        <p className="text-xl md:text-2xl font-black leading-relaxed text-primary tracking-tight">
                            "The IJITEST legal framework is designed to provide a transparent, ethical, and professional ecosystem for the dissemination of engineering excellence."
                        </p>
                    </section>

                    <Card className="border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:rotate-12 transition-transform duration-1000">
                            <Copyright className="w-48 h-48" />
                        </div>
                        <CardHeader className="p-10 px-12 border-b border-primary/5 bg-primary/5">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.3em] bg-white text-primary px-4 h-6 rounded-full shadow-sm border border-primary/5">Legal Protocol</Badge>
                                <CardTitle className="text-3xl font-black text-primary tracking-tighter mt-2">Intellectual Sovereignty</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 px-12 space-y-10">
                            <p className="text-base font-medium text-primary/40 leading-relaxed border-l-2 border-secondary/20 pl-6">
                                "Felix Academic Publications respects author autonomy while ensuring global open-access reach for all finalized research assets."
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Open-Access Dissemination",
                                    "Creative Commons Attribution",
                                    "Immutable Author Rights",
                                    "Integrity & Anti-Plagiarism"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/5 shadow-inner group/item hover:bg-white hover:shadow-vip transition-all duration-300">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-secondary group-hover/item:scale-110 transition-transform">
                                            <Scale className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <section className="pt-10 border-t border-primary/5 space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/5">
                                <Gavel className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-primary tracking-tighter">Conduct & Mandate</h2>
                                <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-1">Professional Obligations</p>
                            </div>
                        </div>
                        <div className="space-y-6 text-base font-medium text-primary/40 leading-relaxed pl-20 border-l-2 border-primary/5">
                            <p>
                                "Users are mandated to interact with the absolute highest standards of professional integrity. Any attempt to compromise the scientific sanctity of the journal results in immediate service termination."
                            </p>
                            <p className="text-[11px] opacity-50 uppercase tracking-widest font-black">
                                Scientific accuracy remains the exclusive responsibility of contributing authors.
                            </p>
                        </div>
                    </section>

                    <Card className="bg-primary/5 border-primary/5 rounded-[2.5rem] shadow-inner group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardContent className="p-10 sm:p-14 flex flex-col md:flex-row gap-10 items-center relative z-10">
                            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center shrink-0 border border-primary/5 shadow-vip group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl font-black text-primary tracking-tighter">Framework Evolution</h3>
                                <p className="text-base text-primary/40 font-medium leading-relaxed">
                                    "Felix Academic Publications reserves the mandate to evolve these terms. Continued interaction with the journal platform implies acceptance of the updated legal framework."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <TrackManuscriptWidget />

                    <Card className="bg-primary border-none text-white shadow-vip rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-120 transition-transform duration-1000" />
                        <CardHeader className="p-8 pb-4">
                            <ShieldAlert className="w-10 h-10 text-secondary/40 mb-4 transition-transform" />
                            <CardTitle className="text-2xl font-black text-white tracking-tighter">Policy Matrix</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <Link href="/privacy" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/link shadow-inner">
                                <span className="text-[10px] font-black uppercase text-white/40 group-hover/link:text-white transition-colors tracking-widest">Privacy Protocol</span>
                                <ChevronRight className="w-4 h-4 text-secondary group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/guidelines" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/30 transition-all group/link shadow-inner">
                                <span className="text-[10px] font-black uppercase text-white/40 group-hover/link:text-white transition-colors tracking-widest">Author Guidelines</span>
                                <ChevronRight className="w-4 h-4 text-secondary group-hover/link:translate-x-1 transition-transform" />
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/5 border-dashed border-2 rounded-[2.5rem] p-8 text-center space-y-6 group overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-2 relative z-10">
                            <h4 className="text-xl font-black text-primary tracking-tighter">Call for Papers</h4>
                            <p className="text-[11px] text-primary/40 font-black uppercase tracking-widest leading-relaxed">Join the 2026 Scientific Cohort</p>
                        </div>
                        <Button asChild className="w-full h-12 bg-primary hover:bg-primary/95 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg relative z-10 transition-all">
                            <Link href="/submit" className="flex justify-between w-full px-6">
                                <span>Transmit Now</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

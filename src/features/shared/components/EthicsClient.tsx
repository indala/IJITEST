'use client';

import { ShieldCheck, Scale, AlertOctagon, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function EthicsClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="relative">
                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />
                        <p className="text-xl md:text-2xl font-black leading-relaxed text-primary tracking-tight">
                            "Our editorial ecosystem is founded on the principles of scientific integrity, technical accuracy, and the highest scholarly ethical standards."
                        </p>
                    </section>

                    <Card className="border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:rotate-12 transition-transform duration-1000">
                            <AlertOctagon className="w-48 h-48" />
                        </div>
                        <CardHeader className="p-10 px-12 border-b border-primary/5 bg-primary/5">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.3em] bg-white text-primary px-4 h-6 rounded-full shadow-sm border border-primary/5">Integrity Protocol</Badge>
                                <CardTitle className="text-3xl font-black text-primary tracking-tighter mt-2">Plagiarism Enforcement</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 px-12 space-y-10">
                            <p className="text-base font-medium text-primary/40 leading-relaxed border-l-2 border-secondary/20 pl-6">
                                "IJITEST maintains a zero-tolerance mandate toward intellectual misappropriation. Every submission undergoes deep-scanning via advanced cryptographic and semantic origin-detection systems."
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Automated iThenticate Screening",
                                    "Mandatory Origin Attribution",
                                    "Identity Verification Protocols",
                                    "Immediate Transmission Veto"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/5 shadow-inner group/item hover:bg-white hover:shadow-vip transition-all duration-300">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-secondary group-hover/item:scale-110 transition-transform">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <section className="pt-10 border-t border-primary/5 space-y-8">
                        <div>
                            <h2 className="text-3xl font-black text-primary tracking-tighter">Global Compliance</h2>
                            <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-2">Standardized Ethics Framework</p>
                        </div>

                        <Card className="bg-primary border-none shadow-vip rounded-[3rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                            <CardContent className="p-10 sm:p-14 flex flex-col md:flex-row gap-10 items-center relative z-10">
                                <div className="w-24 h-24 bg-white/10 rounded-[2rem] flex items-center justify-center text-white shrink-0 border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                    <Scale className="w-10 h-10 text-secondary" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-2xl text-white font-black tracking-tighter leading-snug">
                                        COPE Certified Workflow
                                    </p>
                                    <p className="text-base text-white/50 leading-relaxed font-medium">
                                        "IJITEST operations are strictly aligned with the Committee on Publication Ethics (COPE) benchmarks. We maintain transparent protocols for retractions, disputes, and editorial transparency."
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <TrackManuscriptWidget />

                    <Card className="bg-primary/5 border-primary/5 shadow-vip rounded-[2.5rem] group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardContent className="p-8 relative z-10">
                            <h4 className="text-xl font-black text-primary mb-2 tracking-tighter">Author Resources</h4>
                            <p className="text-[11px] text-primary/40 mb-8 font-black uppercase tracking-widest leading-relaxed">Mandatory Templates & Ethics Forms</p>
                            <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-12 bg-primary hover:bg-primary/95 rounded-xl shadow-lg transition-all group/btn">
                                <Link href="/guidelines" className="flex items-center justify-between px-6 w-full">
                                    <span>Full Protocols</span>
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

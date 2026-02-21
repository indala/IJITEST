'use client';

import { ShieldCheck, Lock, Eye, ChevronRight, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PrivacyClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section className="relative">
                        <div className="absolute -left-8 top-0 bottom-0 w-1 bg-primary/10 hidden md:block" />
                        <p className="text-xl md:text-2xl font-black leading-relaxed text-primary tracking-tight">
                            "IJITEST and Felix Academic Publications are committed to the preservation of data privacy, ensuring a secure scholarly environment for global researchers."
                        </p>
                    </section>

                    <Card className="border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[3rem] bg-white group overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:rotate-12 group-hover:scale-110 group-hover:text-primary/10 transition-all duration-1000 pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-1000 pointer-events-none" />
                        <CardHeader className="p-10 px-12 border-b border-primary/5 bg-primary/5">
                            <div className="space-y-1">
                                <Badge variant="secondary" className="font-black text-[9px] uppercase tracking-[0.3em] bg-white text-primary px-4 h-6 rounded-full shadow-sm border border-primary/5">Data Protocol</Badge>
                                <CardTitle className="text-3xl font-black text-primary tracking-tighter mt-2">Information Harvesting</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-10 px-12 space-y-10">
                            <p className="text-base font-medium text-primary/40 leading-relaxed border-l-2 border-secondary/20 pl-6">
                                "We strictly collect essential scholarly metadata to facilitate the rigorous peer-review and publication orchestration."
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Author Provenance & Identity",
                                    "Cryptographically Secure Email",
                                    "Scholarly Biographical Metadata",
                                    "ORCID & Professional IDs"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 bg-primary/5 rounded-2xl border border-primary/5 shadow-inner group/item hover:bg-white hover:shadow-vip transition-all duration-300">
                                        <div className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] group-hover/item:scale-150 transition-transform" />
                                        <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <section className="pt-10 border-t border-primary/5 space-y-8">
                        <div className="flex items-center gap-6 group/section">
                            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-primary/5 group-hover/section:scale-110 group-hover/section:bg-primary/10 transition-all duration-500">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-black text-primary tracking-tighter">Data Circulation</h2>
                                <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-1">Transparency & Flow</p>
                            </div>
                        </div>
                        <div className="space-y-6 text-base font-medium text-primary/40 leading-relaxed pl-20">
                            <p>
                                "Personal data circulation is restricted to the internal journal orchestration. External sharing is limited to certified academic indexing protocols."
                            </p>
                            <ul className="space-y-4">
                                {[
                                    "Editorial communication synchronization.",
                                    "Certified indexing services (CrossRef/ORCID).",
                                    "Internal Felix Academic audit protocols."
                                ].map((li, idx) => (
                                    <li key={idx} className="flex gap-4 items-start group/li">
                                        <ChevronRight className="w-5 h-5 text-secondary mt-1 shrink-0 group-hover/li:translate-x-1 transition-transform" />
                                        <span className="group-hover/li:text-primary transition-colors">{li}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </section>

                    <Card className="bg-primary border-none shadow-lg rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors duration-1000 pointer-events-none" />
                        <CardContent className="p-10 sm:p-14 flex flex-col md:flex-row gap-10 items-center relative z-10">
                            <div className="w-24 h-24 bg-white/10 rounded-2xl flex items-center justify-center text-white shrink-0 border border-white/10 shadow-inner group-hover:rotate-12 group-hover:scale-110 transition-all duration-500 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                                <ShieldCheck className="w-10 h-10 text-secondary" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-2xl text-white font-black tracking-tighter">Fortified Security</h3>
                                <p className="text-base text-white/50 leading-relaxed font-medium">
                                    "All manuscript assets and author credentials reside behind multi-layered encryption protocols on audited secure servers."
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <TrackManuscriptWidget />
                    </div>

                    <Card className="bg-primary/5 border-primary/5 shadow-lg rounded-[2.5rem] group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-primary/10 transition-all duration-1000 pointer-events-none" />
                        <CardContent className="p-8 relative z-10">
                            <ShieldAlert className="w-10 h-10 mb-6 text-secondary/40 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-black text-primary mb-2 tracking-tighter">Legal Nexus</h3>
                            <p className="text-[11px] text-primary/40 mb-8 font-black uppercase tracking-widest leading-relaxed">Integrated Standard Compliance</p>
                            <div className="space-y-3">
                                <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-11 bg-primary hover:bg-primary/95 rounded-xl transition-all group/btn">
                                    <Link href="/terms" className="flex justify-between w-full px-6">
                                        <span>Terms</span>
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                                <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-11 bg-secondary hover:bg-secondary/95 rounded-xl transition-all group/btn">
                                    <Link href="/ethics" className="flex justify-between w-full px-6">
                                        <span>Ethics</span>
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary border-none shadow-lg rounded-[2.5rem] overflow-hidden relative group">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black text-white tracking-tighter">Protocol Support</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <p className="text-[11px] text-white/40 font-black uppercase tracking-widest leading-relaxed">Direct synchronization with the privacy desk.</p>
                            <Button asChild className="w-full h-12 bg-white text-primary border-none hover:bg-white/90 font-black text-[10px] uppercase tracking-[0.3em] rounded-xl shadow-lg shadow-white/5">
                                <Link href="/contact">Inquire Privacy Desk</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

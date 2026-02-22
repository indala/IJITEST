'use client';

import { Mail, Phone, MapPin, ShieldAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ContactForm from '@/features/contact/components/ContactForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ContactClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Support Info & Form */}
                <div className="lg:col-span-2 space-y-8 sm:space-y-12">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-primary/5 shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl group overflow-hidden">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/5 group-hover:-rotate-12 transition-transform">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-black mb-2 text-primary tracking-tighter">Editorial Nexus</h3>
                                <Link
                                    href="mailto:editor@ijitest.org"
                                    className="text-xl sm:text-2xl font-black text-primary mb-6 tracking-tight hover:text-secondary hover:underline underline-offset-4 decoration-2 decoration-secondary/50 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all inline-block"
                                >
                                    editor@ijitest.org
                                </Link>
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.3em] bg-primary/5 text-primary/40 border-none px-4 py-1.5 h-auto pointer-events-none">24/7 Author Synchrony</Badge>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-primary/5 shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl group overflow-hidden">
                            <CardContent className="p-8 flex flex-col items-center text-center">
                                <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/5 group-hover:rotate-12 transition-transform">
                                    <Phone className="w-6 h-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-black mb-2 text-primary tracking-tighter">WhatsApp Hotline</h3>
                                <Link
                                    href="tel:+918919643590"
                                    className="text-xl sm:text-2xl font-black text-primary mb-6 tracking-tight hover:text-secondary hover:underline underline-offset-4 decoration-2 decoration-secondary/50 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all inline-block"
                                >
                                    +91 8919643590
                                </Link>
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.3em] bg-secondary/5 text-secondary border-none px-4 py-1.5 h-auto pointer-events-none">Immediate Reception</Badge>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="bg-white p-6 sm:p-14 rounded-3xl border border-primary/5 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-1000 pointer-events-none" />
                        <div className="relative z-10">
                            <ContactForm />
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-6 sm:space-y-8 lg:space-y-10">
                    {/* HQ Address Widget */}
                    <Card className="bg-white border-primary/5 shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-secondary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 group-hover:bg-secondary/10 transition-all duration-1000 pointer-events-none" />
                        <CardContent className="p-8 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-primary/10 group-hover:-translate-y-1 transition-all duration-300">
                                <MapPin className="w-6 h-6 text-secondary group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" />
                            </div>
                            <h3 className="text-2xl font-black mb-1 text-primary tracking-tighter w-full">Editorial HQ</h3>
                            <p className="text-[10px] font-black text-secondary/80 uppercase tracking-[0.4em] mb-6 w-full">Felix Academic Publications</p>
                            <div className="text-sm text-primary/70 leading-relaxed font-bold space-y-1.5 w-full">
                                <p className="flex items-center gap-2 justify-center sm:justify-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                    <span>IJITEST Journal Office</span>
                                </p>
                                <p className="flex items-center gap-2 justify-center sm:justify-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                    <span>Madhurawada, Visakhapatnam</span>
                                </p>
                                <p className="flex items-center gap-2 justify-center sm:justify-start">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/20" />
                                    <span>Andhra Pradesh, India</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ethics Statements */}
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <Card className="bg-white border-primary/5 shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl group overflow-hidden relative">
                            <div className="absolute -left-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 group-hover:bg-primary/10 transition-all duration-1000 pointer-events-none" />
                            <CardContent className="p-8 relative z-10">
                                <div className="w-12 h-12 bg-primary/5 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-primary/10 group-hover:scale-105 transition-all duration-300 text-secondary">
                                    <ShieldAlert className=" w-6 h-6 group-hover:text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-black text-primary mb-2 tracking-tighter">Integrity Nexus</h3>
                                <p className="text-[10px] sm:text-[11px] text-primary/60 mb-6 font-black uppercase tracking-widest leading-relaxed">COPE Standard Adherence</p>
                                <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-12 bg-primary text-white hover:bg-primary/95 hover:scale-[1.02] rounded-xl transition-all group/btn shadow-lg shadow-primary/20 overflow-hidden relative">
                                    <Link href="/ethics" className="flex justify-between items-center w-full px-6">
                                        <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.2),transparent)] animate-shine" />
                                        <span>View Ethics</span>
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform relative z-10" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <TrackManuscriptWidget />
                </div>
            </div>
        </div>
    );
}

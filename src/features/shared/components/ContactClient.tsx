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
                <div className="lg:col-span-2 space-y-12">
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-white border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[2.5rem] group overflow-hidden">
                            <CardContent className="p-8">
                                <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/5 group-hover:rotate-12 transition-transform">
                                    <Mail className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-black mb-1 text-primary tracking-tighter">Editorial Nexus</h3>
                                <p className="text-2xl font-black text-primary mb-4 tracking-tight">editor@ijitest.org</p>
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.3em] bg-primary/5 text-primary/40 border-none px-3 h-6">24/7 Author Synchrony</Badge>
                            </CardContent>
                        </Card>

                        <Card className="bg-white border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[2.5rem] group overflow-hidden">
                            <CardContent className="p-8">
                                <div className="bg-primary/5 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner border border-primary/5 group-hover:rotate-12 transition-transform">
                                    <Phone className="w-6 h-6 text-secondary" />
                                </div>
                                <h3 className="text-xl font-black mb-1 text-primary tracking-tighter">WhatsApp Hotline</h3>
                                <p className="text-2xl font-black text-primary mb-4 tracking-tight">+91 8919643590</p>
                                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-[0.3em] bg-secondary/5 text-secondary border-none px-3 h-6">Immediate Reception</Badge>
                            </CardContent>
                        </Card>
                    </section>

                    <section className="bg-white p-10 sm:p-14 rounded-[4rem] border border-primary/5 shadow-vip-hover relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <ContactForm />
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    {/* HQ Address Widget */}
                    <Card className="bg-primary border-none text-white shadow-vip rounded-[3rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-120 transition-transform duration-1000" />
                        <CardContent className="p-10">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-inner group-hover:rotate-12 transition-transform">
                                <MapPin className="w-6 h-6 text-secondary" />
                            </div>
                            <h3 className="text-2xl font-black mb-1 tracking-tighter">Editorial HQ</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-8">Felix Academic Publications</p>
                            <div className="text-base text-white/60 leading-relaxed font-medium space-y-1">
                                <p>IJITEST Journal Office,</p>
                                <p>Madhurawada, Visakhapatnam,</p>
                                <p>Andhra Pradesh, India</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ethics Statements */}
                    <Card className="bg-primary/5 border-primary/5 shadow-vip rounded-[2.5rem] group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardContent className="p-8 relative z-10">
                            <ShieldAlert className="w-10 h-10 mb-6 text-secondary/40 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-black text-primary mb-2 tracking-tighter">Integrity Nexus</h3>
                            <p className="text-[11px] text-primary/40 mb-8 font-black uppercase tracking-widest leading-relaxed">COPE Standard Adherence</p>
                            <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-11 bg-primary hover:bg-primary/95 rounded-xl transition-all group/btn shadow-lg shadow-primary/20">
                                <Link href="/ethics" className="flex justify-between w-full px-6">
                                    <span>View Ethics</span>
                                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    <TrackManuscriptWidget />
                </div>
            </div>
        </div>
    );
}

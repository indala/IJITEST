'use client';

import { ShieldCheck, Gavel, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SubmitClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    <Card className="border-primary/5 shadow-lg rounded-[3rem] overflow-hidden bg-white group">
                        <div className="bg-primary p-8 sm:p-10 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700" />
                            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/20 rounded-full blur-[80px]" />

                            <div className="relative z-10 space-y-2">
                                <h2 className="text-3xl font-black tracking-tighter">Ready to Publish?</h2>
                                <p className="text-white/50 text-xs font-black uppercase tracking-[0.3em] border-l-2 border-white/20 pl-6">Scientific Excellence Starts Here</p>
                            </div>
                        </div>

                        <CardContent className="p-8 sm:p-12 relative z-10">
                            <SubmissionForm />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <Card className="bg-white border border-primary/5 p-8 sm:p-10 rounded-[2.5rem] shadow-lg group">
                        <h3 className="text-2xl font-black text-primary mb-8 tracking-tighter">Submission Guide</h3>
                        <div className="space-y-6">
                            {[
                                { title: "Formatting", desc: "Follow IEEE standards for elite presentation" },
                                { title: "Originality", desc: "World-class integrity & zero plagiarism" },
                                { title: "Ethics", desc: "Full COPE compliance mandatory" },
                                { title: "Copyright", desc: "Mandatory signed legal agreement" }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-5 group/item">
                                    <div className="w-11 h-11 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 shadow-sm group-hover/item:bg-primary group-hover/item:text-white transition-all duration-500">
                                        <ShieldCheck className="w-5 h-5 transition-transform group-hover/item:scale-110" />
                                    </div>
                                    <div>
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/80 mb-1 group-hover/item:text-primary transition-colors">{item.title}</h4>
                                        <p className="text-[11px] text-primary/50 font-medium">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button asChild className="mt-10 w-full h-14 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                            <Link href="/guidelines">Full Author Guidelines</Link>
                        </Button>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-primary font-black px-2">
                            <div className="w-6 h-[2px] bg-secondary" />
                            <span className="uppercase tracking-[0.3em] text-[10px]">Elite Policies</span>
                        </div>
                        <div className="space-y-3">
                            <Button asChild variant="outline" className="w-full h-14 justify-between bg-white border border-primary/5 shadow-sm hover:border-secondary group px-6 rounded-2xl transition-all">
                                <Link href="/ethics" className="flex items-center justify-between w-full">
                                    <span className="text-[10px] font-black text-primary/50 group-hover:text-primary uppercase tracking-[0.2em] transition-colors">Publication Ethics</span>
                                    <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full h-14 justify-between bg-white border border-primary/5 shadow-sm hover:border-secondary group px-6 rounded-2xl transition-all">
                                <Link href="/terms" className="flex items-center justify-between w-full">
                                    <span className="text-[10px] font-black text-primary/50 group-hover:text-primary uppercase tracking-[0.2em] transition-colors">Copyright Policy</span>
                                    <ChevronRight className="w-4 h-4 text-secondary group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </Button>
                        </div>
                    </div>

                    <Card className="bg-secondary border-none text-white shadow-vip-hover rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <CardContent className="p-8 relative z-10">
                            <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                                <Gavel className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-white tracking-tighter">Technical Issue?</h3>
                            <p className="text-sm text-white/70 mb-8 font-medium leading-relaxed">Reach our elite support desk for immediate assistance with submissions.</p>
                            <Button asChild className="w-full h-12 bg-white/10 border border-white/20 hover:bg-white text-white hover:text-secondary font-black text-[10px] uppercase tracking-[0.2em] rounded-xl transition-all">
                                <Link href="/contact" className="flex items-center justify-between px-6 w-full">
                                    <span>Contact Support</span>
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

'use client';

import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JoinUsClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left Column: Benefits & Info */}
                <div className="lg:col-span-5 space-y-10 sm:space-y-12">
                    <div className="space-y-4 sm:space-y-6">
                        <h2 className="text-4xl sm:text-6xl font-black text-primary tracking-tighter leading-tight">
                            Orchestrate the <span className="text-secondary">Future</span>
                        </h2>
                        <p className="text-primary/70 leading-relaxed font-medium text-base sm:text-lg border-l-4 border-secondary/20 pl-4 sm:pl-6">
                            "Joining the IJITEST Editorial Board is a commitment to excellence, offering professional influence over the trajectory of global engineering discourse."
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            {
                                icon: Globe,
                                title: "Global Recognition",
                                desc: "Immortalized in our archives and annual journals as a pillar of scientific integrity."
                            },
                            {
                                icon: Users,
                                title: "Elite Networking",
                                desc: "Direct synergy with world-class editors and researchers at the frontier of innovation."
                            },
                            {
                                icon: Award,
                                title: "Excellence Credits",
                                desc: "Official certifications and honors for your peer-review and editorial mastery."
                            }
                        ].map((benefit, i) => (
                            <Card key={i} className="bg-white border-primary/5 shadow-md hover:shadow-xl transition-all duration-500 rounded-3xl group overflow-hidden relative">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                                <CardContent className="p-5 sm:p-6 flex gap-4 sm:gap-6 items-center relative z-10">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary border border-primary/5 shadow-inner group-hover:rotate-12 transition-transform">
                                        <benefit.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-black text-primary tracking-tight mb-1">{benefit.title}</h3>
                                        <p className="text-primary/60 text-[11px] sm:text-xs font-medium leading-relaxed">{benefit.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-primary border-none shadow-lg rounded-3xl overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 animate-blob pointer-events-none" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />
                        <CardContent className="p-6 md:p-10 relative z-10">
                            <h3 className="font-black text-2xl sm:text-3xl mb-6 sm:mb-8 text-white tracking-tighter">Eligibility Requirements</h3>
                            <ul className="space-y-4">
                                {[
                                    "Ph.D. Doctorate in Advanced Engineering/Technology",
                                    "Bi-annual active research/didactic contribution",
                                    "Verified publication history (minimum 5 Q1/Q2 papers)",
                                    "Affiliation with recognized global research institutions"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-xs sm:text-[13px] font-black group/item">
                                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-white/20 rounded-lg flex items-center justify-center shrink-0 border border-white/30 group-hover:bg-secondary group-hover:border-secondary transition-colors transition-all duration-300 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-white/90 group-hover:text-white transition-colors">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Application Form */}
                <div className="lg:col-span-7">
                    <ReviewerApplicationForm />
                </div>
            </div>
        </div>
    );
}

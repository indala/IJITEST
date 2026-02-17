'use client';

import ReviewerApplicationForm from "@/features/reviewer/components/ReviewerApplicationForm";
import { CheckCircle2, Globe, Users, Award } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function JoinUsClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-20">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
                {/* Left Column: Benefits & Info */}
                <div className="lg:col-span-5 space-y-12">
                    <div className="space-y-6">
                        <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-[0.4em] px-4 h-7 rounded-full shadow-sm border border-primary/5 italic bg-white text-primary">
                            Elite Membership
                        </Badge>
                        <h2 className="text-4xl sm:text-5xl font-black text-primary tracking-tighter italic leading-none">
                            Orchestrate the <span className="text-secondary not-italic">Future</span>
                        </h2>
                        <p className="text-primary/40 leading-relaxed font-medium text-lg italic">
                            "Joining the IJITEST Editorial Board is a mandate for excellence, offering profound influence over the trajectory of global engineering discourse."
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
                            <Card key={i} className="bg-white border-primary/5 shadow-vip hover:shadow-vip-hover transition-all duration-500 rounded-[2rem] group overflow-hidden">
                                <CardContent className="p-6 flex gap-6 items-center">
                                    <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary border border-primary/5 shadow-inner group-hover:rotate-12 transition-transform">
                                        <benefit.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-primary tracking-tight italic mb-1">{benefit.title}</h3>
                                        <p className="text-primary/40 text-[11px] font-medium leading-relaxed italic">{benefit.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <Card className="bg-primary border-none shadow-vip rounded-[3rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-120 transition-transform duration-1000" />
                        <CardContent className="p-10">
                            <h3 className="font-black text-2xl mb-8 text-white tracking-tighter italic">Eligibility <span className="text-secondary not-italic">Matrix</span></h3>
                            <ul className="space-y-4">
                                {[
                                    "Ph.D. Doctorate in Advanced Engineering/Technology",
                                    "Bi-annual active research/didactic contribution",
                                    "Verified publication history (minimum 5 Q1/Q2 papers)",
                                    "Affiliation with recognized global research institutions"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-4 text-[12px] font-black italic text-white/50 group/item">
                                        <div className="w-5 h-5 bg-white/10 rounded-lg flex items-center justify-center shrink-0 border border-white/10 group-hover/item:text-secondary transition-colors">
                                            <CheckCircle2 className="w-3 h-3" />
                                        </div>
                                        {item}
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

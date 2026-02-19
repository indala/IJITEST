'use client';

import { Search, Database } from 'lucide-react';
import RoadmapSection from '@/features/indexing/components/RoadmapSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import EthicsWidget from '@/features/shared/widgets/EthicsWidget';
import ResourceDeskWidget from '@/features/shared/widgets/ResourceDeskWidget';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function IndexingClient() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-16">
                    {/* Vision Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary shadow-inner border border-primary/5">
                                <Search className="w-8 h-8" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-black text-primary tracking-tighter leading-tight">Global Visibility</h2>
                                <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-1">The Science of Discovery</p>
                            </div>
                        </div>
                        <p className="text-xl font-medium text-primary/60 leading-relaxed border-l-4 border-secondary/20 pl-10 max-w-2xl">
                            "Our strategic mandate is to ensure that every validated innovation published in IJITEST reaches the global scientific community through premier indexing hubs."
                        </p>
                    </section>

                    <RoadmapSection />

                    {/* Technical Standards */}
                    <Card className="bg-white border-primary/5 shadow-lg rounded-[2.5rem] overflow-hidden group">
                        <CardContent className="p-10 md:p-14 space-y-12">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary shadow-inner border border-secondary/5 transition-transform">
                                    <Database className="w-7 h-7" />
                                </div>
                                <h3 className="text-2xl font-black text-primary tracking-tighter">Metadata Protocols</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[
                                    { title: "DOI Assignment", desc: "Permanent digital identifiers via CrossRef" },
                                    { title: "OAI-PMH", desc: "Standard metadata harvesting interface" },
                                    { title: "XML Delivery", desc: "Automated indexing feeding systems" },
                                    { title: "Archival Sync", desc: "Long-term preservation orchestration" }
                                ].map((spec, i) => (
                                    <div key={i} className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/5 hover:bg-white hover:shadow-lg transition-all duration-500">
                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] px-3 h-5 border-primary/10 text-primary/40">Technical Spec</Badge>
                                        <h4 className="text-lg font-black text-primary tracking-tight">{spec.title}</h4>
                                        <p className="text-xs text-primary/40 font-medium leading-relaxed">{spec.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <div className="p-1 rounded-[3rem] bg-primary/5 border border-primary/5 shadow-lg">
                        <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.8rem]">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-3 text-primary font-black px-4">
                            <div className="w-8 h-[2px] bg-secondary" />
                            <span className="uppercase tracking-[0.3em] text-[10px]">Academic Orbit</span>
                        </div>
                        <EthicsWidget />
                        <ResourceDeskWidget />
                    </div>

                    <Card className="bg-primary/5 border-primary/5 border-dashed border-2 rounded-[2.5rem] p-10 text-center space-y-8 group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="space-y-2 relative z-10">
                            <CardTitle className="text-2xl font-black text-primary">Inaugural 2026</CardTitle>
                            <p className="text-[11px] text-primary/40 font-black uppercase tracking-widest leading-relaxed">Strategic volume for foundational indexing integration.</p>
                        </div>
                        <Badge className="bg-secondary text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg shadow-secondary/20 uppercase tracking-widest relative z-10">Submissions Open</Badge>
                    </Card>
                </div>
            </div>
        </div>
    );
}

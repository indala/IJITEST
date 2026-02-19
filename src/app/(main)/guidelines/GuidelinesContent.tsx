"use client";

import { Download, FileText, CheckCircle, ShieldAlert, ChevronRight, Info, Cpu, FileCheck } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from 'framer-motion'
import { Badge } from "@/components/ui/badge";

interface GuidelinesContentProps {
    settings: Record<string, string>;
}

export default function GuidelinesContent({ settings }: GuidelinesContentProps) {
    const shortName = settings.journal_short_name || "IJITEST";
    const supportEmail = settings.support_email || "editor@ijitest.org";
    console.log(settings)

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Author Guidelines"
                description={`Instructions for preparing, submitting, and publishing research with ${shortName}.`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Guidelines', href: '/guidelines' },
                ]}
                scrollOnComplete={true}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-12">
                        <Tabs defaultValue="workflow" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-primary/5 p-1.5 rounded-2xl border border-primary/10 shadow-inner">
                                <TabsTrigger value="workflow" className="font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-vip">
                                    Publishing Workflow
                                </TabsTrigger>
                                <TabsTrigger value="preparation" className="font-black text-[11px] uppercase tracking-[0.2em] rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-vip">
                                    Manuscript Preparation
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="workflow" className="space-y-10 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { icon: Download, title: "1. Download Template", desc: "Use our official IEEE Word template to ensure your manuscript meets global formatting standards." },
                                        { icon: FileText, title: "2. Submit via Portal", desc: `Upload your manuscript and metadata through our secure submission dashboard for rapid processing.` },
                                        { icon: Cpu, title: "3. Peer Review", desc: "Rigorous double-blind peer review by domain experts. Initial decision typically within 2–3 weeks." },
                                        { icon: FileCheck, title: "4. Final Publication", desc: "Upon acceptance, complete copyright formalities and APC payment for DOI assignment and indexing." }
                                    ].map((step, idx) => (
                                        <motion.div
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Card className="h-full bg-white border border-primary/5 shadow-vip hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-500 rounded-3xl group">
                                                <CardContent className="p-7">
                                                    <div className="flex gap-5">
                                                        <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                            <step.icon className="w-7 h-7 text-primary group-hover:text-white transition-colors" />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <h4 className="text-sm font-black text-primary uppercase tracking-tight group-hover:text-secondary transition-colors">{step.title}</h4>
                                                            <p className="text-[11px] text-primary/60 font-medium leading-relaxed">{step.desc}</p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>

                                <Card className="bg-primary p-1 rounded-[3rem] shadow-vip border-none overflow-hidden group">
                                    <div className="bg-white/5 backdrop-blur-md p-8 sm:p-10 rounded-[2.8rem] relative">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                                            <div className="space-y-2">
                                                <h3 className="text-2xl font-black text-white tracking-tighter">Ready for Submission?</h3>
                                                <p className="text-sm text-white/60 font-medium border-l-2 border-white/10 pl-6">Submit your latest technical breakthrough today through our official portal.</p>
                                            </div>
                                            <Button asChild className="h-14 px-10 bg-secondary hover:bg-secondary/90 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-secondary/20 transition-all hover:scale-105">
                                                <Link href="/submit" className="flex items-center">
                                                    Submit Manuscript <ChevronRight className="w-5 h-5 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </TabsContent>

                            <TabsContent value="preparation" className="space-y-8 mt-0 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="bg-white border border-primary/5 shadow-vip rounded-[2.5rem] overflow-hidden">
                                        <CardHeader className="p-8 pb-4">
                                            <CardTitle className="text-xl font-black text-primary flex items-center gap-3 tracking-tighter">
                                                <Info className="w-6 h-6 text-secondary" /> Formatting Standards
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-8 pt-0 space-y-4">
                                            {[
                                                "IEEE Standard Two-Column Layout",
                                                "Times New Roman Style Font",
                                                "10pt Main Body / 9pt Abstract",
                                                "Minimum 04 Keywords Mandatory",
                                                "Margins: T:0.7, B:0.7, R:0.6, L:0.6"
                                            ].map((rule, idx) => (
                                                <div key={idx} className="flex items-center gap-4 text-sm font-bold text-primary/70 group/rule">
                                                    <div className="w-5 h-5 rounded-full bg-secondary/10 flex items-center justify-center border border-secondary/20 group-hover/rule:bg-secondary group-hover/rule:text-white transition-all">
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    </div>
                                                    {rule}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-6">
                                        <Button asChild variant="outline" className="w-full h-20 justify-between border-2 border-primary/10 border-dashed px-6 group rounded-[2rem] hover:border-primary/30 hover:bg-primary/5 transition-all outline-none">
                                            <a href={settings.template_url || "/docs/template.docx"} download className="flex items-center gap-5 w-full">
                                                <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                                    <Download className="w-6 h-6" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">MS Word Template</p>
                                                    <p className="text-[10px] text-primary/40 font-black uppercase">Official IEEE Doc</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-primary/20 group-hover:text-primary transition-colors" />
                                            </a>
                                        </Button>

                                        <Button asChild variant="outline" className="w-full h-20 justify-between border-2 border-secondary/10 border-dashed px-6 group rounded-[2rem] hover:border-secondary/30 hover:bg-secondary/5 transition-all outline-none">
                                            <a href={settings.copyright_url || "/docs/copyright-form.docx"} download className="flex items-center gap-5 w-full">
                                                <div className="w-12 h-12 bg-secondary/5 rounded-2xl flex items-center justify-center text-secondary border border-secondary/10 group-hover:bg-secondary group-hover:text-white transition-all duration-500">
                                                    <Download className="w-6 h-6" />
                                                </div>
                                                <div className="text-left flex-1">
                                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-secondary">Copyright Form</p>
                                                    <p className="text-[10px] text-secondary/40 font-black uppercase">Required Asset</p>
                                                </div>
                                                <ChevronRight className="w-5 h-5 text-secondary/20 group-hover:text-secondary transition-colors" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>

                                <Card className="bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-[2.5rem] shadow-sm">
                                    <CardContent className="p-8">
                                        <p className="text-sm text-primary/60 font-medium leading-relaxed text-center max-w-3xl mx-auto border-l-2 border-secondary/30 px-6">
                                            * Authors must ensure all figures are high-resolution (min 300 DPI) and references follow the IEEE citation style for faster indexing approval. Elite submissions receive priority processing.
                                        </p>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>

                        <section className="pt-12 border-t border-primary/10">
                            <h2 className="text-3xl font-black text-primary mb-10 tracking-widest flex items-center gap-5 uppercase">
                                <span className="w-2 h-10 bg-secondary rounded-full shadow-lg shadow-secondary/20" />
                                Review & Publication
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { label: "Process", title: "Double-Blind", desc: "Peer review by elite global domain experts.", color: "emerald", badge: "Process" },
                                    { label: "Timeline", title: "2–3 Weeks", desc: "Standard peer review decision timeframe for thorough validation.", color: "blue", badge: "Timeline" },
                                    { label: "Indexing", title: "DOI Assignment", desc: "Permanent global registry for all elite articles.", color: "amber", badge: "Indexing" }
                                ].map((item, i) => (
                                    <Card key={i} className="bg-white border border-primary/5 shadow-vip hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-500 rounded-3xl overflow-hidden group">
                                        <CardContent className="p-7 text-center space-y-4">
                                            <Badge className={`bg-${item.color}-50 text-${item.color}-700 hover:bg-${item.color}-100 border-${item.color}-200 text-[9px] font-black uppercase px-3 h-5 rounded-full`}>{item.badge}</Badge>
                                            <h4 className="text-base font-black text-primary tracking-tight group-hover:text-secondary transition-colors">{item.title}</h4>
                                            <p className="text-[11px] text-primary/50 font-medium leading-relaxed">{item.desc}</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        <div className="p-1 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/5 shadow-vip">
                            <div className="bg-white/50 backdrop-blur-sm p-3 rounded-[2.3rem]">
                                <TrackManuscriptWidget />
                            </div>
                        </div>

                        <Card className="bg-secondary border-none text-white shadow-vip-hover rounded-[2.5rem] overflow-hidden relative group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                            <CardContent className="p-8 relative z-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 border border-white/20 group-hover:rotate-12 transition-transform duration-500">
                                    <ShieldAlert className="w-8 h-8 text-white" />
                                </div>
                                <CardTitle className="text-2xl font-black mb-2 text-white tracking-tighter">Ethics Policy</CardTitle>
                                <p className="text-sm text-white/70 mb-8 font-medium leading-relaxed">IJITEST follows COPE guidelines for scientific integrity and global best practices.</p>
                                <Link href="/privacy" className="group/link inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-white">
                                    <span className="border-b border-white/30 group-hover/link:border-white transition-all pb-1">View Policy</span>
                                    <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="bg-primary p-1 border-none text-white shadow-vip rounded-[2.5rem] overflow-hidden relative group">
                            <div className="bg-white/5 backdrop-blur-md p-8 rounded-[2.3rem] relative">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
                                <CardContent className="p-0 relative z-10">
                                    <h3 className="text-lg font-black mb-6 tracking-widest uppercase text-secondary">APC Summary</h3>
                                    <div className="space-y-4 mb-8">
                                        <div className="flex justify-between items-center text-xs font-black border-b border-white/10 pb-3">
                                            <span className="text-white/50 uppercase tracking-[0.2em]">Domestic</span>
                                            <span className="text-secondary text-lg">₹{settings.apc_inr}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs font-black">
                                            <span className="text-white/50 uppercase tracking-[0.2em]">International</span>
                                            <span className="text-secondary text-lg">${settings.apc_usd}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                        <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                                            * {settings.apc_description || 'Fees apply only upon acceptance for permanent hosting and indexing.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}


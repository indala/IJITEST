'use client'

import { Calendar, FileText, ChevronRight, Download, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import PaperCard from '@/features/archives/components/PaperCard';
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function ArchivesClient({ initialPapers }: { initialPapers: any[] }) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPapers = initialPapers.filter(p =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.keywords?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.paper_id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
            {/* Search Bar */}
            <div className="mb-12 relative max-w-3xl">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary/40">
                    <Search className="w-5 h-5" />
                </div>
                <Input
                    type="text"
                    placeholder="Search by Title, Author, or Manuscript ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-16 pl-14 pr-6 rounded-[1.5rem] bg-primary/5 border-primary/10 font-bold text-primary shadow-inner focus-visible:ring-primary placeholder:text-primary/20"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden sm:block">
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/10 text-primary/30">Archives DB v1.0</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    {filteredPapers.length > 0 ? (
                        <>
                            <Card className="bg-primary border-none text-white overflow-hidden relative rounded-[2.5rem] shadow-vip group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2 group-hover:scale-120 transition-transform duration-1000" />
                                <CardContent className="p-10 flex flex-col md:flex-row md:items-center justify-between relative z-10">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-black tracking-tighter">Published Research</h2>
                                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                                            <span className="w-6 h-[1px] bg-secondary" /> Global Repository • {filteredPapers.length} Manuscripts
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-6 mt-8 md:mt-0">
                                        <div className="text-right hidden sm:block">
                                            <Badge className="text-[9px] h-5 font-black uppercase tracking-[0.2em] bg-secondary text-white border-none shadow-lg shadow-secondary/20 px-3">Live Volume</Badge>
                                            <p className="text-sm font-black text-white/80 mt-2">Volume 1 (2026)</p>
                                        </div>
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                                            <FileText className="w-7 h-7 text-secondary" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                {filteredPapers.map((paper: any) => (
                                    <PaperCard key={paper.paper_id} paper={paper} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <Card className="bg-primary/5 p-16 sm:p-24 border-dashed border-primary/10 border-2 rounded-[3.5rem] text-center relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 text-primary/5 group-hover:rotate-12 transition-transform duration-1000">
                                <Calendar className="w-48 h-48" />
                            </div>
                            <div className="bg-white w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-vip border border-primary/5 relative z-10">
                                <FileText className="w-8 h-8 text-primary/20" />
                            </div>
                            <h2 className="text-3xl font-black text-primary tracking-tighter mb-4 relative z-10">Inaugural Volume <br className="hidden sm:block" /> In Progress</h2>
                            <p className="text-primary/40 max-w-sm mx-auto font-medium relative z-10 mb-10 text-sm leading-relaxed">
                                "Elite research undergoes rigorous peer-review. Accepted articles are streamed to our digital repository following official validation."
                            </p>
                            <Button asChild className="relative z-10 h-14 px-10 font-black text-[10px] uppercase tracking-[0.3em] bg-primary hover:bg-primary/95 text-white rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.05]">
                                <Link href="/submit" className="flex items-center gap-3">
                                    Submit Original Research <ChevronRight className="w-4 h-4" />
                                </Link>
                            </Button>
                        </Card>
                    )}
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-10">
                    <TrackManuscriptWidget />

                    <Card className="bg-primary/5 border-primary/5 shadow-vip rounded-[2.5rem] group overflow-hidden relative">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000" />
                        <CardContent className="p-8 relative z-10">
                            <h4 className="text-xl font-black text-primary mb-2 tracking-tighter">Call for Papers</h4>
                            <p className="text-[11px] text-primary/40 mb-8 font-black uppercase tracking-widest leading-relaxed">Enrolling Elite Research for 2026 Edition</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white/50 rounded-2xl border border-primary/5 shadow-inner">
                                    <span className="text-[9px] font-black uppercase text-primary/30 tracking-[0.2em]">Transmission Slot</span>
                                    <span className="text-[10px] font-black text-primary uppercase">Rolling 2026</span>
                                </div>
                                <Button asChild className="w-full text-[10px] font-black uppercase tracking-[0.3em] h-12 bg-primary hover:bg-primary/95 rounded-xl shadow-lg transition-all">
                                    <Link href="/submit">Initiate Submission</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-secondary border-none text-white shadow-xl shadow-secondary/20 rounded-[2.5rem] overflow-hidden relative group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                            <Download className="w-32 h-32" />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <Download className="w-10 h-10 mb-6 text-white group-hover:bounce transition-all" />
                            <CardTitle className="text-2xl font-black mb-2 text-white tracking-tighter">Author Toolkit</CardTitle>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed">Download official IEEE standardized manuscript templates and legal forms.</p>
                            <Button asChild variant="secondary" className="w-full h-12 p-0 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-[0.3em] rounded-xl backdrop-blur-sm">
                                <Link href="/guidelines" className="flex items-center justify-between px-6 w-full">
                                    <span>Transmit Guidelines</span>
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

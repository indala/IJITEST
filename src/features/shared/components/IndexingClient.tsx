import { Search, Database, ChevronRight, Globe, Layers, BarChart3, Binary, CheckCircle2, ExternalLink, ShieldCheck, Sparkles, BookCheck } from 'lucide-react';
import RoadmapSection from '@/features/indexing/components/RoadmapSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

import type { JournalSettings } from '@/db/types';

interface IndexingClientProps {
    settings: JournalSettings;
}

export default function IndexingClient({ settings }: IndexingClientProps) {
    const journalShortName = settings.journalShortName || 'IJITEST';

    const activeAgencies = [
        {
            name: "OpenAIRE",
            category: "European Scholarly Hub",
            status: "Indexed & Disclosed",
            isCompleted: true,
            desc: "European open-access research infrastructure connecting publication metadata and scholarly outputs globally.",
            link: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453",
            identifier: "PID: 10.5281/zenodo.22016453",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        },
        {
            name: "Zenodo (CERN / OpenAIRE)",
            category: "Digital Repository",
            status: "Deposited & Persistent",
            isCompleted: true,
            desc: "Global open science repository hosted by CERN providing permanent digital object identifiers (DOIs) and preservation.",
            link: "https://doi.org/10.5281/zenodo.22016453",
            identifier: "DOI: 10.5281/zenodo.22016453",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        },
        {
            name: "ISSN International Centre (ROAD)",
            category: "Scholarly Serial Directory",
            status: "E-ISSN: 3139-6887",
            isCompleted: true,
            desc: "Official international standard serial registration recognized by UNESCO for open access scientific resources.",
            link: "https://road.issn.org",
            identifier: "E-ISSN: 3139-6887",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        },
        {
            name: "CiteFactor",
            category: "Academic Journal Indexing",
            status: "Registered Partner",
            isCompleted: false,
            desc: "Indexing service providing access to quality scholarly publications to expand international citations.",
            identifier: "Evaluation in Progress",
            badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        },
        {
            name: "OpenAlex",
            category: "Global Research Graph",
            status: "Registered Partner",
            isCompleted: false,
            desc: "Next-generation, fully open global index of millions of scholarly publications, authors, and citation networks.",
            identifier: "Evaluation in Progress",
            badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        },
        {
            name: "Google Scholar",
            category: "Citation & Discovery",
            status: "Active Crawling",
            isCompleted: false,
            desc: "Scholarly search engine indexing peer-reviewed papers with full-text search and citation metrics.",
            identifier: "Automated Discovery",
            badgeColor: "bg-blue-100 text-blue-800 border-blue-200"
        }
    ];

    const techSpecs = [
        { title: "SJIF Evaluation", desc: "Annual impact factor assessment by SJIF for scientific validation.", icon: BarChart3 },
        { title: "OAI-PMH", desc: "Standard metadata harvesting interface for global repository integration.", icon: Globe },
        { title: "XML Delivery", desc: "Automated indexing feeding systems via high-quality JATS XML.", icon: Binary },
        { title: "Archival Sync", desc: "Long-term preservation orchestration with Encrypted Cloud Storage and ROAD.", icon: Layers }
    ];

    return (
        <section className="container-responsive py-12 sm:py-24 2xl:py-32">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-20 2xl:gap-24">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-16 xl:space-y-20">
                    {/* Vision Statement */}
                    <Card className="bg-[#000066] p-8 sm:p-12 2xl:p-16 rounded-2xl text-white relative overflow-hidden shadow-vip">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                            <div className="w-16 h-16 xl:w-20 xl:h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shrink-0">
                                <Search className="w-8 h-8 xl:w-10 xl:h-10 text-white" />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-white">Global Indexing & Research Visibility</h2>
                                <p className="text-sm xl:text-base 2xl:text-lg text-white/80 border-l-2 border-white/20 pl-6 m-0 leading-relaxed">
                                    &quot;Our strategic mandate is to ensure that every validated innovation published in {journalShortName} reaches the global scientific community through premier indexing hubs and open-access databases.&quot;
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Verified Indexing & Partner Agencies */}
                    <section className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-l-4 border-secondary pl-3">
                            <div>
                                <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-serif font-bold text-primary m-0 flex items-center gap-2">
                                    <Sparkles className="size-6 text-secondary" />
                                    Indexing & Digital Repositories
                                </h2>
                                <p className="text-xs xl:text-sm text-muted-foreground mt-1 mb-0">
                                    Verified scholarly indexing databases, repositories, and academic identifiers.
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 self-start sm:self-auto flex items-center gap-1.5 px-3 py-1 font-semibold">
                                <ShieldCheck className="size-4 text-emerald-600" />
                                Verified Open Access
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {activeAgencies.map((agency, idx) => (
                                <Card 
                                    key={idx} 
                                    className="p-6 rounded-2xl border border-border/70 bg-card hover:border-primary/30 hover:shadow-vip-hover transition-all duration-300 flex flex-col justify-between group"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                                                    {agency.category}
                                                </span>
                                                <h3 className="text-lg xl:text-xl font-serif font-bold text-primary group-hover:text-secondary transition-colors m-0">
                                                    {agency.name}
                                                </h3>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border shadow-xs ${agency.badgeColor}`}>
                                                {agency.isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {agency.status}
                                            </span>
                                        </div>

                                        <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed m-0">
                                            {agency.desc}
                                        </p>
                                    </div>

                                    <div className="mt-5 pt-3 border-t border-border/40 flex items-center justify-between">
                                        <span className="text-[11px] font-mono text-primary/70 font-semibold truncate max-w-[180px]">
                                            {agency.identifier}
                                        </span>
                                        {agency.link ? (
                                            <a 
                                                href={agency.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 text-xs font-bold text-[#000066] hover:text-secondary transition-colors"
                                            >
                                                <span>Verify Record</span>
                                                <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                        ) : (
                                            <span className="text-[11px] text-muted-foreground/60 italic">In Process</span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Integrated Roadmap */}
                    <RoadmapSection />

                    {/* Technical Standards */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3 border-l-4 border-secondary pl-3">
                            <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-serif font-bold text-primary m-0 flex items-center gap-2">
                                <BookCheck className="size-6 text-primary" />
                                Technical Protocols & Interoperability
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 2xl:gap-6">
                            {techSpecs.map((spec, idx) => (
                                <Card key={idx} className="p-6 xl:p-8 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 xl:w-12 xl:h-12 bg-primary/5 rounded-lg flex items-center justify-center text-primary mb-4">
                                        <spec.icon className="w-5 h-5 xl:w-6 xl:h-6" />
                                    </div>
                                    <h3 className="text-base xl:text-lg font-semibold text-primary mb-2">{spec.title}</h3>
                                    <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed m-0">
                                        {spec.desc}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-10 lg:sticky lg:top-24">
                    <div className="group/widget transition-transform duration-500 hover:-translate-y-1">
                        <div className="bg-white/50 backdrop-blur-sm p-2 rounded-3xl border border-primary/10 shadow-sm">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <section className="space-y-4">
                         <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                              <p className="text-xs sm:text-sm font-bold tracking-wider text-muted-foreground uppercase m-0">Call For Papers</p>
                         </div>
                        <Card className="p-6 xl:p-8 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all space-y-4">
                            <div className="w-10 h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                                <Database className="w-5 h-5" />
                            </div>
                            <h3 className="text-base xl:text-lg font-semibold text-primary m-0">Inaugural 2026 Volume</h3>
                            <p className="text-xs xl:text-sm text-muted-foreground leading-relaxed m-0">
                                Submissions for our 2026 volume are open. All accepted manuscripts receive rapid double-blind peer review, DOI assignment, and international repository indexing.
                            </p>
                            <Button asChild className="w-full h-11 bg-[#000066] hover:bg-[#000088] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-sm">
                                <Link href="/submit">Submit Manuscript</Link>
                            </Button>
                        </Card>
                    </section>

                    <Card className="p-6 xl:p-8 bg-[#000066] rounded-xl text-white relative overflow-hidden shadow-md">
                        <div className="relative z-10 space-y-3">
                            <h3 className="text-base xl:text-lg font-semibold text-white m-0">COPE Publication Ethics</h3>
                            <p className="text-white/70 text-xs xl:text-sm leading-relaxed m-0">
                                Our editorial process adheres strictly to the Committee on Publication Ethics (COPE) standards to safeguard research integrity.
                            </p>
                            <div className="pt-2">
                                <Link href="/ethics" className="inline-flex items-center gap-1.5 text-xs font-bold text-white hover:text-secondary transition-colors uppercase tracking-wider">
                                    View Ethics Guide <ChevronRight className="w-3.5 h-3.5" />
                                </Link>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </section>
    );
}

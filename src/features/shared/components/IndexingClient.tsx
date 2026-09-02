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
            name: "ISSN International Centre (ROAD)",
            category: "Scholarly Serial Directory",
            status: "Registered",
            isCompleted: true,
            desc: "Official international standard serial registration recognized by UNESCO for open access scientific resources.",
            link: "https://road.issn.org",
            identifier: "E-ISSN: 3139-6887",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        },
        {
            name: "OpenAIRE",
            category: "European Scholarly Hub",
            status: "Indexed & Disclosed",
            isCompleted: true,
            desc: "European open-access research infrastructure connecting publication metadata and scholarly outputs globally.",
            link: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453",
            identifier: "OpenAIRE Verified",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
        },
        {
            name: "Zenodo (CERN / OpenAIRE)",
            category: "Open Science Repository",
            status: "Deposited & Persistent",
            isCompleted: true,
            desc: "Global open science repository hosted by CERN providing permanent digital object identifiers (DOIs) and preservation.",
            link: "https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest",
            identifier: "Community Repository",
            badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200"
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
            name: "CiteFactor",
            category: "Academic Journal Indexing",
            status: "Registered Partner",
            isCompleted: false,
            desc: "Indexing service providing access to quality scholarly publications to expand international citations.",
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
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                    {/* Vision Statement */}
                    <Card className="bg-[#000066] p-5 sm:p-6 rounded-2xl text-white relative overflow-hidden shadow-vip">
                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-5">
                            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shrink-0">
                                <Search className="w-6 h-6 text-white" />
                            </div>
                            <div className="space-y-1.5">
                                <h2 className="font-semibold text-white m-0">Global Indexing & Research Visibility</h2>
                                <p className="text-white/80 border-l-2 border-white/20 pl-4 m-0 leading-relaxed">
                                    &quot;Our strategic mandate is to ensure that every validated innovation published in {journalShortName} reaches the global scientific community through premier indexing hubs and open-access databases.&quot;
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Verified Indexing & Partner Agencies */}
                    <section className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-4 border-secondary pl-3">
                            <div>
                                <h2 className="m-0 flex items-center gap-2">
                                    <Sparkles className="size-5 text-secondary" />
                                    Indexing & Digital Repositories
                                </h2>
                                <p className="text-muted-foreground mt-0.5 mb-0">
                                    Verified scholarly indexing databases, repositories, and academic identifiers.
                                </p>
                            </div>
                            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 self-start sm:self-auto flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold">
                                <ShieldCheck className="size-3.5 text-emerald-600" />
                                Verified Open Access
                            </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {activeAgencies.map((agency, idx) => (
                                <Card 
                                    key={idx} 
                                    className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/30 transition-all duration-200 flex flex-col justify-between group"
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <span className="text-meta uppercase block mb-0.5">
                                                    {agency.category}
                                                </span>
                                                <h3 className="group-hover:text-secondary transition-colors m-0">
                                                    {agency.name}
                                                </h3>
                                            </div>
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-label border shadow-2xs ${agency.badgeColor}`}>
                                                {agency.isCompleted && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                                                {agency.status}
                                            </span>
                                        </div>

                                        <p className="text-muted-foreground m-0">
                                            {agency.desc}
                                        </p>
                                    </div>

                                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                                        <span className="text-meta text-primary/70 font-semibold truncate max-w-[180px]">
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
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        ) : (
                                            <span className="text-[10px] text-muted-foreground/60 italic">In Process</span>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Integrated Roadmap */}
                    <RoadmapSection />

                    {/* Technical Standards */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-secondary pl-3">
                            <h2 className="m-0 flex items-center gap-2">
                                <BookCheck className="size-5 text-primary" />
                                Technical Protocols & Interoperability
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {techSpecs.map((spec, idx) => (
                                <Card key={idx} className="p-4 border-border/50 bg-card rounded-xl hover:border-primary/20 transition-all">
                                    <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary mb-2.5">
                                        <spec.icon className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-primary mb-1 m-0">{spec.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed m-0">
                                        {spec.desc}
                                    </p>
                                </Card>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Utilities */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <div>
                        <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                            <TrackManuscriptWidget />
                        </div>
                    </div>

                    <Card className="p-4 border-border/70 bg-card rounded-xl space-y-3 shadow-2xs">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/5 rounded-lg flex items-center justify-center text-primary">
                                <Database className="w-4 h-4" />
                            </div>
                            <h3 className="text-primary m-0">Inaugural 2026 Volume</h3>
                        </div>
                        <p className="text-muted-foreground leading-relaxed m-0">
                            Submissions are open. All accepted manuscripts receive rapid double-blind peer review, permanent digital DOI assignment, and international repository indexing.
                        </p>
                        <Button asChild size="sm" className="w-full h-8 bg-[#000066] hover:bg-[#000088] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-xs">
                            <Link href="/submit">Submit Manuscript</Link>
                        </Button>
                    </Card>

                    <Card className="p-4 bg-[#000066] rounded-xl text-white space-y-2 shadow-md">
                        <h3 className="text-white m-0">COPE Publication Ethics</h3>
                        <p className="text-white/80 leading-relaxed m-0">
                            Our editorial process adheres strictly to the Committee on Publication Ethics (COPE) standards to safeguard research integrity.
                        </p>
                        <div className="pt-1">
                            <Link href="/ethics" className="inline-flex items-center gap-1 text-xs font-bold text-secondary hover:text-white transition-colors">
                                <span>View Ethics Guide</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>
                    </Card>
                </aside>
            </div>
        </section>
    );
}

'use client'

import { FileText, ChevronRight, Search, BadgeCheck, ExternalLink } from 'lucide-react';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import PaperCard from '@/features/archives/components/PaperCard';
import { Button } from "@/components/ui/button";
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { useLatestIssuePapers, useArchivePapers } from '@/hooks/queries/usePublic';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { type PublishedPaperUI } from '@/db/types';

interface ArchivesClientProps {
    mode?: 'current' | 'archive' | undefined;
    initialPapers?: PublishedPaperUI[] | undefined;
}

export default function ArchivesClient({ mode = 'archive', initialPapers }: ArchivesClientProps) {
    const currentIssueQuery = useLatestIssuePapers({
        enabled: mode === 'current',
    });
    const archiveQuery = useArchivePapers({
        enabled: mode === 'archive',
    });

    const queryData = mode === 'current' ? currentIssueQuery.data : archiveQuery.data;
    const isLoading = (mode === 'current' ? currentIssueQuery.isLoading : archiveQuery.isLoading) && !initialPapers?.length;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

    const filteredPapers = useMemo(() => {
        const papers: PublishedPaperUI[] = queryData || initialPapers || [];
        return papers.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.authorsList && p.authorsList.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            (p.keywords && p.keywords.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.paperId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [queryData, initialPapers, searchQuery]);

    const hierarchy = useMemo(() => {
        const volumes: Record<number, {
            volume: number;
            year: number;
            issues: Record<number, {
                volume: number;
                issue: number;
                monthRange: string;
                year: number;
                papers: PublishedPaperUI[];
                key: string;
            }>
        }> = {};

        filteredPapers.forEach(paper => {
            const vol = paper.volumeNumber ?? 0;
            const iss = paper.issueNumber ?? 0;
            const year = paper.publicationYear ?? 0;
            const month = paper.monthRange || '';
            const issueKey = `v${vol}-i${iss}`;

            if (!volumes[vol]) {
                volumes[vol] = { volume: vol, year, issues: {} };
            }
            if (!volumes[vol].issues[iss]) {
                volumes[vol].issues[iss] = {
                    volume: vol,
                    issue: iss,
                    monthRange: month,
                    year,
                    papers: [],
                    key: issueKey
                };
            }
            volumes[vol].issues[iss].papers.push(paper);
        });

        return Object.values(volumes).sort((a, b) => b.volume - a.volume).map(v => ({
            ...v,
            issues: Object.values(v.issues).sort((a, b) => b.issue - a.issue)
        }));
    }, [filteredPapers]);

    // Derive the active issue key. 
    // If user has explicitly selected an issue that is still in the results, use it.
    // Otherwise, default to the first available issue in the current hierarchy.
    const effectiveIssueKey = useMemo(() => {
        if (selectedIssue) {
            const exists = hierarchy.some(v => v.issues.some(i => i.key === selectedIssue));
            if (exists) return selectedIssue;
        }
        return hierarchy[0]?.issues[0]?.key || null;
    }, [hierarchy, selectedIssue]);

    const activeIssue = useMemo(() => {
        for (const vol of hierarchy) {
            const iss = vol.issues.find(i => i.key === effectiveIssueKey);
            if (iss) return iss;
        }
        return null;
    }, [hierarchy, effectiveIssueKey]);

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="mb-4">
                <div className="max-w-4xl mx-auto space-y-3">
                    <InputGroup className="h-10 rounded-xl border-border bg-card shadow-2xs focus-within:ring-primary/20 transition-all">
                        <InputGroupAddon align="inline-start" className="pl-3.5">
                            <Search className="w-4 h-4 text-primary/40" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search archives by Title, Author, or Keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-xs sm:text-sm placeholder:text-muted-foreground/40 border-none bg-transparent"
                        />
                    </InputGroup>

                    {/* Open Science Repository & Digital Preservation Banner */}
                    <div className="p-3 sm:p-3.5 rounded-xl bg-primary/5 border border-primary/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="px-1.5 py-0.5 rounded bg-emerald-700 text-white font-mono font-bold text-[10px] uppercase tracking-wider">
                                    Open Access Archive
                                </span>
                                <span className="font-bold text-primary text-xs">Official Digital Repository & Preservation</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed m-0 text-xs">
                                All published issues and research papers are permanently preserved under persistent digital identifiers (DOI: 10.5281/zenodo.22016453) and open-science repositories.
                            </p>
                        </div>
                        <a
                            href="https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-primary/20 text-[#000066] hover:text-secondary text-xs font-bold shadow-2xs transition-all shrink-0"
                        >
                            <span>Repository Community</span>
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Sticky Navigation Tree */}
                <aside className="lg:col-span-4 order-2 lg:order-2 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar scroll-smooth">
                    <div className="space-y-4 pr-1">
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                                <p className="text-label text-muted-foreground m-0">Archive Navigation</p>
                            </div>

                            <div className="space-y-2">
                                {hierarchy.map((vol) => (
                                    <div key={vol.volume} className="space-y-1">
                                        <div className="flex items-center gap-2 px-2.5 py-1.5 bg-muted/30 rounded-lg border border-border/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            <span className="text-xs sm:text-sm font-bold text-secondary">Volume {vol.volume} ({vol.year})</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-0.5 pl-3">
                                            {vol.issues.map((iss) => (
                                                <button
                                                    key={iss.key}
                                                    onClick={() => setSelectedIssue(iss.key)}
                                                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs sm:text-sm transition-all group ${effectiveIssueKey === iss.key
                                                            ? 'bg-[#000066] text-white shadow-xs font-semibold'
                                                            : 'hover:bg-primary/5 text-muted-foreground border border-transparent hover:border-primary/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-1.5">
                                                        <ChevronRight className={`w-3 h-3 transition-transform ${effectiveIssueKey === iss.key ? 'rotate-90 text-white/70' : 'text-primary/30 group-hover:translate-x-0.5'}`} />
                                                        <span>
                                                            Issue {iss.issue} — {iss.monthRange} {iss.year}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {hierarchy.length === 0 && !isLoading && (
                                    <div className="p-6 text-center border-2 border-dashed rounded-xl border-border bg-muted/10 opacity-60">
                                        <p className="font-medium text-muted-foreground m-0">No archives matching search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                                <TrackManuscriptWidget />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Scrollable Main Content */}
                <div className="lg:col-span-8 order-1 lg:order-1">
                    {isLoading ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="w-10 h-10 border-3 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <div className="space-y-0.5">
                                <p className="font-bold text-foreground m-0">Loading Repository</p>
                                <p className="text-muted-foreground m-0">Synchronizing digital archives...</p>
                            </div>
                        </div>
                    ) : activeIssue ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-primary/2 border border-primary/10 rounded-xl relative overflow-hidden group">
                                <div className="space-y-0.5 relative z-10">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs px-2 py-0.5 rounded flex items-center gap-1 font-semibold">
                                            <BadgeCheck className="size-3.5" />
                                            Current Selection
                                        </Badge>
                                        <span className="text-label text-muted-foreground/70">Verified Repository</span>
                                    </div>
                                    <h2 className="m-0">
                                        Volume {activeIssue.volume} Issue {activeIssue.issue}
                                    </h2>
                                    <p className="text-muted-foreground font-medium italic m-0">
                                        {activeIssue.monthRange} {activeIssue.year}
                                    </p>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-3.5">
                                {activeIssue.papers.map((paper) => (
                                    <PaperCard key={paper.paperId} paper={paper} basePath={mode === 'current' ? '/current-issue' : '/archives'} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed border py-12 text-center rounded-2xl border-border bg-muted/20">
                            <div className="max-w-md mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/30 shadow-xs">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="space-y-1">
                                    <h2 className="text-foreground m-0">Archive Empty</h2>
                                    <p className="text-muted-foreground px-6 leading-relaxed m-0">
                                        No papers have been archived for the selected criteria yet. Start by exploring our current issue or submitting your manuscript.
                                    </p>
                                </div>
                                <div className="flex justify-center pt-2">
                                    <Button asChild size="sm" className="h-8 px-4 bg-[#000066] hover:bg-[#000088] text-white rounded-lg font-bold text-xs uppercase tracking-wider shadow-xs transition-all border-none">
                                        <Link href="/submit" className="flex items-center gap-1.5">
                                            Submit Paper <ChevronRight className="w-3.5 h-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </section>
    );
}

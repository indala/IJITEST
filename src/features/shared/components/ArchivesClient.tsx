'use client'

import { FileText, ChevronRight, Search, BadgeCheck } from 'lucide-react';
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
    initialPapers: PublishedPaperUI[];
    mode?: 'current' | 'archive';
}

export default function ArchivesClient({ initialPapers, mode = 'archive' }: ArchivesClientProps) {
    const currentIssueQuery = useLatestIssuePapers(mode === 'current' ? initialPapers : []);
    const archiveQuery = useArchivePapers(mode === 'archive' ? initialPapers : []);

    const isLoading = mode === 'current' ? currentIssueQuery.isLoading : archiveQuery.isLoading;
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIssue, setSelectedIssue] = useState<string | null>(null);

    const filteredPapers = useMemo(() => {
        const papers = (mode === 'current' ? currentIssueQuery.data : archiveQuery.data) || [];
        return papers.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.authorsList && p.authorsList.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()))) ||
            (p.keywords && p.keywords.toLowerCase().includes(searchQuery.toLowerCase())) ||
            p.paperId.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [mode, currentIssueQuery.data, archiveQuery.data, searchQuery]);

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
        <section className="px-5 mx-auto section-padding">
            <div className="mb-12">
                <div className="max-w-4xl mx-auto">
                    <InputGroup className="h-12 xl:h-14 rounded-2xl border-border bg-card shadow-sm ring-1 ring-primary/5 focus-within:ring-primary/20 transition-all">
                        <InputGroupAddon align="inline-start" className="pl-4">
                            <Search className="w-5 h-5 text-primary/30" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search archives by Title, Author, or Keywords..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="text-sm xl:text-base placeholder:text-muted-foreground/30 border-none bg-transparent"
                        />
                    </InputGroup>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
                {/* Sticky Navigation Tree */}
                <aside  className="lg:col-span-4 order-2 lg:order-2 lg:sticky lg:top-24 max-h-[calc(100vh-120px)] overflow-y-auto no-scrollbar scroll-smooth">
                    <div className="space-y-8 pr-2">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 pl-3 border-l-2 border-primary">
                                <p className="text-sm 2xl:text-lg font-bold tracking-wider text-muted-foreground uppercase m-0">Archive Navigation</p>
                            </div>

                            <div className="space-y-3">
                                {hierarchy.map((vol) => (
                                    <div key={vol.volume} className="space-y-2">
                                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/50">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        <span className="text-lg 2xl:text-2xl  font-bold text-secondary">Volume {vol.volume} ({vol.year})</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 pl-4">
                                            {vol.issues.map((iss) => (
                                                <button
                                                    key={iss.key}
                                                    onClick={() => setSelectedIssue(iss.key)}
                                                    className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-left text-lg 2xl:text-xl transition-all group ${effectiveIssueKey === iss.key
                                                            ? 'bg-green-600 text-white shadow-md shadow-primary/20 scale-[1.02]'
                                                            : 'hover:bg-primary/5 text-muted-foreground border border-transparent hover:border-primary/10'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <ChevronRight className={`w-3.5 h-3.5 2xl:w-5 2xl:h-5 transition-transform ${effectiveIssueKey === iss.key ? 'rotate-90 text-white/50' : 'text-primary/30 group-hover:translate-x-0.5'}`} />
                                                        <span className="font-medium">
                                                            Issue {iss.issue} — {iss.monthRange} {iss.year}
                                                        </span>
                                                    </div>

                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {hierarchy.length === 0 && !isLoading && (
                                    <div className="p-12 text-center border-2 border-dashed rounded-2xl border-border bg-muted/10 opacity-60">
                                        <p className="text-sm 2xl:text-base font-medium text-muted-foreground">No archives matching search.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="hidden lg:block space-y-4">
                            <div className="flex items-center gap-2 pl-3 border-l-2 border-primary/20">
                                <p className="text-sm 2xl:text-base font-bold tracking-wider text-muted-foreground uppercase m-0">Support</p>
                            </div>
                            <div className="p-5 bg-card border border-border/50 rounded-2xl shadow-sm">
                                <TrackManuscriptWidget />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Scrollable Main Content */}
                <div className="lg:col-span-8 order-1 lg:order-1">
                    {isLoading ? (
                        <div className="py-24 flex flex-col items-center justify-center gap-6 text-center">
                            <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold text-foreground">Loading Repository</p>
                                <p className="text-sm 2xl:text-base text-muted-foreground">Synchronizing digital archives...</p>
                            </div>
                        </div>
                    ) : activeIssue ? (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-primary/2 border border-primary/5 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                                <div className="space-y-1 relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-sm 2xl:text-base px-2 rounded flex items-center gap-1">
                                            <BadgeCheck className="size-4" />
                                            Current Selection
                                        </Badge>
                                        <span className="text-xs 2xl:text-sm text-muted-foreground/60 font-medium uppercase tracking-widest">Verified Repository</span>
                                    </div>
                                    <h2 className="text-2xl font-serif font-black text-primary m-0">
                                        Volume {activeIssue.volume} Issue {activeIssue.issue}
                                    </h2>
                                    <p className="text-sm xl:text-xl text-muted-foreground font-medium italic">
                                        {activeIssue.monthRange} {activeIssue.year}
                                    </p>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 gap-6">
                                {activeIssue.papers.map((paper) => (
                                    <PaperCard key={paper.paperId} paper={paper} basePath={mode === 'current' ? '/current-issue' : '/archives'} />
                                ))}
                            </div>
                        </div>
                    ) : (
                        <Card className="border-dashed border-2 py-16 xl:py-24 text-center rounded-3xl border-border bg-muted/20">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="w-20 h-20 rounded-3xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/20 shadow-sm">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <div className="space-y-3">
                                    <h2 className="text-xl xl:text-3xl font-serif font-bold text-foreground">Archive Empty</h2>
                                    <p className="text-sm text-muted-foreground px-12 leading-relaxed opacity-80">
                                        No papers have been archived for the selected criteria yet. Start by exploring our current issue or submitting your manuscript.
                                    </p>
                                </div>
                                <div className="flex justify-center gap-3">
                                    <Button asChild className="h-11 px-8 bg-[#000066] text-white rounded-xl font-bold text-sm 2xl:text-base uppercase tracking-wider shadow-lg shadow-primary/20 hover:scale-105 transition-all border-none">
                                        <Link href="/submit" className="flex items-center gap-2">
                                            Submit Paper <ChevronRight className="w-4 h-4" />
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

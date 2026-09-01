'use client';

import { useState, useEffect, useRef, useMemo, useDeferredValue } from 'react';
import Link from 'next/link';
import { Search, Archive, Layers, BookOpen, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import type { PublishedPaperUI } from '@/db/types';

interface VolumeData {
    volumeNumber: number;
    year: number;
    issuesCount: number;
    papersCount: number;
}

interface ArchivesSearchProps {
    papers: PublishedPaperUI[];
    volumes: VolumeData[];
}

export default function ArchivesSearch({ papers, volumes }: ArchivesSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Defer the search query to keep typing responsive
    const deferredSearchQuery = useDeferredValue(searchQuery);

    // Filter papers client-side based on deferred search query
    const filteredPapers = useMemo(() => {
        if (!deferredSearchQuery.trim()) return [];
        const query = deferredSearchQuery.toLowerCase().trim();
        return papers.filter((p) =>
            p.title.toLowerCase().includes(query) ||
            p.authorName.toLowerCase().includes(query) ||
            (p.authorsList && p.authorsList.some(a => a.toLowerCase().includes(query))) ||
            (p.keywords && p.keywords.toLowerCase().includes(query)) ||
            p.paperId.toLowerCase().includes(query)
        );
    }, [papers, deferredSearchQuery]);

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="space-y-6">
            {/* Search Input Container with Relative Positioning for Dropdown Placement */}
            <div ref={searchRef} className="relative max-w-4xl mx-auto z-30">
                <InputGroup className="h-10 rounded-xl border-border bg-card shadow-2xs focus-within:ring-primary/20 transition-all">
                    <InputGroupAddon align="inline-start" className="pl-3.5">
                        <Search className="w-4 h-4 text-primary/40" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search articles by Title, Author, Keywords, or Paper ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="text-xs sm:text-sm placeholder:text-muted-foreground/40 border-none bg-transparent"
                    />
                    {searchQuery && (
                        <InputGroupAddon align="inline-end" className="pr-3.5">
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setIsDropdownOpen(false);
                                }}
                                className="text-xs font-bold text-[#000066]/60 hover:text-[#000066] cursor-pointer"
                            >
                                Clear
                            </button>
                        </InputGroupAddon>
                    )}
                </InputGroup>

                {/* Floating Autocomplete Dropdown */}
                {isDropdownOpen && searchQuery.trim() !== '' && (
                    <div 
                        data-lenis-prevent
                        className="absolute top-full left-0 right-0 z-50 mt-1.5 max-h-80 overflow-y-auto bg-card border border-border/80 shadow-xl rounded-xl p-3 space-y-2 scroll-smooth animate-in fade-in slide-in-from-top-1 duration-150"
                    >
                        <div className="flex items-center justify-between pb-1.5 border-b border-border/40 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                            <span>Search Results</span>
                            <span>{filteredPapers.length} matching {filteredPapers.length === 1 ? 'article' : 'articles'}</span>
                        </div>

                        {filteredPapers.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {filteredPapers.map((paper) => {
                                    const volumeSegment = `volume${paper.volumeNumber || 0}`;
                                    const issueSegment = `issue${paper.issueNumber || 0}`;
                                    const paperUrl = `/archives/${volumeSegment}/${issueSegment}/${paper.paperId}`;

                                    return (
                                        <Link
                                            key={paper.paperId}
                                            href={paperUrl}
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block py-2 hover:bg-muted/10 px-2 rounded-lg transition-colors group text-left"
                                        >
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-full border border-secondary/10">
                                                        Vol {paper.volumeNumber}, Issue {paper.issueNumber}
                                                    </span>
                                                    <span className="text-[10px] font-mono font-medium text-muted-foreground">
                                                        {paper.paperId}
                                                    </span>
                                                </div>
                                                <h4 className="group-hover:text-secondary transition-colors m-0 line-clamp-2 leading-snug">
                                                    {paper.title}
                                                </h4>
                                                <p className="text-meta text-muted-foreground m-0 truncate">
                                                    {paper.authorsList && paper.authorsList.length > 0
                                                        ? paper.authorsList.join(', ')
                                                        : paper.authorName}
                                                </p>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="py-6 text-center text-xs font-medium text-muted-foreground">
                                No publications match your search query.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Published Volumes Section */}
            <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-2 border-l-4 border-secondary pl-3">
                    <h2 className="m-0">Published Volumes</h2>
                </div>

                {volumes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {volumes.map((vol) => (
                            <Link
                                key={vol.volumeNumber}
                                href={`/archives/volume${vol.volumeNumber}`}
                                className="group block"
                            >
                                <Card className="h-full border-border/70 bg-card shadow-2xs hover:border-primary/30 transition-all duration-200 rounded-xl relative overflow-hidden">
                                    <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full relative z-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                                    <Archive className="size-4" />
                                                </div>
                                                <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/15 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                                    Year {vol.year}
                                                </Badge>
                                            </div>

                                            <div className="space-y-0.5">
                                                <h3 className="group-hover:text-secondary transition-colors m-0">
                                                    Volume {vol.volumeNumber}
                                                </h3>
                                                <p className="text-muted-foreground m-0">
                                                    Digital publications for the year {vol.year}.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-t-border/40 flex items-center justify-between text-xs">
                                            <div className="flex items-center gap-3 text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1">
                                                    <Layers className="size-3.5 text-primary/40" />
                                                    {vol.issuesCount} {vol.issuesCount === 1 ? 'Issue' : 'Issues'}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="size-3.5 text-primary/40" />
                                                    {vol.papersCount} {vol.papersCount === 1 ? 'Paper' : 'Papers'}
                                                </span>
                                            </div>
                                            <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-xs">
                                                View Issues <ChevronRight className="size-3.5" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed border py-10 text-center rounded-2xl border-border bg-muted/20">
                        <div className="max-w-md mx-auto space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/40 shadow-xs">
                                <Archive className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-foreground m-0">No Volumes Found</h3>
                                <p className="text-muted-foreground px-4 m-0">
                                    There are no published volumes available in the repository at this time.
                                </p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

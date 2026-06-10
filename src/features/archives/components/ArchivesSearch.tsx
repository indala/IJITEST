'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
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

    // Filter papers client-side based on search query
    const filteredPapers = useMemo(() => {
        if (!searchQuery.trim()) return [];
        const query = searchQuery.toLowerCase().trim();
        return papers.filter((p) =>
            p.title.toLowerCase().includes(query) ||
            p.authorName.toLowerCase().includes(query) ||
            (p.authorsList && p.authorsList.some(a => a.toLowerCase().includes(query))) ||
            (p.keywords && p.keywords.toLowerCase().includes(query)) ||
            p.paperId.toLowerCase().includes(query)
        );
    }, [papers, searchQuery]);

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
        <div className="space-y-12">
            {/* Search Input Container with Relative Positioning for Dropdown Placement */}
            <div ref={searchRef} className="relative max-w-4xl mx-auto z-30">
                <InputGroup className="h-12 xl:h-14 rounded-2xl border-border bg-card shadow-sm ring-1 ring-primary/5 focus-within:ring-primary/20 transition-all">
                    <InputGroupAddon align="inline-start" className="pl-4">
                        <Search className="w-5 h-5 text-primary/30" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search articles by Title, Author, Keywords, or Paper ID..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setIsDropdownOpen(true);
                        }}
                        onFocus={() => setIsDropdownOpen(true)}
                        className="text-sm xl:text-base placeholder:text-muted-foreground/30 border-none bg-transparent"
                    />
                    {searchQuery && (
                        <InputGroupAddon align="inline-end" className="pr-4">
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
                        className="absolute top-full left-0 right-0 z-50 mt-2 max-h-96 overflow-y-auto bg-card border border-border/80 shadow-2xl rounded-2xl p-4 space-y-3 scroll-smooth animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        <div className="flex items-center justify-between pb-2 border-b border-border/40 text-xs font-bold tracking-wider text-muted-foreground uppercase">
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
                                            className="block py-3 hover:bg-muted/10 px-2 rounded-lg transition-colors group text-left"
                                        >
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] xl:text-xs font-bold text-secondary bg-secondary/5 px-2 py-0.5 rounded-full border border-secondary/10">
                                                        Vol {paper.volumeNumber}, Issue {paper.issueNumber}
                                                    </span>
                                                    <span className="text-[10px] xl:text-xs font-mono font-medium text-muted-foreground">
                                                        {paper.paperId}
                                                    </span>
                                                </div>
                                                <h4 className="text-sm xl:text-base font-serif font-bold text-primary group-hover:text-secondary transition-colors m-0 line-clamp-2 leading-snug">
                                                    {paper.title}
                                                </h4>
                                                <p className="text-[11px] xl:text-xs text-muted-foreground m-0 truncate font-medium">
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
                            <div className="py-8 text-center text-sm font-medium text-muted-foreground">
                                No publications match your search query.
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Published Volumes Section (Stays intact, layered under the search popover) */}
            <div className="space-y-8 relative z-10">
                <div className="flex items-center gap-3 border-l-4 border-secondary pl-3">
                    <h2 className="text-2xl font-serif font-black text-primary m-0">Published Volumes</h2>
                </div>

                {volumes.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {volumes.map((vol) => (
                            <Link
                                key={vol.volumeNumber}
                                href={`/archives/volume${vol.volumeNumber}`}
                                className="group block"
                            >
                                <Card className="h-full border-border/60 bg-card shadow-sm hover:shadow-vip-hover transition-all duration-300 group-hover:scale-[1.02] border-t-2 border-t-transparent hover:border-t-secondary/60 rounded-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                                    <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                                                    <Archive className="size-6" />
                                                </div>
                                                <Badge variant="outline" className="bg-secondary/5 text-secondary border-secondary/15 text-xs font-semibold px-2 py-0.5 rounded-full">
                                                    Year {vol.year}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <h3 className="text-xl xl:text-2xl font-serif font-bold text-primary group-hover:text-secondary transition-colors m-0">
                                                    Volume {vol.volumeNumber}
                                                </h3>
                                                <p className="text-sm text-muted-foreground m-0">
                                                    Digital publications for the year {vol.year}.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-t-border/40 flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-4 text-muted-foreground font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Layers className="size-4 text-primary/40" />
                                                    {vol.issuesCount} {vol.issuesCount === 1 ? 'Issue' : 'Issues'}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <BookOpen className="size-4 text-primary/40" />
                                                    {vol.papersCount} {vol.papersCount === 1 ? 'Paper' : 'Papers'}
                                                </span>
                                            </div>
                                            <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                                                View Issues <ChevronRight className="size-4" />
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <Card className="border-dashed border-2 py-16 text-center rounded-3xl border-border bg-muted/20">
                        <div className="max-w-md mx-auto space-y-4">
                            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/30 shadow-sm">
                                <Archive className="w-8 h-8" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-serif font-bold text-foreground m-0">No Volumes Found</h3>
                                <p className="text-sm text-muted-foreground px-6">
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

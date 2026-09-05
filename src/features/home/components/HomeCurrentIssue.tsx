import Link from 'next/link';
import { BookOpen, Download, Eye, ExternalLink, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { PublishedPaperUI, Issue } from '@/db/types';

interface HomeCurrentIssueProps {
    latestIssue: Issue | null;
    papers: PublishedPaperUI[];
}

export default function HomeCurrentIssue({ latestIssue, papers }: HomeCurrentIssueProps) {
    if (!latestIssue || !papers || papers.length === 0) {
        return null;
    }

    const vol = latestIssue.volumeNumber;
    const iss = latestIssue.issueNumber;
    const month = latestIssue.monthRange;
    const year = latestIssue.year;

    return (
        <section className="space-y-4" aria-labelledby="current-issue-heading">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-primary/10">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="p-1.5 bg-primary/5 rounded-lg text-primary">
                            <BookOpen className="w-4 h-4" />
                        </span>
                        <h2 id="current-issue-heading" className="m-0">
                            Current Issue — Volume {vol}, Issue {iss}
                        </h2>
                    </div>
                    <p className="text-muted-foreground m-0 font-medium">
                        {month} {year} • Published Peer-Reviewed Research Articles
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Gold Open Access
                    </Badge>
                    <Link
                        href="/current-issue"
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary transition-colors"
                    >
                        <span>View Issue Table</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Papers List */}
            <div className="grid grid-cols-1 gap-3">
                {papers.map((paper: PublishedPaperUI) => {
                    const articleUrl = `/current-issue/volume${vol}/issue${iss}/${paper.paperId}`;
                    const authors = Array.isArray(paper.authorsList) && paper.authorsList.length > 0
                        ? paper.authorsList.join(', ')
                        : paper.authorName;

                    return (
                        <Card 
                            key={paper.paperId}
                            className="p-4 rounded-xl border border-border/70 bg-card hover:border-primary/30 hover:shadow-xs transition-all duration-200 group"
                        >
                            <div className="flex flex-col gap-2.5">
                                {/* Title & Paper ID Badge */}
                                <div className="flex items-start justify-between gap-3">
                                    <Link href={articleUrl} className="flex-1">
                                        <h3 className="group-hover:text-secondary transition-colors leading-snug m-0">
                                            {paper.title}
                                        </h3>
                                    </Link>
                                    <span className="px-2 py-0.5 rounded bg-muted/60 text-meta uppercase shrink-0">
                                        {paper.paperId}
                                    </span>
                                </div>

                                {/* Authors & Page Info */}
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs 2xl:text-sm text-foreground/80">
                                    <div className="flex items-center gap-1">
                                        <span className="font-semibold text-primary/70">Authors:</span>
                                        <span className="font-medium text-foreground/90">{authors}</span>
                                    </div>
                                    {paper.startPage && paper.endPage && (
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <span>•</span>
                                            <span>Pages: {paper.startPage}–{paper.endPage}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Abstract Snippet */}
                                {paper.abstract && (
                                    <p className="text-muted-foreground line-clamp-2 leading-relaxed m-0">
                                        {paper.abstract}
                                    </p>
                                )}

                                {/* Action Buttons Strip */}
                                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Button asChild size="sm" variant="default" className="h-7 px-3 2xl:h-8 2xl:px-4 text-xs 2xl:text-sm bg-primary hover:bg-primary/90 rounded-md">
                                            <Link href={articleUrl} className="flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                <span>Read Article</span>
                                            </Link>
                                        </Button>

                                        {paper.filePath && (
                                            <Button asChild size="sm" variant="outline" className="h-7 px-3 2xl:h-8 2xl:px-4 text-xs 2xl:text-sm border-primary/20 text-primary hover:bg-primary/5 rounded-md">
                                                <a href={paper.filePath} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                                                    <span>PDF</span>
                                                </a>
                                            </Button>
                                        )}
                                    </div>

                                    {/* Digital Preservation Badge */}
                                    <a
                                        href={paper.doi ? `https://doi.org/${paper.doi}` : "https://doi.org/10.5281/zenodo.22016453"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[11px] 2xl:text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        <span>DOI: {paper.doi || "10.5281/zenodo.22016453"}</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                                    </a>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Bottom Repository Link */}
            <div className="p-3.5 2xl:p-5 rounded-xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs 2xl:text-sm">
                <div className="flex items-center gap-2 text-primary font-medium text-center sm:text-left">
                    <Sparkles className="w-4 h-4 text-secondary shrink-0" />
                    <span>All published articles are preserved with permanent DOIs across Open Science Repositories & OpenAIRE discovery hub.</span>
                </div>
                <Button asChild size="sm" variant="outline" className="h-7 px-3 2xl:h-8 2xl:px-4 text-xs 2xl:text-sm border-primary/20 text-primary hover:bg-primary/5 shrink-0">
                    <Link href="/archives">Browse All Volumes ({year})</Link>
                </Button>
            </div>
        </section>
    );
}


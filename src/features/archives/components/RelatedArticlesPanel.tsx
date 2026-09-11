import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { RelatedArticle } from "@/db/types";

interface RelatedArticlesPanelProps {
    articles: RelatedArticle[];
}

export function RelatedArticlesPanel({ articles }: RelatedArticlesPanelProps) {
    if (!articles || articles.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4 pt-6 mt-6 border-t border-border/60">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-foreground m-0">Related Articles</h3>
                        <p className="text-[11px] text-muted-foreground m-0">
                            Recommended based on authorship, section domain, and shared keywords
                        </p>
                    </div>
                </div>
                <Badge variant="outline" className="text-[10px] text-primary border-primary/20">
                    OJS Similarity Engine
                </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {articles.map((item) => {
                    const articleHref = `/archives/volume${item.volumeNumber}/issue${item.issueNumber}/${item.paperId}`;
                    return (
                        <Card
                            key={item.paperId}
                            className="bg-card hover:bg-muted/30 transition-all border border-border/60 shadow-2xs group flex flex-col justify-between"
                        >
                            <CardContent className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-1">
                                        <Badge
                                            variant="secondary"
                                            className="text-[9px] px-1.5 py-0 font-medium bg-secondary/10 text-secondary border border-secondary/20"
                                        >
                                            {item.matchReason}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                                            Vol {item.volumeNumber} ({item.issueNumber})
                                        </span>
                                    </div>

                                    <Link
                                        href={articleHref}
                                        className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug"
                                    >
                                        {item.title}
                                    </Link>

                                    <p className="text-[11px] text-muted-foreground line-clamp-1">
                                        {item.coAuthors && item.coAuthors.length > 0
                                            ? item.coAuthors.map((a) => a.name).join(", ")
                                            : item.authorName}
                                    </p>
                                </div>

                                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs">
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                        ID: {item.paperId}
                                    </span>
                                    <Link
                                        href={articleHref}
                                        className="text-[11px] font-bold text-primary group-hover:underline flex items-center gap-1"
                                    >
                                        Read Article
                                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

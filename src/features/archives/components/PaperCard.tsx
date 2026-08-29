import { memo } from 'react';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { PublishedPaperUI } from '@/db/types';

interface PaperCardProps {
    paper: PublishedPaperUI;
    basePath?: string;
}

const PaperCard = memo(function PaperCard({ paper, basePath = '/archives' }: PaperCardProps) {
    const hasVolumeAndIssue = !!(paper.volumeNumber && paper.issueNumber);
    const volumeSegment = `volume${paper.volumeNumber || 0}`;
    const issueSegment = `issue${paper.issueNumber || 0}`;
    const paperUrl = hasVolumeAndIssue 
        ? `${basePath}/${volumeSegment}/${issueSegment}/${paper.paperId}`
        : '#';

    return (
        <Card className="font-sans border-border/70 shadow-2xs hover:border-primary/30 transition-all rounded-xl relative">
            <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col gap-3">
                    <div className="space-y-2">
                        <Link href={paperUrl} className="group-hover:text-secondary transition-colors">
                            <h3 className="cursor-pointer m-0 leading-snug hover:text-secondary transition-colors">
                                {paper.title}
                            </h3>
                        </Link>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1.5 font-medium">
                                <span className="font-bold text-[#000066]">Publication:</span>
                                <span>Volume {paper.volumeNumber}, Issue {paper.issueNumber} {paper.monthRange ? `(${paper.monthRange} ${paper.publicationYear})` : `(${paper.publicationYear})`}</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-bold text-[#000066]">Authors:</span>
                            <p className="text-foreground/90 font-medium m-0">
                                {paper.authorsList && paper.authorsList.length > 0 
                                    ? paper.authorsList.join(', ') 
                                    : paper.authorName}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/40">
                        <span className="text-meta font-semibold">
                            ID: {paper.paperId}
                        </span>

                        <Button asChild size="sm" className="bg-[#000066] hover:bg-[#000088] text-white shadow-xs rounded-lg transition-all h-7 px-3 text-xs font-bold">
                            <Link href={paperUrl} className="flex items-center gap-1.5">
                                <Eye className="size-3.5" />
                                <span>View Article</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

export default PaperCard;

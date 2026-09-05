import { Newspaper, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Issue } from '@/db/types';

interface AnnouncementsWidgetProps {
    latestIssue?: Issue | null;
}

export default function AnnouncementsWidget({ latestIssue }: AnnouncementsWidgetProps) {
    const currentStatus = latestIssue ? {
        volume: latestIssue.volumeNumber,
        issue: latestIssue.issueNumber,
        date: `${latestIssue.monthRange} ${latestIssue.year}`
    } : {
        volume: 1,
        issue: 5,
        date: "August 2026"
    };

    return (
        <div>
            <Card className="border border-border/70 bg-card rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-2.5 2xl:space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                            <Newspaper className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </div>
                        <CardTitle className="text-primary m-0">Call for Submissions</CardTitle>
                    </div>
                    <Badge variant="outline" className="h-5 2xl:h-6 px-1.5 2xl:px-2 py-0 text-primary border-primary/20 bg-primary/5 flex items-center gap-1 text-[10px] 2xl:text-xs">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Open</span>
                    </Badge>
                </div>

                <div className="p-2.5 2xl:p-3.5 bg-muted/40 rounded-lg border border-border/50 space-y-1.5 2xl:space-y-2">
                    <p className="text-foreground/80 leading-snug m-0">
                        Volume {currentStatus.volume}, Issue {currentStatus.issue} ({currentStatus.date}) is currently accepting manuscripts.
                    </p>
                    <Link href="/submit" className="text-xs 2xl:text-sm font-bold text-secondary flex items-center gap-1 hover:text-primary transition-colors no-underline">
                        <span>Submit Online</span>
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            </Card>
        </div>
    );
}


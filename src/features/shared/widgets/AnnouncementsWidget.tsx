import { Megaphone, ChevronRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Issue, Announcement } from '@/db/types';

interface AnnouncementsWidgetProps {
    latestIssue?: Issue | null;
    announcements?: Announcement[] | null;
}

const TYPE_TAGS: Record<string, { label: string; color: string }> = {
    call_for_papers: { label: "Call for Papers", color: "bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300" },
    news: { label: "News", color: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300" },
    editorial_update: { label: "Notice", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
    event: { label: "Event", color: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default function AnnouncementsWidget({ latestIssue, announcements }: AnnouncementsWidgetProps) {
    const hasCustomAnnouncements = announcements && announcements.length > 0;

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
            <Card className="border border-border/70 bg-card rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <Megaphone className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </div>
                        <CardTitle className="text-primary m-0 text-base 2xl:text-lg">Announcements</CardTitle>
                    </div>
                    <Badge variant="outline" className="h-5 2xl:h-6 px-1.5 2xl:px-2 py-0 text-primary border-primary/20 bg-primary/5 flex items-center gap-1 text-[10px] 2xl:text-xs">
                        <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                        </span>
                        <span>Live</span>
                    </Badge>
                </div>

                {hasCustomAnnouncements ? (
                    <div className="space-y-2.5">
                        {announcements.slice(0, 3).map((item) => {
                            const tag = TYPE_TAGS[item.type] || TYPE_TAGS["news"]!;
                            return (
                                <div
                                    key={item.id}
                                    className="p-2.5 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/70 transition-colors space-y-1 group"
                                >
                                    <div className="flex items-center justify-between gap-1">
                                        <Badge variant="secondary" className={`text-[9px] px-1.5 py-0 font-medium ${tag.color}`}>
                                            {tag.label}
                                        </Badge>
                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                    <Link
                                        href={`/announcements/${item.id}`}
                                        className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 block"
                                    >
                                        {item.title}
                                    </Link>
                                    {item.descriptionShort && (
                                        <p className="text-[11px] text-muted-foreground line-clamp-1">
                                            {item.descriptionShort}
                                        </p>
                                    )}
                                </div>
                            );
                        })}

                        <div className="pt-1 flex items-center justify-between border-t border-border/40 text-xs">
                            <Link
                                href="/announcements"
                                className="font-semibold text-primary hover:underline flex items-center gap-1"
                            >
                                <span>View all notices</span>
                                <ChevronRight className="w-3 h-3" />
                            </Link>
                            <Link
                                href="/author/submissions/submit"
                                className="text-muted-foreground hover:text-foreground text-[11px]"
                            >
                                Submit paper
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="p-2.5 2xl:p-3.5 bg-muted/40 rounded-lg border border-border/50 space-y-1.5 2xl:space-y-2">
                        <p className="text-foreground/80 leading-snug m-0 text-xs 2xl:text-sm">
                            Volume {currentStatus.volume}, Issue {currentStatus.issue} ({currentStatus.date}) is currently accepting manuscripts.
                        </p>
                        <Link href="/author/submissions/submit" className="text-xs 2xl:text-sm font-bold text-secondary flex items-center gap-1 hover:text-primary transition-colors no-underline">
                            <span>Submit Online</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
}

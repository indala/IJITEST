import { Megaphone, ChevronRight, Calendar, Bell } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import type { Issue, Announcement } from '@/db/types';

interface AnnouncementsWidgetProps {
    latestIssue?: Issue | null;
    announcements?: Announcement[] | null;
}

const TYPE_TAGS: Record<string, { label: string; badgeClass: string }> = {
    call_for_papers: {
        label: "Call for Papers",
        badgeClass: "bg-secondary/10 text-secondary border-secondary/25",
    },
    news: {
        label: "Journal News",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
    },
    editorial_update: {
        label: "Notice",
        badgeClass: "bg-secondary/10 text-secondary border-secondary/20",
    },
    event: {
        label: "Event",
        badgeClass: "bg-orange/10 text-orange border-orange/20",
    },
};

function AnnouncementsWidget({ latestIssue, announcements }: AnnouncementsWidgetProps) {
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
        <div className="bg-card p-3 sm:p-3.5 2xl:p-4 rounded-xl border border-border/70 shadow-2xs space-y-2.5 2xl:space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <Megaphone className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </div>
                    <h3 className="card-title-brand m-0">
                        Announcements
                    </h3>
                </div>
                <span className="badge-brand inline-flex items-center gap-1 px-1.5 py-0.5">
                    <span className="relative flex h-1 w-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500" />
                    </span>
                    <span>Live</span>
                </span>
            </div>

            {/* Content */}
            {hasCustomAnnouncements ? (
                <div className="space-y-1.5 2xl:space-y-2">
                    {announcements.slice(0, 3).map((item) => {
                        const tag = TYPE_TAGS[item.type] || TYPE_TAGS["news"]!;
                        const formattedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                        });

                        return (
                            <Link
                                key={item.id}
                                href={`/announcements/${item.id}`}
                                className="block p-2 2xl:p-2.5 bg-muted/40 hover:bg-muted/70 rounded-lg border border-border/50 hover:border-primary/20 transition-all space-y-1 group no-underline"
                            >
                                <div className="flex items-center justify-between gap-1.5">
                                    <span className={`inline-block px-1 py-0.5 rounded border text-[10px] leading-tight ${tag.badgeClass}`}>
                                        {tag.label}
                                    </span>
                                    <span className="text-[10px] leading-tight text-muted-foreground flex items-center gap-1 shrink-0">
                                        <Calendar className="w-2.5 h-2.5 text-muted-foreground/70" />
                                        <span>{formattedDate}</span>
                                    </span>
                                </div>
                                <h4 className="font-semibold text-[13px] 2xl:text-sm text-foreground group-hover:text-primary transition-colors line-clamp-1 m-0 leading-snug">
                                    {item.title}
                                </h4>
                                {item.descriptionShort && (
                                    <p className="text-[11px] 2xl:text-xs text-muted-foreground line-clamp-1 m-0 leading-snug">
                                        {item.descriptionShort}
                                    </p>
                                )}
                            </Link>
                        );
                    })}

                    {/* Footer Links */}
                    <div className="pt-1.5 flex items-center justify-between border-t border-border/50">
                        <Link
                            href="/announcements"
                            className="font-semibold text-primary hover:text-secondary transition-colors inline-flex items-center gap-1 group no-underline"
                        >
                            <span>View all notices</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/submit"
                            className="text-caption text-muted-foreground hover:text-primary font-medium transition-colors no-underline"
                        >
                            Submit paper
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="p-3 2xl:p-4 bg-muted/40 rounded-lg border border-border/50 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5">
                            <Bell className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-foreground font-medium leading-snug m-0">
                                Volume {currentStatus.volume}, Issue {currentStatus.issue} ({currentStatus.date})
                            </p>
                            <p className="text-caption m-0">
                                Submissions are currently open for peer review and publication.
                            </p>
                        </div>
                    </div>
                    <div className="pt-1.5 flex items-center justify-between border-t border-border/40">
                        <Link
                            href="/submit"
                            className="font-bold text-secondary hover:text-primary transition-colors inline-flex items-center gap-1 no-underline group"
                        >
                            <span>Submit Manuscript</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                            href="/announcements"
                            className="text-caption text-muted-foreground hover:text-primary font-medium transition-colors no-underline"
                        >
                            All Notices
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}

export default memo(AnnouncementsWidget);

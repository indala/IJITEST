import type { LucideIcon } from 'lucide-react';
import { FileText, Search, ShieldAlert } from 'lucide-react';
import type { TrackedManuscript } from "@/db/types";

interface MilestoneProps {
    title: string;
    date?: string;
    description: string;
    icon: LucideIcon;
    active: boolean;
    last?: boolean;
}

function Milestone({ title, date, description, icon: Icon, active, last }: MilestoneProps) {
    return (
        <div className="flex gap-4 relative items-start group/milestone">
            {!last && (
                <div className="absolute left-5 2xl:left-6 top-10 2xl:top-12 bottom-0 w-px bg-border/50" />
            )}

            <div className={`relative z-10 w-10 h-10 2xl:w-12 2xl:h-12 rounded-lg flex items-center justify-center shrink-0 border transition-all duration-500 ${active
                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20 animate-pulse-slow'
                : 'bg-muted/20 text-muted-foreground border-border/50 group-hover/milestone:border-muted-foreground/30'
                }`}>
                <Icon className="w-4 h-4 2xl:w-5 2xl:h-5 transition-transform duration-500 group-hover/milestone:scale-110" />
            </div>

            <div className="pb-8 pt-1 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <h3 className={`m-0 transition-colors duration-300 ${active ? 'text-primary' : 'text-muted-foreground/50 group-hover/milestone:text-muted-foreground/80'}`}>{title}</h3>
                    {date && (
                        <span className="text-meta text-muted-foreground bg-muted/50 px-2 py-0.5 2xl:px-3 2xl:py-1 rounded border border-border/50 transition-colors duration-300 group-hover/milestone:border-muted-foreground/20">
                            {new Date(date).toLocaleDateString()}
                        </span>
                    )}
                </div>
                <p className={`leading-relaxed transition-colors duration-300 ${active ? 'text-muted-foreground' : 'text-muted-foreground/30 group-hover/milestone:text-muted-foreground/50'}`}>{description}</p>
            </div>
        </div>
    );
}

export function MilestoneTimeline({ manuscript }: { manuscript: TrackedManuscript }) {
    const isStepActive = (step: 'submitted' | 'review' | 'decision') => {
        const s = manuscript.status;
        if (step === 'submitted') return true;
        if (step === 'review') return ['underReview', 'revisionRequested', 'accepted', 'rejected', 'paymentPending', 'published'].includes(s);
        if (step === 'decision') return ['accepted', 'rejected', 'paymentPending', 'published'].includes(s);
        return false;
    };

    return (
        <section className="space-y-4 pt-4 border-t border-border/50 max-w-3xl">
            <div className="flex items-center gap-2 mb-2">
                <p className="text-label text-muted-foreground m-0">Manuscript Timeline</p>
            </div>

            <div className="space-y-3">
                <Milestone
                    title="Manuscript Received"
                    {...(manuscript.submittedAt ? { date: new Date(manuscript.submittedAt).toISOString() } : {})}
                    description="Initial submission received and queued for editorial screening."
                    icon={FileText}
                    active={isStepActive('submitted')}
                />
                <Milestone
                    title="Peer Review"
                    {...(manuscript.reviewStartedAt ? { date: new Date(manuscript.reviewStartedAt).toISOString() } : {})}
                    description="Assigned to experts for technical evaluation."
                    icon={Search}
                    active={isStepActive('review')}
                />
                <Milestone
                    title="Editorial Decision"
                    {...((manuscript.status !== 'underReview' && manuscript.status !== 'submitted' && manuscript.updatedAt) ? { date: new Date(manuscript.updatedAt).toISOString() } : {})}
                    description={
                        manuscript.status === 'accepted' ? "Accepted for publication in the upcoming volume." :
                        manuscript.status === 'rejected' ? "Returned following scientific evaluation." :
                        manuscript.status === 'published' ? "Published and indexed in digital archives." :
                        "Awaiting final verification."
                    }
                    icon={ShieldAlert}
                    active={isStepActive('decision')}
                    last
                />
            </div>
        </section>
    );
}

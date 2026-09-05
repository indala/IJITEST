import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import type { TrackedManuscript } from "@/db/types";
import { MilestoneTimeline } from "./MilestoneTimeline";

interface TrackedManuscriptCardProps {
    manuscript: TrackedManuscript;
}

export function TrackedManuscriptCard({ manuscript }: TrackedManuscriptCardProps) {
    return (
        <div className="space-y-6">
            <div className="p-4 sm:p-6 bg-card border border-border/70 rounded-xl shadow-2xs relative overflow-hidden border-t-4 border-t-secondary">
                <section className="mb-6 space-y-4 relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <Badge className="bg-primary/5 text-primary border-primary/20 px-4 h-8 2xl:h-9 2xl:px-5 text-label rounded-lg">
                                Status: {manuscript.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                            <span className="text-meta bg-muted/50 px-2.5 py-0.5 rounded border border-border/50">
                                ID: {manuscript.paperId}
                            </span>
                        </div>
                        <div className="text-meta text-muted-foreground flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> {manuscript.submittedAt ? new Date(manuscript.submittedAt).getFullYear() : 'N/A'}
                        </div>
                    </div>

                    <h2 className="max-w-4xl border-l-3 border-secondary/30 pl-3.5 m-0">
                        {manuscript.title}
                    </h2>

                    <div className="flex items-center gap-3 text-primary pt-1">
                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                            <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-label text-muted-foreground m-0">Corresponding Author</p>
                            <p className="font-semibold text-foreground m-0">{manuscript.authorName}</p>
                        </div>
                    </div>
                </section>

                <MilestoneTimeline manuscript={manuscript} />

                {/* Action Cards */}
                <div className="mt-4 pt-4 border-t border-border/50">
                    {manuscript.status === 'accepted' && (
                        <div className="bg-primary p-4 sm:p-5 rounded-xl text-white relative overflow-hidden shadow-md">
                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white shrink-0">
                                            <CreditCard className="w-4 h-4" />
                                        </div>
                                        <h3 className="m-0 leading-none text-white">Access Fees Required</h3>
                                    </div>
                                    <p className="text-white/70 leading-relaxed max-w-2xl border-l-2 border-white/20 pl-3.5 m-0">
                                        Your manuscript has been approved. Please finalize the Article Processing Charge (APC) to proceed with publication.
                                    </p>
                                </div>
                                <Button asChild size="sm" className="h-8 px-4 bg-white text-primary hover:bg-white/90 rounded-lg shadow-xs transition-all shrink-0 text-label">
                                    <Link href={`/payment/${manuscript.paperId}`} className="flex items-center gap-1.5">
                                        Process Payment <CreditCard className="w-3.5 h-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {manuscript.status === 'published' && (
                        <div className="bg-emerald-50 p-4 sm:p-5 rounded-xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="space-y-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-2.5">
                                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 shrink-0">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-emerald-800 m-0">Fully Indexed</h3>
                                </div>
                                <p className="text-emerald-700/80 max-w-2xl m-0">
                                    Your research is now live in the global scientific archives.
                                </p>
                            </div>
                            <Button asChild size="sm" className="h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-all shrink-0 text-label">
                                <Link href={`/archives`} className="flex items-center gap-1.5">
                                    View in Archive <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {manuscript.status === 'rejected' && (
                        <div className="p-4 sm:p-5 bg-destructive/5 border border-destructive/10 rounded-xl space-y-3">
                            <div className="space-y-1">
                                <h3 className="font-bold text-destructive m-0">Editorial Decision</h3>
                                <p className="text-muted-foreground max-w-3xl leading-relaxed m-0">
                                    The committee has concluded its review. While the current version does not meet publication criteria, please see the feedback below.
                                </p>
                            </div>
                            {manuscript.reviewerFeedback && manuscript.reviewerFeedback.length > 0 && (
                                <div className="grid grid-cols-1 gap-2.5">
                                    {manuscript.reviewerFeedback.filter((f): f is string => f !== null).map((feedback, i) => (
                                        <div key={i} className="p-3.5 bg-card border border-border/50 rounded-lg text-body-sm leading-relaxed flex gap-3">
                                            <div className="w-1 h-auto bg-destructive/20 rounded-full shrink-0" />
                                            <div className="italic">&quot;{feedback}&quot;</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import {
    FilePlus2,
    UserCheck,
    Users,
    ClipboardCheck,
    RefreshCcw,
    UploadCloud,
    Gavel,
    FileText,
    CheckCircle2,
    ShieldCheck,
    Globe,
    Calendar,
    Tag,
    AlertOctagon,
    FileSignature,
    CircleDot,
    RefreshCw,
    Loader2,
    Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSubmissionEvents } from "@/actions/event-log";
import type { SubmissionEventWithActor } from "@/db/types";

interface SubmissionTimelineProps {
    submissionId: number;
    initialEvents?: SubmissionEventWithActor[];
    className?: string;
}

interface EventConfig {
    label: string;
    icon: React.ElementType;
    color: string;
    bgBadge: string;
}

const EVENT_CONFIGS: Record<string, EventConfig> = {
    submission_created: {
        label: "Manuscript Submitted",
        icon: FilePlus2,
        color: "text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-950/40",
        bgBadge: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
    },
    editor_assigned: {
        label: "Editor Assigned",
        icon: UserCheck,
        color: "text-indigo-500 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40",
        bgBadge: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300",
    },
    reviewer_assigned: {
        label: "Reviewer Assigned",
        icon: Users,
        color: "text-purple-500 border-purple-200 bg-purple-50 dark:bg-purple-950/40",
        bgBadge: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
    },
    review_submitted: {
        label: "Peer Review Submitted",
        icon: ClipboardCheck,
        color: "text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40",
        bgBadge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    revision_requested: {
        label: "Revision Requested",
        icon: RefreshCcw,
        color: "text-amber-500 border-amber-200 bg-amber-50 dark:bg-amber-950/40",
        bgBadge: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    },
    revision_submitted: {
        label: "Revision Submitted",
        icon: UploadCloud,
        color: "text-cyan-500 border-cyan-200 bg-cyan-50 dark:bg-cyan-950/40",
        bgBadge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
    },
    decision_recorded: {
        label: "Editorial Decision",
        icon: Gavel,
        color: "text-violet-500 border-violet-200 bg-violet-50 dark:bg-violet-950/40",
        bgBadge: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
    },
    galley_proof_requested: {
        label: "Galley Proof Dispatched",
        icon: FileText,
        color: "text-sky-500 border-sky-200 bg-sky-50 dark:bg-sky-950/40",
        bgBadge: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
    },
    galley_proof_responded: {
        label: "Galley Proof Approved",
        icon: CheckCircle2,
        color: "text-emerald-500 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/40",
        bgBadge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    },
    copyright_uploaded: {
        label: "Copyright Agreement Uploaded",
        icon: ShieldCheck,
        color: "text-teal-500 border-teal-200 bg-teal-50 dark:bg-teal-950/40",
        bgBadge: "bg-teal-500/10 text-teal-700 dark:text-teal-300",
    },
    paper_published: {
        label: "Manuscript Published",
        icon: Globe,
        color: "text-emerald-600 border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40",
        bgBadge: "bg-emerald-600/15 text-emerald-800 dark:text-emerald-300 font-bold",
    },
    paper_scheduled: {
        label: "Scheduled for Publication",
        icon: Calendar,
        color: "text-indigo-600 border-indigo-200 bg-indigo-50 dark:bg-indigo-950/40",
        bgBadge: "bg-indigo-600/10 text-indigo-700 dark:text-indigo-300",
    },
    doi_assigned: {
        label: "DOI Allocated",
        icon: Tag,
        color: "text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/40",
        bgBadge: "bg-blue-600/10 text-blue-700 dark:text-blue-300",
    },
    paper_retracted: {
        label: "Paper Retracted",
        icon: AlertOctagon,
        color: "text-rose-600 border-rose-300 bg-rose-50 dark:bg-rose-950/40",
        bgBadge: "bg-rose-600/15 text-rose-800 dark:text-rose-300 font-bold",
    },
    corrigendum_issued: {
        label: "Corrigendum Issued",
        icon: FileSignature,
        color: "text-amber-600 border-amber-300 bg-amber-50 dark:bg-amber-950/40",
        bgBadge: "bg-amber-600/15 text-amber-800 dark:text-amber-300 font-bold",
    },
};

const DEFAULT_EVENT_CONFIG: EventConfig = {
    label: "Editorial Event",
    icon: CircleDot,
    color: "text-muted-foreground border-border bg-muted/40",
    bgBadge: "bg-muted text-muted-foreground",
};

export function SubmissionTimeline({
    submissionId,
    initialEvents,
    className = "",
}: SubmissionTimelineProps) {
    const [events, setEvents] = useState<SubmissionEventWithActor[]>(initialEvents || []);
    const [isLoading, setIsLoading] = useState(!initialEvents);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchEvents = async (showRefreshing = false) => {
        if (showRefreshing) setIsRefreshing(true);
        try {
            const res = await getSubmissionEvents(submissionId);
            if (res.success && res.data) {
                setEvents(res.data);
            }
        } catch (error) {
            console.error("Fetch submission events error:", error);
        } finally {
            setIsLoading(false);
            if (showRefreshing) setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!initialEvents) {
            fetchEvents();
        }
    }, [submissionId, initialEvents]);

    const formatEventTime = (dateInput: Date | string | null | undefined) => {
        if (!dateInput) return "Recently";
        const d = new Date(dateInput);
        return d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card className={`border-border/60 shadow-xs bg-card ${className}`}>
            <CardHeader className="p-5 pb-3 border-b border-border/40 flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" />
                        Submission History & Audit Timeline
                    </CardTitle>
                    <CardDescription className="text-xs">
                        Chronological record of editorial workflows, author submissions, peer reviews, and status changes.
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => fetchEvents(true)}
                    disabled={isRefreshing || isLoading}
                    className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                    title="Refresh Timeline"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
            </CardHeader>

            <CardContent className="p-5 pt-6">
                {isLoading ? (
                    <div className="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <p className="text-xs font-medium">Loading event timeline...</p>
                    </div>
                ) : events.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground space-y-1">
                        <Clock className="w-8 h-8 mx-auto opacity-30 mb-2" />
                        <p className="text-xs font-semibold">No timeline events recorded yet.</p>
                        <p className="text-[11px] opacity-70">
                            Milestone events such as reviews, editorial decisions, and revisions will be displayed here.
                        </p>
                    </div>
                ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
                        {events.map((evt, idx) => {
                            const config = EVENT_CONFIGS[evt.eventType] || DEFAULT_EVENT_CONFIG;
                            const IconComponent = config.icon;

                            return (
                                <div key={evt.id || idx} className="relative group">
                                    {/* Timeline Marker Dot / Icon */}
                                    <div className={`absolute -left-6 top-0.5 w-6 h-6 rounded-full border flex items-center justify-center shadow-xs transition-transform group-hover:scale-110 ${config.color}`}>
                                        <IconComponent className="w-3 h-3" />
                                    </div>

                                    {/* Event Body */}
                                    <div className="space-y-1 bg-muted/20 border border-border/40 rounded-xl p-3.5 transition-colors hover:bg-muted/40">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className={`text-[10px] font-bold tracking-tight px-2 py-0.5 ${config.bgBadge}`}>
                                                    {config.label}
                                                </Badge>
                                                {evt.actor?.role ? (
                                                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                                        [{evt.actor.role}]
                                                    </span>
                                                ) : null}
                                            </div>
                                            <span className="text-[11px] text-muted-foreground font-mono">
                                                {formatEventTime(evt.createdAt)}
                                            </span>
                                        </div>

                                        <p className="text-xs text-foreground font-medium m-0 leading-relaxed pt-1">
                                            {evt.description}
                                        </p>

                                        {/* Actor Name if present */}
                                        {evt.actor?.fullName ? (
                                            <p className="text-[11px] text-muted-foreground m-0">
                                                By: <span className="font-semibold text-foreground/80">{evt.actor.fullName}</span>
                                            </p>
                                        ) : null}

                                        {/* Metadata attributes if any */}
                                        {Boolean(evt.metadata) && typeof evt.metadata === 'object' && Object.keys(evt.metadata as object).length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-border/30 mt-2">
                                                {Object.entries(evt.metadata as Record<string, unknown>).map(([key, val]) => {
                                                    if (val === null || val === undefined || typeof val === 'object') return null;
                                                    return (
                                                        <span
                                                            key={key}
                                                            className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-card border border-border/50 text-muted-foreground"
                                                        >
                                                            {key}: <strong className="text-foreground">{String(val)}</strong>
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

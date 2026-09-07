import React from 'react';
import {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download, Shield, ShieldCheck, Box, HardDrive, BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NumberTicker } from '@/components/ui/number-ticker';

import type { Application } from '@/db/types';
import { cn, formatDate } from '@/lib/utils';
import {
    DashboardStatsSkeleton,
    DashboardSubmissionsSkeleton,
    DashboardHealthSkeleton
} from './DashboardSkeletons';

export interface Stat {
    label: string;
    value: number | string;
    icon: string;
    variant: string;
    prefix?: string;
}

export interface HealthMetric {
    label: string;
    icon: string;
    status: string;
    value: string;
}

const ICON_MAP: Record<string, React.ElementType> = {
    FileStack, Users, Activity, AlertCircle, TrendingUp, ArrowRight, UserPlus, FileText, Clock, ExternalLink,
    CreditCard, ClipboardList, Download, Shield, ShieldCheck, Box, HardDrive, BookOpen
};

export interface DashboardUser {
    id: string;
    email?: string | null;
    role: string;
    name?: string | null;
    profile?: {
        fullName: string | null;
    } | null;
}

export interface DashboardSubmission {
    id: number;
    paperId: string;
    status: string;
    submittedAt: Date | string | null;
    title: string | null;
    authorName?: string | null;
}

export interface DashboardStaff {
    id: string;
    email: string | null;
    role: string;
    fullName?: string | null;
}

export interface DashboardRegistryProps {
    role: 'admin' | 'editor' | 'author';
    user: DashboardUser | null | undefined;
    stats?: Stat[];
    statsSlot?: React.ReactNode;
    recentSubmissions?: DashboardSubmission[];
    recentSubmissionsSlot?: React.ReactNode;
    mySubmissions?: DashboardSubmission[];
    mySubmissionsSlot?: React.ReactNode;
    healthMetrics?: HealthMetric[];
    healthMetricsSlot?: React.ReactNode;
    pendingApplications?: Application[];
    pendingApplicationsSlot?: React.ReactNode;
    allStaff?: DashboardStaff[];
    allStaffSlot?: React.ReactNode;
    extraActions?: React.ReactNode;
    recentSubmissionsTitle?: string;
    children?: React.ReactNode;
    metricsLabels?: {
        pubRate: string;
        revRate: string;
    };
    percentages?: {
        pub: number;
        rev: number;
    };
    activityOverviewSlot?: React.ReactNode;
}

/* Modular Subcomponents for Parallel Suspense Streaming */

export function DashboardStatsGrid({ stats }: { stats: Stat[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
                <Card key={stat.label} className="border-border/50 shadow-xs bg-card transition-all rounded-xl">
                    <CardContent className="p-4 sm:p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border border-border/5 ${
                                stat.variant === 'primary' ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-muted-foreground'
                            }`}>
                                <div className="[&>svg]:w-5 [&>svg]:h-5">
                                    {(() => {
                                        const Icon = ICON_MAP[stat.icon] || Box;
                                        return <Icon />;
                                    })()}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-xl lg:text-2xl font-bold text-foreground">
                                {typeof stat.value === 'number' ? <NumberTicker value={stat.value} prefix={stat.prefix || ""} /> : stat.value}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function DashboardRecentSubmissionsCard({
    recentSubmissions,
    recentSubmissionsTitle = "Submissions",
    role
}: {
    recentSubmissions: DashboardSubmission[];
    recentSubmissionsTitle?: string;
    role: string;
}) {
    return (
        <Card className="border-border/70 shadow-2xs bg-card rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between p-3.5 sm:p-4 border-b border-border/70">
                <CardTitle className="card-title-brand">
                    {recentSubmissionsTitle}
                </CardTitle>
                <Button asChild variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-lg text-xs font-semibold h-8 px-2.5">
                    <Link href={`/${role}/submissions`} className="flex items-center gap-1">
                        View all <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                    {recentSubmissions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-muted-foreground/50">No submissions found.</div>
                    ) : recentSubmissions.map((sub) => (
                        <Link
                            href={`/${role}/submissions/${sub.id}`}
                            key={sub.id}
                            className="flex items-center justify-between px-3.5 py-2.5 sm:py-3 hover:bg-muted/30 transition-all group"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-7 rounded bg-muted/60 flex flex-col items-center justify-center text-[9px] font-bold text-muted-foreground border border-border/60 shrink-0">
                                    <span className="text-primary">{sub.paperId?.split('-').pop()}</span>
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors mb-0.5">{sub.title}</h4>
                                    <p className="text-meta">
                                        {sub.authorName} • {formatDate(sub.submittedAt)}
                                    </p>
                                </div>
                            </div>
                            <Badge className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border-none ${
                                sub.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                sub.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                'badge-brand'}`}>
                                {sub.status?.replace('_', ' ')}
                            </Badge>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardApplicationsCard({ pendingApplications }: { pendingApplications: Application[] }) {
    if (pendingApplications.length === 0) return null;
    return (
        <Card className="border-border/70 shadow-2xs bg-card rounded-xl">
            <CardHeader className="p-3.5 sm:p-4 border-b border-border/70 bg-muted/20">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-primary" /> Pending Applications
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                    {pendingApplications.map((app) => (
                        <div key={app.id} className="p-3.5 space-y-2">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="badge-brand text-[10px] font-medium h-5 rounded px-2">{app.type}</Badge>
                                <span className="text-meta">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : ''}</span>
                            </div>
                            <h5 className="text-sm font-medium">{app.fullName}</h5>
                            <Button asChild size="sm" variant="outline" className="w-full h-8 text-xs rounded-lg hover:bg-muted font-medium">
                                <Link href="/admin/reviewer-applications">Review</Link>
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export function DashboardMySubmissionsGrid({ mySubmissions }: { mySubmissions: DashboardSubmission[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mySubmissions.length === 0 ? (
                <Card className="md:col-span-2 lg:col-span-3 border-dashed border bg-muted/20 py-12 text-center rounded-xl border-border/70">
                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-card border border-border/70 flex items-center justify-center mx-auto">
                            <FileText className="w-6 h-6 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm text-muted-foreground px-6">Submit and track your own manuscripts from the portal.</p>
                        <Button asChild className="btn-primary">
                            <Link href="/submit">Submit Paper</Link>
                        </Button>
                    </div>
                </Card>
            ) : mySubmissions.map((paper) => (
                <Card key={paper.id} className="border-border/70 shadow-2xs bg-card hover:border-primary/30 transition-all group overflow-hidden rounded-xl">
                    <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-meta px-2 py-0.5 rounded border-border/70">ID: {paper.paperId}</Badge>
                            <Badge className={`text-meta py-0.5 px-2.5 border-none rounded ${
                                    paper.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                    paper.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                    'badge-brand'
                                }`}>
                                {paper.status}
                            </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground line-clamp-2 h-10 group-hover:text-primary transition-colors leading-snug">{paper.title}</h3>
                        <div className="flex items-center justify-between pt-3 border-t border-border/50">
                            <span className="text-meta flex items-center gap-1.5"><Clock className="w-3 h-3" /> {formatDate(paper.submittedAt)}</span>
                            <Button asChild variant="ghost" size="sm" className="h-8 px-3 text-primary hover:bg-primary/10 rounded-lg text-xs font-semibold">
                                <Link href={`/track?id=${paper.paperId}`} className="flex items-center gap-1.5">
                                    Track <ExternalLink className="w-3 h-3" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                    <div className="h-1 bg-muted overflow-hidden">
                        <div
                            className={cn(
                                "h-full transition-all duration-700",
                                paper.status === 'published' ? 'bg-emerald-500 w-full' : 'bg-primary w-1/5'
                            )}
                        />
                    </div>
                </Card>
            ))}
        </div>
    );
}

export function DashboardActivityOverviewCard({
    metricsLabels = { pubRate: "Publication Rate", revRate: "Review Rate" },
    percentages = { pub: 0, rev: 0 }
}: {
    metricsLabels?: { pubRate: string; revRate: string };
    percentages?: { pub: number; rev: number };
}) {
    return (
        <Card className="p-3.5 sm:p-4 border-border/70 shadow-2xs bg-card rounded-xl">
            <h4 className="text-label text-muted-foreground mb-3 uppercase">Activity Overview</h4>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between text-label mb-1 uppercase">
                        <span>{metricsLabels.pubRate}</span>
                        <span>{percentages.pub.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.round(percentages.pub)}%` }} 
                        />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-label mb-1 uppercase">
                        <span>{metricsLabels.revRate}</span>
                        <span>{percentages.rev.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${Math.round(percentages.rev)}%` }} 
                        />
                    </div>
                </div>
            </div>
        </Card>
    );
}

export function DashboardHealthSectionView({
    healthMetrics,
    allStaff = [],
    role
}: {
    healthMetrics: HealthMetric[];
    allStaff?: DashboardStaff[];
    role: string;
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border/70 shadow-2xs bg-card overflow-hidden rounded-xl">
                <CardHeader className="p-4 border-b border-border/70 flex flex-row items-center justify-between bg-muted/20">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                        <Users className="w-4 h-4 text-primary" /> Active Users
                    </CardTitle>
                    {role === 'admin' && (
                        <Button size="sm" asChild className="btn-primary">
                            <Link href="/admin/users">Manage</Link>
                        </Button>
                    )}
                </CardHeader>
                <CardContent className="p-0">
                    {allStaff.length === 0 ? (
                        <div className="p-12 text-center text-xs text-muted-foreground/40">No users found.</div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {allStaff.map((staff) => (
                                <div key={staff.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-primary/5 text-primary flex items-center justify-center font-bold text-xs border border-primary/10">
                                            {staff.fullName?.charAt(0) || staff.email?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-medium text-foreground leading-none mb-1">{staff.fullName || staff.email}</h5>
                                            <p className="text-meta">{staff.role}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`text-meta h-5 border-none px-2 rounded ${
                                            staff.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                                            staff.role === 'editor' ? 'badge-brand' :
                                            'bg-emerald-50 text-emerald-600'
                                        }`}>
                                        {staff.role}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-border/70 shadow-2xs bg-card rounded-xl">
                <CardHeader className="p-4 border-b border-border/70 bg-muted/20">
                    <CardTitle className="text-sm font-semibold">System Health</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                    {healthMetrics.map((metric) => (
                        <div key={metric.label} className="p-3 rounded-lg bg-muted/20 border border-border/50 space-y-0.5 hover:bg-muted/30 transition-all">
                            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    {(() => {
                                        const Icon = ICON_MAP[metric.icon] || Box;
                                        return <Icon className="w-3 h-3" />;
                                    })()}
                                    {metric.label}
                                </span>
                                <span className={metric.status === 'Optimal' || metric.status === 'Healthy' || metric.status === 'Excellent' ? 'text-emerald-500' : 'text-amber-500'}>{metric.status}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{metric.value}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

/* Master Registry Component with Slot Injection */

export function DashboardRegistry({
    role,
    user,
    stats,
    statsSlot,
    recentSubmissions,
    recentSubmissionsSlot,
    mySubmissions,
    mySubmissionsSlot,
    healthMetrics,
    healthMetricsSlot,
    pendingApplications = [],
    pendingApplicationsSlot,
    allStaff = [],
    extraActions,
    recentSubmissionsTitle = "Submissions",
    metricsLabels = { pubRate: "Publication Rate", revRate: "Review Rate" },
    percentages = { pub: 0, rev: 0 },
    activityOverviewSlot,
    children
}: DashboardRegistryProps) {
    return (
        <section className="space-y-4">
            {/* Header Section - Renders instantly */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 sm:pb-4 border-b border-border/70">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <Badge variant="outline" className="badge-brand text-[10px] font-medium px-2.5 py-0.5 rounded-md capitalize">
                            {role}
                        </Badge>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-meta" suppressHydrationWarning>
                            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric', day: 'numeric' })}
                        </span>
                    </div>
                    <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">
                        {role.charAt(0).toUpperCase() + role.slice(1)} Dashboard
                    </h1>
                    <p className="text-body-sm text-muted-foreground">
                        Logged in as <span className="font-medium text-foreground">{user?.profile?.fullName || user?.name || user?.email}</span>
                    </p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                    {extraActions}
                </div>
            </header>

            {/* Stats Grid - Streamed via statsSlot or rendered directly */}
            {statsSlot ? statsSlot : stats ? (
                <DashboardStatsGrid stats={stats} />
            ) : (
                <DashboardStatsSkeleton />
            )}

            <Tabs defaultValue="overview" className="space-y-3 sm:space-y-4">
                <TabsList className="bg-muted/50 flex flex-wrap sm:inline-flex justify-start h-auto gap-1 rounded-xl border border-border/70 p-1">
                    <TabsTrigger value="overview" className="px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all text-xs sm:text-sm">Overview</TabsTrigger>
                    <TabsTrigger value="my-papers" className="px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all text-xs sm:text-sm">My Papers</TabsTrigger>
                    <TabsTrigger value="infrastructure" className="px-4 py-1.5 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-medium transition-all text-xs sm:text-sm">Health</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                        <div className="lg:col-span-2 space-y-3 sm:space-y-4">
                            {/* Recent Submissions Card */}
                            {recentSubmissionsSlot ? recentSubmissionsSlot : recentSubmissions ? (
                                <DashboardRecentSubmissionsCard
                                    recentSubmissions={recentSubmissions}
                                    recentSubmissionsTitle={recentSubmissionsTitle}
                                    role={role}
                                />
                            ) : (
                                <DashboardSubmissionsSkeleton />
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                                {activityOverviewSlot ? (
                                    activityOverviewSlot
                                ) : (
                                    <DashboardActivityOverviewCard
                                        metricsLabels={metricsLabels}
                                        percentages={percentages}
                                    />
                                )}
                                <div className="space-y-3 sm:space-y-4">
                                    {children}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 sm:space-y-4">
                            {role === 'admin' && (
                                pendingApplicationsSlot ? pendingApplicationsSlot : (
                                    pendingApplications.length > 0 && (
                                        <DashboardApplicationsCard pendingApplications={pendingApplications} />
                                    )
                                )
                            )}

                            {role === 'editor' && (
                                <Card className="border-border/70 shadow-2xs bg-card h-full rounded-xl">
                                    <CardHeader className="p-3.5 sm:p-4 border-b border-border/70 bg-muted/20">
                                        <CardTitle className="text-sm font-semibold flex items-center gap-2">
                                            <ClipboardList className="w-4 h-4 text-primary" /> Active Tasks
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-4 sm:p-5 space-y-3">
                                        {[
                                            { icon: <FileStack className="w-4 h-4" />, label: 'Manuscript Screening' },
                                            { icon: <ShieldCheck className="w-4 h-4" />, label: 'Peer Review Oversight' },
                                            { icon: <AlertCircle className="w-4 h-4" />, label: 'Workflow Deadlines' }
                                        ].map((task, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground group">
                                                <div className="group-hover:text-primary transition-colors">
                                                    {task.icon}
                                                </div>
                                                <span>{task.label}</span>
                                            </div>
                                        ))}
                                        <div className="pt-4 border-t border-border/50 text-center">
                                            <Button asChild className="w-full h-9 btn-primary rounded-lg shadow-sm">
                                                <Link href="/editor/submissions" className="flex items-center gap-2 justify-center">
                                                    Open Queue <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="my-papers" className="space-y-3 sm:space-y-4">
                    {mySubmissionsSlot ? mySubmissionsSlot : mySubmissions ? (
                        <DashboardMySubmissionsGrid mySubmissions={mySubmissions} />
                    ) : (
                        <DashboardSubmissionsSkeleton />
                    )}
                </TabsContent>

                <TabsContent value="infrastructure" className="space-y-3 sm:space-y-4">
                    {healthMetricsSlot ? healthMetricsSlot : healthMetrics ? (
                        <DashboardHealthSectionView
                            healthMetrics={healthMetrics}
                            allStaff={allStaff}
                            role={role}
                        />
                    ) : (
                        <DashboardHealthSkeleton />
                    )}
                </TabsContent>
            </Tabs>
        </section>
    );
}

DashboardRegistry.displayName = 'DashboardRegistry';

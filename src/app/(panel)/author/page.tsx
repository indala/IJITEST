import {
    FileStack, Clock, CheckCircle, BookOpen, ArrowRight,
    AlertCircle, Upload, ExternalLink, CreditCard, Timer,
    FileText, TrendingUp, Sparkles, PlusIcon
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getAuthorDashboard } from '@/actions/author-submissions';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubmissionProgress } from '@/features/author/components/SubmissionProgress';
import { cn } from '@/lib/utils';
import React, { Suspense, cache } from 'react';
import { type AuthorDashboardSubmission } from '@/db/types';
import {
    DashboardStatsSkeleton,
    DashboardSubmissionsSkeleton
} from '@/features/dashboard/components/DashboardSkeletons';

export const metadata = {
    title: "Author Dashboard | IJITEST",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    submitted: { label: 'Reviewing', color: 'text-blue-600', bg: 'bg-blue-500/10' },
    editorAssigned: { label: 'Assigned', color: 'text-indigo-600', bg: 'bg-indigo-500/10' },
    underReview: { label: 'Peer review', color: 'text-amber-600', bg: 'bg-amber-500/10' },
    revisionRequested: { label: 'Revision', color: 'text-orange-600', bg: 'bg-orange-500/10' },
    accepted: { label: 'Accepted', color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejected', color: 'text-rose-600', bg: 'bg-rose-500/10' },
    paymentPending: { label: 'Payment', color: 'text-purple-600', bg: 'bg-purple-500/10' },
    published: { label: 'Published', color: 'text-emerald-700', bg: 'bg-emerald-500/15' },
};

interface DashboardStat {
    label: string;
    value: number;
    icon: React.ReactNode;
}

function getDaysRemaining(updatedAt: Date | null): number {
    if (!updatedAt) return 0;
    const d = 28 - Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, d);
}

const getCachedAuthorDashboard = cache(async () => {
    return await getAuthorDashboard();
});

/* Streaming Component: Performance Snapshot */
async function AuthorStatsSection() {
    try {
        const response = await getCachedAuthorDashboard();
        const submissions = (response.data?.submissions || []) as AuthorDashboardSubmission[];

        const stats: DashboardStat[] = [
            { label: 'Submitted', value: submissions.length, icon: <FileStack className="w-5 h-5 text-primary" /> },
            { label: 'Reviewing', value: submissions.filter((s) => ['submitted', 'editorAssigned', 'underReview'].includes(s.status)).length, icon: <Clock className="w-5 h-5 text-amber-500" /> },
            { label: 'Accepted', value: submissions.filter((s) => ['accepted', 'paymentPending', 'published'].includes(s.status)).length, icon: <CheckCircle className="w-5 h-5 text-emerald-500" /> },
            { label: 'Published', value: submissions.filter((s) => s.status === 'published').length, icon: <BookOpen className="w-5 h-5 text-blue-500" /> },
        ];

        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map((stat) => (
                    <Card key={stat.label} className="border-border/70 shadow-2xs bg-card hover:border-primary/30 transition-all rounded-xl">
                        <CardContent className="p-3.5 sm:p-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-label text-muted-foreground">{stat.label}</p>
                                    <p className="text-xl lg:text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                                </div>
                                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                                    {stat.icon}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    } catch (err) {
        console.error("AuthorStatsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load metrics</div>;
    }
}

/* Streaming Component: Author Submissions List */
async function AuthorSubmissionsSection() {
    try {
        const response = await getCachedAuthorDashboard();
        const submissions = (response.data?.submissions || []) as AuthorDashboardSubmission[];

        if (submissions.length === 0) {
            return (
                <Card className="border-dashed border border-border/70 bg-card py-12 text-center rounded-xl">
                    <CardContent className="flex flex-col items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/70 flex items-center justify-center text-muted-foreground/40">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-foreground text-base">No submissions found</h3>
                            <p className="text-xs text-muted-foreground">
                                You haven&apos;t submitted any papers yet.
                            </p>
                        </div>
                        <Button asChild size="sm" className="mt-2 btn-primary h-8">
                            <Link href="/submit">Submit Paper</Link>
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-3">
                {submissions.map((sub) => {
                    const cfg = STATUS_CONFIG[sub.status] || { label: sub.status, color: 'text-muted-foreground', bg: 'bg-muted/30' };
                    const daysLeft = ['revisionRequested', 'rejected'].includes(sub.status) ? getDaysRemaining(sub.updatedAt) : null;
                    const isUrgent = daysLeft !== null && daysLeft <= 5;

                    return (
                        <Card
                            key={sub.id}
                            className={cn(
                                "border-border/70 shadow-2xs bg-card hover:border-primary/30 transition-all rounded-xl overflow-hidden",
                                isUrgent ? "border-orange-500/30" : ""
                            )}
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row min-h-40">
                                    {/* Left Panel: Status & Info */}
                                    <div className="lg:w-1/3 p-3.5 sm:p-4 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/70 bg-muted/10 transition-colors">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="px-2 py-0.5 text-meta rounded bg-background border-border/70">
                                                    {sub.paperId}
                                                </Badge>
                                                <Badge className={cn("px-2 py-0.5 text-meta rounded border-none", cfg.bg, cfg.color)}>
                                                    {cfg.label}
                                                </Badge>
                                            </div>
                                            <h3 className="font-medium text-foreground text-sm leading-snug">
                                                {sub.title || "Untitled Manuscript"}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-4 pt-2">
                                            <span className="text-meta">
                                                {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right Panel: Lifecycle & Actions */}
                                    <div className="lg:w-2/3 p-3.5 sm:p-4 flex flex-col justify-between gap-3 bg-card">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-label text-muted-foreground uppercase">Progress</span>
                                                {daysLeft !== null && (
                                                    <span className={cn(
                                                        "text-meta flex items-center gap-1.5 font-semibold",
                                                        isUrgent ? "text-rose-500 animate-pulse" : "text-orange-500"
                                                    )}>
                                                        <Timer className="w-3.5 h-3.5" />
                                                        {daysLeft > 0 ? `${daysLeft} days remaining` : "Window closed"}
                                                    </span>
                                                )}
                                            </div>
                                            <SubmissionProgress status={sub.status} />
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-border/50">
                                            {sub.status === 'published' && sub.finalPdfUrl ? (
                                                <Button asChild size="sm" className="h-8 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg shadow-2xs">
                                                    <Link href={sub.finalPdfUrl} target="_blank" className="flex items-center gap-1.5">
                                                        <BookOpen className="w-3.5 h-3.5" /> PDF
                                                    </Link>
                                                </Button>
                                            ) : (sub.status === 'accepted' || sub.status === 'paymentPending') && !['paid', 'verified', 'waived'].includes(sub.paymentStatus || '') ? (
                                                <Button asChild size="sm" className="h-8 px-3 btn-primary text-xs font-semibold rounded-lg shadow-2xs">
                                                    <Link href={`/author/payments`} className="flex items-center gap-1.5">
                                                        <CreditCard className="w-3.5 h-3.5" /> Pay Fee
                                                    </Link>
                                                </Button>
                                            ) : ['revisionRequested', 'rejected'].includes(sub.status) && daysLeft !== null && daysLeft > 0 ? (
                                                <Button asChild size="sm" className="h-8 px-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs rounded-lg shadow-2xs">
                                                    <Link href={`/author/submissions/${sub.id}/resubmit`} className="flex items-center gap-1.5">
                                                        <Upload className="w-3.5 h-3.5" /> Resubmit
                                                    </Link>
                                                </Button>
                                            ) : null}
                                            <Button asChild variant="outline" size="sm" className="h-8 px-3 border-border/70 text-xs font-semibold rounded-lg hover:bg-muted">
                                                <Link href={`/author/submissions/${sub.id}`} className="flex items-center gap-1.5">
                                                    Details <ArrowRight className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                            <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary">
                                                <Link href={`/track?id=${sub.paperId}`}>
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        );
    } catch (err) {
        console.error("AuthorSubmissionsSection error:", err);
        return (
            <div className="p-8 text-center border border-dashed border-border/70 rounded-xl bg-muted/5">
                <AlertCircle className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-muted-foreground">Unable to load submissions. Please refresh.</p>
            </div>
        );
    }
}

/* Streaming Component: Author Impact Statistics */
async function AuthorImpactSection() {
    try {
        const response = await getCachedAuthorDashboard();
        const submissions = (response.data?.submissions || []) as AuthorDashboardSubmission[];

        const totalViews = submissions.reduce((acc: number, sub) => acc + (sub.views || 0), 0);
        const totalDownloads = submissions.reduce((acc: number, sub) => acc + (sub.downloads || 0), 0);
        const totalCitations = submissions.reduce((acc: number, sub) => acc + (sub.citations || 0), 0);

        return (
            <Card className="md:col-span-1 bg-card border-border/70 rounded-xl shadow-2xs">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            <h3 className="font-semibold text-foreground text-sm">Statistics</h3>
                        </div>
                        <p className="text-body-sm text-muted-foreground">
                            Track the reach of your manuscripts.
                        </p>
                    </div>

                    <div className="space-y-2.5 pt-3 border-t border-border/70">
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Views</span>
                            <span className="font-bold text-foreground tabular-nums">{totalViews.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="text-muted-foreground">Downloads</span>
                            <span className="font-bold text-foreground tabular-nums">{totalDownloads.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-medium text-primary">Citations</span>
                            <span className="font-bold text-primary tabular-nums">{totalCitations.toLocaleString()}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    } catch (err) {
        console.error("AuthorImpactSection error:", err);
        return (
            <Card className="md:col-span-1 bg-card border-border/70 rounded-xl p-5">
                <p className="text-xs text-muted-foreground">Stats unavailable</p>
            </Card>
        );
    }
}

function AuthorDashboardSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-2">
                    <div className="h-4 w-28 bg-muted/50 rounded" />
                    <div className="h-8 w-48 bg-muted/70 rounded" />
                </div>
            </div>
            <DashboardStatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardSubmissionsSkeleton count={3} />
                <div className="h-44 rounded-xl bg-muted/20 border border-border/50" />
            </div>
        </div>
    );
}

export default function AuthorDashboard() {
    return (
        <Suspense fallback={<AuthorDashboardSkeleton />}>
            <AuthorDashboardContent />
        </Suspense>
    );
}

async function AuthorDashboardContent() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect('/login');
    if (session.user.role !== 'author') redirect(`/${session.user.role}`);

    return (
        <section className="space-y-4">
            {/* Header Section - Renders immediately */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="badge-brand text-[10px] font-medium px-2.5 py-0.5 rounded-md">Author Portal</Badge>
                    </div>
                    <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">
                        Welcome back, <span>{session.user.name?.split(' ')[0] || 'Scholar'}</span>
                    </h1>
                    <p className="panel-subtitle text-body-sm text-muted-foreground">
                        Manage your submissions and track your papers.
                    </p>
                </div>
                <Button asChild className="btn-primary h-9">
                    <Link href="/submit" className="flex items-center gap-2">
                        <PlusIcon className="w-4 h-4 mr-1" /> Submit Paper
                    </Link>
                </Button>
            </header>

            {/* Performance Snapshot - Streamed */}
            <Suspense fallback={<DashboardStatsSkeleton />}>
                <AuthorStatsSection />
            </Suspense>

            {/* Submissions Management - Streamed */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-label text-muted-foreground uppercase">
                        My Submissions
                    </h2>
                </div>

                <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                    <AuthorSubmissionsSection />
                </Suspense>
            </div>

            {/* Research Impact & Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                {/* Statistics Card - Streamed */}
                <Suspense fallback={
                    <Card className="md:col-span-1 bg-card border-border/70 rounded-xl shadow-2xs p-5 animate-pulse">
                        <div className="h-5 w-1/2 bg-muted/60 rounded mb-2" />
                        <div className="h-4 w-3/4 bg-muted/40 rounded mb-6" />
                        <div className="space-y-3 pt-3 border-t border-border/70">
                            <div className="h-4 bg-muted/40 rounded" />
                            <div className="h-4 bg-muted/40 rounded" />
                            <div className="h-4 bg-muted/40 rounded" />
                        </div>
                    </Card>
                }>
                    <AuthorImpactSection />
                </Suspense>

                {/* Production Information - Static, Renders immediately */}
                <Card className="md:col-span-2 bg-card border-border/70 rounded-xl shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-5">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-2 flex-1">
                            <h3 className="font-semibold text-foreground text-sm">Production Information</h3>
                            <p className="text-body-sm text-muted-foreground">
                                Our system automatically formats your accepted manuscripts with journal headers and DOI references upon publication.
                            </p>
                            <div className="p-3 rounded-lg bg-muted/30 border border-border/70 flex items-start gap-2.5 mt-2">
                                <Timer className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-0.5 text-xs">
                                    <p className="font-semibold text-foreground">Archive Window</p>
                                    <p className="text-muted-foreground">
                                        Rejected or revision-required manuscripts are held in the author workspace for 28 days.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </section>
    );
}

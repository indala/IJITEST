import { Suspense } from 'react';
import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';
import * as schema from "@/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import {
    DashboardRegistry,
    DashboardStatsGrid,
    DashboardRecentSubmissionsCard,
    DashboardMySubmissionsGrid,
    DashboardActivityOverviewCard,
    DashboardHealthSectionView,
    type Stat,
    type DashboardUser,
    type DashboardSubmission
} from '@/features/dashboard/components/DashboardRegistry';
import {
    DashboardStatsSkeleton,
    DashboardSubmissionsSkeleton,
    DashboardHealthSkeleton
} from '@/features/dashboard/components/DashboardSkeletons';
import os from 'os';
import { performance } from 'perf_hooks';
import { getStorageSizeFromService } from '@/lib/fs-utils';

function mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export const metadata = {
    title: "Editor Dashboard | IJITEST",
};

/* Streaming Component: Editor KPI Stats */
async function EditorStatsSection() {
    try {
        const [
            [totalSubmissions],
            [underReview],
            [pendingPayments],
            latestIssue
        ] = await Promise.all([
            db.select({ value: count() }).from(schema.submissions),
            db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'underReview')),
            db.select({ value: count() }).from(schema.payments).where(eq(schema.payments.status, 'pending')),
            db.query.volumesIssues.findFirst({
                where: eq(schema.volumesIssues.status, 'published'),
                orderBy: [desc(schema.volumesIssues.year), desc(schema.volumesIssues.volumeNumber)]
            })
        ]);

        const currentIssue = latestIssue ? `${latestIssue.year} Edition` : '2026 Edition';

        const stats: Stat[] = [
            { label: 'Submissions', value: totalSubmissions?.value ?? 0, icon: 'FileStack', variant: 'indigo' },
            { label: 'Reviewing', value: underReview?.value ?? 0, icon: 'ShieldCheck', variant: 'blue' },
            { label: 'Pending', value: pendingPayments?.value ?? 0, icon: 'CreditCard', variant: 'emerald' },
            { label: 'Published', value: currentIssue, icon: 'BookOpen', variant: 'amber' },
        ];

        return <DashboardStatsGrid stats={stats} />;
    } catch (err) {
        console.error("EditorStatsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load metrics</div>;
    }
}

/* Streaming Component: Editor Activity Overview Rates */
async function EditorActivityOverviewSection() {
    try {
        const [
            [totalSubmissions],
            [publishedCount],
            [totalReviews],
            [completedReviews]
        ] = await Promise.all([
            db.select({ value: count() }).from(schema.submissions),
            db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'published')),
            db.select({ value: count() }).from(schema.reviewAssignments),
            db.select({ value: count() }).from(schema.reviewAssignments).where(eq(schema.reviewAssignments.status, 'completed'))
        ]);

        const totalSubCount = Number(totalSubmissions?.value ?? 0);
        const pubCount = Number(publishedCount?.value ?? 0);
        const pubPercent = totalSubCount > 0 ? (pubCount / totalSubCount) * 100 : 0;

        const totalRevCount = Number(totalReviews?.value ?? 0);
        const compRevCount = Number(completedReviews?.value ?? 0);
        const revPercent = totalRevCount > 0 ? (compRevCount / totalRevCount) * 100 : 0;

        return (
            <DashboardActivityOverviewCard
                percentages={{ pub: pubPercent, rev: revPercent }}
            />
        );
    } catch (err) {
        console.error("EditorActivityOverviewSection error:", err);
        return <DashboardActivityOverviewCard percentages={{ pub: 0, rev: 0 }} />;
    }
}

/* Streaming Component: Recent Submissions */
async function EditorRecentSubmissionsSection() {
    try {
        const recentSubmissions = await db.select({
            id: schema.submissions.id,
            paperId: schema.submissions.paperId,
            status: schema.submissions.status,
            title: schema.submissionVersions.title,
            authorName: schema.userProfiles.fullName,
            submittedAt: schema.submissions.submittedAt
        })
            .from(schema.submissions)
            .leftJoin(schema.submissionVersions, and(
                eq(schema.submissions.id, schema.submissionVersions.submissionId),
                eq(schema.submissionVersions.versionNumber, 1)
            ))
            .leftJoin(schema.userProfiles, eq(schema.submissions.correspondingAuthorId, schema.userProfiles.userId))
            .orderBy(desc(schema.submissions.submittedAt))
            .limit(5);

        return (
            <DashboardRecentSubmissionsCard
                recentSubmissions={recentSubmissions as DashboardSubmission[]}
                recentSubmissionsTitle="Active Submissions"
                role="editor"
            />
        );
    } catch (err) {
        console.error("EditorRecentSubmissionsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load active submissions</div>;
    }
}

/* Streaming Component: My Submissions */
async function EditorMySubmissionsSection() {
    try {
        const mySubmissions = await getMySubmissions();
        return <DashboardMySubmissionsGrid mySubmissions={mySubmissions as DashboardSubmission[]} />;
    } catch (err) {
        console.error("EditorMySubmissionsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load personal papers</div>;
    }
}

/* Streaming Component: Health Metrics */
async function EditorHealthSection() {
    try {
        const startDb = performance.now();
        await db.select({ val: sql`1` }).from(schema.users).limit(1);
        const dbLatency = (performance.now() - startDb).toFixed(2);

        const totalStorageBytes = await getStorageSizeFromService();
        const storageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
        const memUsed = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
        const uptimeHours = (os.uptime() / 3600).toFixed(1);
        const healthScore = mean([100 - memUsed, 100 - (Number(dbLatency) / 2), 100 - (Number(storageMB) / 5)]).toFixed(1);

        const healthMetrics = [
            { label: 'Database', value: `${dbLatency}ms`, icon: 'Activity', status: Number(dbLatency) < 100 ? 'Optimal' : 'Checking' },
            { label: 'Storage', value: `${storageMB} MB`, icon: 'HardDrive', status: 'Healthy' },
            { label: 'Uptime', value: `${uptimeHours}h`, icon: 'Shield', status: 'Excellent' },
            { label: 'Load', value: `${memUsed.toFixed(1)}%`, status: memUsed < 80 ? 'Optimal' : 'High', icon: 'Users' },
            { label: 'Health', value: `${healthScore}%`, status: Number(healthScore) > 90 ? 'Excellent' : 'Good', icon: 'Shield' }
        ];

        return (
            <DashboardHealthSectionView
                healthMetrics={healthMetrics}
                role="editor"
            />
        );
    } catch (err) {
        console.error("EditorHealthSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load system health</div>;
    }
}

function EditorDashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
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

export default function EditorDashboard() {
    return (
        <Suspense fallback={<EditorDashboardSkeleton />}>
            <EditorDashboardContent />
        </Suspense>
    );
}

async function EditorDashboardContent() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        redirect('/login');
    }

    return (
        <DashboardRegistry
            role="editor"
            user={session.user as DashboardUser}

            recentSubmissionsTitle="Active Submissions"
            statsSlot={
                <Suspense fallback={<DashboardStatsSkeleton />}>
                    <EditorStatsSection />
                </Suspense>
            }
            activityOverviewSlot={
                <Suspense fallback={<div className="h-36 rounded-xl bg-muted/30 border border-border/50 animate-pulse p-4" />}>
                    <EditorActivityOverviewSection />
                </Suspense>
            }
            recentSubmissionsSlot={
                <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                    <EditorRecentSubmissionsSection />
                </Suspense>
            }
            mySubmissionsSlot={
                <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                    <EditorMySubmissionsSection />
                </Suspense>
            }
            healthMetricsSlot={
                <Suspense fallback={<DashboardHealthSkeleton />}>
                    <EditorHealthSection />
                </Suspense>
            }
        >
            <div className="p-4 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                <TrendingUp className="w-7 h-7 text-primary/30 mb-2" />
                <h4 className="text-xs font-semibold mb-0.5">Support</h4>
                <p className="text-[11px] text-muted-foreground mb-3">Need help with your submissions?</p>
                <Button asChild size="sm" variant="outline" className="h-8 px-4 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 rounded-lg cursor-pointer">
                    <Link href="/editor/messages" className="cursor-pointer">Contact</Link>
                </Button>
            </div>
        </DashboardRegistry>
    );
}

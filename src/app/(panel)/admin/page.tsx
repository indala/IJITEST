import { Suspense } from 'react';
import { TrendingUp, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from '@/lib/db';
import {
    submissions,
    users,
    userProfiles,
    payments,
    applications,
    submissionVersions,
    reviews
} from '@/db/schema';
import { eq, sql, desc, and, count, sum, or } from 'drizzle-orm';
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import {
    DashboardRegistry,
    DashboardStatsGrid,
    DashboardRecentSubmissionsCard,
    DashboardApplicationsCard,
    DashboardMySubmissionsGrid,
    DashboardActivityOverviewCard,
    DashboardHealthSectionView,
    type Stat,
    type DashboardUser,
    type DashboardSubmission,
    type DashboardStaff
} from '@/features/dashboard/components/DashboardRegistry';
import {
    DashboardStatsSkeleton,
    DashboardSubmissionsSkeleton,
    DashboardHealthSkeleton
} from '@/features/dashboard/components/DashboardSkeletons';
import InviteEditorModal from './components/InviteEditorModal';
import os from 'os';
import { getStorageSizeFromService } from '@/lib/fs-utils';

export const metadata = {
    title: "Admin Dashboard | IJITEST",
};

async function getHealthMetrics() {
    const startDb = Date.now();
    await db.select({ val: sql`1` }).from(users).limit(1);
    const endDb = Date.now();
    const dbLatency = (endDb - startDb).toFixed(2);

    const totalStorageBytes = await getStorageSizeFromService();
    const storageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
    const uptimeHours = (os.uptime() / 3600).toFixed(1);

    return { dbLatency, storageMB, uptimeHours };
}

/* Streaming Component: Admin KPI Stats */
async function AdminStatsSection() {
    try {
        const [subCountRes, userCountRes, paidRevenueRes, pendingRevenueRes] = await Promise.all([
            db.select({ value: count() }).from(submissions),
            db.select({ value: count() }).from(users),
            db.select({ total: sum(payments.amount) }).from(payments).where(or(eq(payments.status, 'paid'), eq(payments.status, 'verified'))),
            db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),
        ]);

        const stats: Stat[] = [
            { label: 'Revenue', value: Number(paidRevenueRes[0]?.total) || 0, icon: 'TrendingUp', variant: 'emerald', prefix: '₹' },
            { label: 'Users', value: userCountRes[0]?.value || 0, icon: 'Users', variant: 'blue' },
            { label: 'Submissions', value: subCountRes[0]?.value || 0, icon: 'FileStack', variant: 'indigo' },
            { label: 'Pending', value: Number(pendingRevenueRes[0]?.total) || 0, icon: 'CreditCard', variant: 'amber', prefix: '₹' },
        ];

        return <DashboardStatsGrid stats={stats} />;
    } catch (err) {
        console.error("AdminStatsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load metrics</div>;
    }
}

/* Streaming Component: Admin Activity Overview Rates */
async function AdminActivityOverviewSection() {
    try {
        const [subCountRes, publishedCountRes, reviewStatsRes, completedReviewsRes] = await Promise.all([
            db.select({ value: count() }).from(submissions),
            db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'published')),
            db.select({ value: count() }).from(reviews),
            db.select({ value: count() }).from(reviews).where(sql`${reviews.submittedAt} IS NOT NULL`)
        ]);

        const totalReviews = reviewStatsRes[0]?.value || 0;
        const revPercent = totalReviews > 0 ? (Number(completedReviewsRes[0]?.value || 0) / totalReviews) * 100 : 0;
        const subCount = subCountRes[0]?.value ?? 0;
        const publishedCount = publishedCountRes[0]?.value ?? 0;
        const pubPercent = subCount > 0 ? (publishedCount / subCount) * 100 : 0;

        return (
            <DashboardActivityOverviewCard
                percentages={{ pub: pubPercent, rev: revPercent }}
            />
        );
    } catch (err) {
        console.error("AdminActivityOverviewSection error:", err);
        return <DashboardActivityOverviewCard percentages={{ pub: 0, rev: 0 }} />;
    }
}

/* Streaming Component: Recent Submissions */
async function AdminRecentSubmissionsSection() {
    try {
        const recentSubmissions = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            status: submissions.status,
            submittedAt: submissions.submittedAt,
            title: submissionVersions.title,
            authorName: userProfiles.fullName
        })
            .from(submissions)
            .leftJoin(submissionVersions, and(eq(submissions.id, submissionVersions.submissionId), eq(submissionVersions.versionNumber, 1)))
            .leftJoin(userProfiles, eq(submissions.correspondingAuthorId, userProfiles.userId))
            .orderBy(desc(submissions.submittedAt))
            .limit(5);

        return (
            <DashboardRecentSubmissionsCard
                recentSubmissions={recentSubmissions as DashboardSubmission[]}
                role="admin"
            />
        );
    } catch (err) {
        console.error("AdminRecentSubmissionsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load submissions</div>;
    }
}

/* Streaming Component: Pending Reviewer Applications */
async function AdminPendingApplicationsSection() {
    try {
        const pendingApps = await db.select()
            .from(applications)
            .where(eq(applications.status, 'pending'))
            .orderBy(desc(applications.createdAt))
            .limit(3);

        return <DashboardApplicationsCard pendingApplications={pendingApps} />;
    } catch (err) {
        console.error("AdminPendingApplicationsSection error:", err);
        return null;
    }
}

/* Streaming Component: My Submissions */
async function AdminMySubmissionsSection() {
    try {
        const mySubmissions = await getMySubmissions();
        return <DashboardMySubmissionsGrid mySubmissions={mySubmissions as DashboardSubmission[]} />;
    } catch (err) {
        console.error("AdminMySubmissionsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load personal papers</div>;
    }
}

/* Streaming Component: Health & Staff Overview */
async function AdminHealthSection() {
    try {
        const [allStaff, health] = await Promise.all([
            db.select({
                id: users.id,
                email: users.email,
                role: users.role,
                fullName: userProfiles.fullName
            })
                .from(users)
                .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
                .orderBy(desc(users.createdAt))
                .limit(10),
            getHealthMetrics()
        ]);

        const healthMetrics = [
            { label: 'Database', value: `${health.dbLatency || 0}ms`, icon: 'Activity', status: Number(health.dbLatency) < 100 ? 'Optimal' : 'Checking' },
            { label: 'Storage', value: `${health.storageMB || 0} MB`, icon: 'HardDrive', status: 'Healthy' },
            { label: 'Uptime', value: `${health.uptimeHours || 0}h`, icon: 'Shield', status: 'Excellent' },
        ];

        return (
            <DashboardHealthSectionView
                healthMetrics={healthMetrics}
                allStaff={allStaff as DashboardStaff[]}
                role="admin"
            />
        );
    } catch (err) {
        console.error("AdminHealthSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load system health</div>;
    }
}

function AdminDashboardSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-2">
                    <div className="h-4 w-28 bg-muted/50 rounded" />
                    <div className="h-8 w-48 bg-muted/70 rounded" />
                </div>
                <div className="h-10 w-28 bg-muted/40 rounded-lg" />
            </div>
            <DashboardStatsSkeleton />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardSubmissionsSkeleton count={3} />
                <div className="h-44 rounded-xl bg-muted/20 border border-border/50" />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    return (
        <Suspense fallback={<AdminDashboardSkeleton />}>
            <AdminDashboardContent />
        </Suspense>
    );
}

async function AdminDashboardContent() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
        redirect("/login");
    }

    return (
        <DashboardRegistry
            role="admin"
            user={session.user as DashboardUser}
            statsSlot={
                <Suspense fallback={<DashboardStatsSkeleton />}>
                    <AdminStatsSection />
                </Suspense>
            }
            activityOverviewSlot={
                <Suspense fallback={<div className="h-36 rounded-xl bg-muted/30 border border-border/50 animate-pulse p-4" />}>
                    <AdminActivityOverviewSection />
                </Suspense>
            }
            recentSubmissionsSlot={
                <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                    <AdminRecentSubmissionsSection />
                </Suspense>
            }
            pendingApplicationsSlot={
                <Suspense fallback={<div className="h-44 rounded-xl bg-muted/20 border border-border/50 animate-pulse" />}>
                    <AdminPendingApplicationsSection />
                </Suspense>
            }
            mySubmissionsSlot={
                <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                    <AdminMySubmissionsSection />
                </Suspense>
            }
            healthMetricsSlot={
                <Suspense fallback={<DashboardHealthSkeleton />}>
                    <AdminHealthSection />
                </Suspense>
            }
            extraActions={
                <Button size="lg" asChild className="h-10 px-5 btn-primary font-semibold rounded-lg shadow-sm">
                    <Link href="/admin/users" className="flex items-center gap-2">
                        <UserPlus className="w-4 h-4" /> Users
                    </Link>
                </Button>
            }
        >
            <div className="p-4 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                <TrendingUp className="w-7 h-7 text-primary/30 mb-2" />
                <h4 className="text-xs font-semibold mb-0.5">Add Editor</h4>
                <p className="text-[11px] text-muted-foreground mb-3">Invite a new editor to the team.</p>
                <InviteEditorModal />
            </div>
        </DashboardRegistry>
    );
}


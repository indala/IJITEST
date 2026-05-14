import { TrendingUp, UserPlus } from 'lucide-react';
import Link from 'next/link';
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
import { Application } from '@/db/types';
import { eq, sql, desc, and, count, sum, or } from 'drizzle-orm';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import { 
    DashboardRegistry, 
    DashboardUser, 
    DashboardSubmission, 
    DashboardStaff 
} from '@/features/dashboard/components/DashboardRegistry';
import InviteEditorModal from './components/InviteEditorModal';
import os from 'os';
import fs from 'fs';
import path from 'path';


export const dynamic = 'force-dynamic';

async function getHealthMetrics() {
    // 2. Health Calculations
    const startDb = Date.now();
    await db.select({ val: sql`1` }).from(users).limit(1);
    const endDb = Date.now();
    const dbLatency = (endDb - startDb).toFixed(2);

    const uploadsPath = path.join(process.cwd(), 'public', 'uploads');
    const storagePath = path.join(process.cwd(), 'storage');

    const getDirSize = (p: string): number => {
        let s = 0;
        try {
            const files = fs.readdirSync(p);
            files.forEach(f => {
                const fp = path.join(p, f);
                const st = fs.statSync(fp);
                s += st.isDirectory() ? getDirSize(fp) : st.size;
            });
        } catch { /* ignore */ }
        return s;
    };

    const totalStorageBytes = getDirSize(uploadsPath) + getDirSize(storagePath);
    const storageMB = (totalStorageBytes / (1024 * 1024)).toFixed(1);
    const uptimeHours = (os.uptime() / 3600).toFixed(1);

    return { dbLatency, storageMB, uptimeHours };
}

export default async function AdminDashboard() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    let subCountRes, userCountRes, paidRevenueRes, pendingRevenueRes, publishedCountRes, reviewStatsRes, completedReviewsRes, recentSubmissions, mySubmissions, pendingApps, allStaff, dbLatency, storageMB, uptimeHours;

    try {
        mySubmissions = await getMySubmissions();

        // 1. Data Fetching
        [
            subCountRes,
            userCountRes,
            paidRevenueRes,
            pendingRevenueRes,
            publishedCountRes,
            reviewStatsRes,
            completedReviewsRes
        ] = await Promise.all([
            db.select({ value: count() }).from(submissions),
            db.select({ value: count() }).from(users),
            db.select({ total: sum(payments.amount) }).from(payments).where(or(eq(payments.status, 'paid'), eq(payments.status, 'verified'))),
            db.select({ total: sum(payments.amount) }).from(payments).where(eq(payments.status, 'pending')),
            db.select({ value: count() }).from(submissions).where(eq(submissions.status, 'published')),
            db.select({ value: count() }).from(reviews),
            db.select({ value: count() }).from(reviews).where(sql`${reviews.submittedAt} IS NOT NULL`)
        ]);

        recentSubmissions = await db.select({
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

        pendingApps = await db.select().from(applications).where(eq(applications.status, 'pending')).orderBy(desc(applications.createdAt)).limit(3);

        allStaff = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
            fullName: userProfiles.fullName
        })
            .from(users)
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .orderBy(desc(users.createdAt))
            .limit(10);

        const health = await getHealthMetrics();
        dbLatency = health.dbLatency;
        storageMB = health.storageMB;
        uptimeHours = health.uptimeHours;

    } catch (error) {
        console.error("Admin Dashboard Data Fetch Error:", error);
        return <div className="p-10 text-center">Critical System Logic Latency. Data could not be synchronized.</div>;
    }

    const totalReviews = reviewStatsRes[0]?.value || 0;
    const revPercent = totalReviews > 0 ? (Number(completedReviewsRes[0]?.value || 0) / totalReviews) * 100 : 0;
    const subCount = subCountRes[0]?.value ?? 0;
    const publishedCount = publishedCountRes[0]?.value ?? 0;
    const pubPercent = subCount > 0 ? (publishedCount / subCount) * 100 : 0;

    const stats = [
        { label: 'Revenue', value: Number(paidRevenueRes[0]?.total) || 0, icon: 'TrendingUp', variant: 'emerald', prefix: '₹' },
        { label: 'Users', value: userCountRes[0]?.value || 0, icon: 'Users', variant: 'blue' },
        { label: 'Submissions', value: subCountRes[0]?.value || 0, icon: 'FileStack', variant: 'indigo' },
        { label: 'Pending', value: Number(pendingRevenueRes[0]?.total) || 0, icon: 'CreditCard', variant: 'amber', prefix: '₹' },
    ];

    const healthMetrics = [
        { label: 'Database', value: `${dbLatency || 0}ms`, icon: 'Activity', status: Number(dbLatency) < 100 ? 'Optimal' : 'Checking' },
        { label: 'Storage', value: `${storageMB || 0} MB`, icon: 'HardDrive', status: 'Healthy' },
        { label: 'Uptime', value: `${uptimeHours || 0}h`, icon: 'Shield', status: 'Excellent' },
    ];

    return (
        <DashboardRegistry
            role="admin"
            user={user as DashboardUser}
            stats={stats}
            recentSubmissions={recentSubmissions as DashboardSubmission[]}
            mySubmissions={mySubmissions as DashboardSubmission[]}
            healthMetrics={healthMetrics}
            pendingApplications={pendingApps as Application[]}
            allStaff={allStaff as DashboardStaff[]}
            percentages={{ pub: pubPercent, rev: revPercent }}
            extraActions={
                <Button size="lg" asChild className="h-12 px-8 bg-primary text-white font-semibold rounded-xl shadow-lg hover:bg-primary/90 transition-all cursor-pointer">
                    <Link href="/admin/users" className="flex items-center gap-2 cursor-pointer">
                        <UserPlus className="w-4 h-4" /> Users
                    </Link>
                </Button>
            }
        >
            <div className="p-6 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                <TrendingUp className="w-8 h-8 text-primary/20 mb-3" />
                <h4 className="mb-1">Add Editor</h4>
                <p className="opacity-60 mb-4">Invite a new editor to the team.</p>
                <InviteEditorModal />
            </div>
        </DashboardRegistry>
    );
}

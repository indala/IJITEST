import { TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import * as schema from "@/db/schema";
import { eq, desc, sql, count, and } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import { Button } from "@/components/ui/button";
import { DashboardRegistry } from '@/features/dashboard/components/DashboardRegistry';
import os from 'os';
import { performance } from 'perf_hooks';
import { getStorageSizeFromService } from '@/lib/fs-utils';
function mean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
}

export const metadata = {
    title: "Editor Dashboard | IJITEST",
};

export default async function EditorDashboard() {
    const session = await getServerSession(authOptions);
    if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
        redirect('/login');
    }
    const user = session.user;
    const mySubmissions = await getMySubmissions();

    // 1. Data Fetching
    const [totalSubmissions] = await db.select({ value: count() }).from(schema.submissions);
        const [underReview] = await db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'underReview'));
        const [pendingPayments] = await db.select({ value: count() }).from(schema.payments).where(eq(schema.payments.status, 'pending'));
        const [publishedCount] = await db.select({ value: count() }).from(schema.submissions).where(eq(schema.submissions.status, 'published'));
        const [totalReviews] = await db.select({ value: count() }).from(schema.reviewAssignments);
        const [completedReviews] = await db.select({ value: count() }).from(schema.reviewAssignments).where(eq(schema.reviewAssignments.status, 'completed'));
        
        const latestIssue = await db.query.volumesIssues.findFirst({
            where: eq(schema.volumesIssues.status, 'published'),
            orderBy: [desc(schema.volumesIssues.year), desc(schema.volumesIssues.volumeNumber)]
        });
        const currentIssue = latestIssue ? `${latestIssue.year} Edition` : '2026 Edition';

        const stats = [
            { label: 'Submissions', value: totalSubmissions?.value ?? 0, icon: 'FileStack', variant: 'indigo' },
            { label: 'Reviewing', value: underReview?.value ?? 0, icon: 'ShieldCheck', variant: 'blue' },
            { label: 'Pending', value: pendingPayments?.value ?? 0, icon: 'CreditCard', variant: 'emerald' },
            { label: 'Published', value: currentIssue, icon: 'BookOpen', variant: 'amber' },
        ];

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

        // 2. Health Calculations
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

    const totalSubCount = Number(totalSubmissions?.value ?? 0);
    const pubCount = Number(publishedCount?.value ?? 0);
    const pubPercent = totalSubCount > 0 ? (pubCount / totalSubCount) * 100 : 0;
    
    const totalRevCount = Number(totalReviews?.value ?? 0);
    const compRevCount = Number(completedReviews?.value ?? 0);
    const revPercent = totalRevCount > 0 ? (compRevCount / totalRevCount) * 100 : 0; 

    return (
        <DashboardRegistry 
            role="editor"
            user={user}
            stats={stats}
            recentSubmissions={recentSubmissions}
            mySubmissions={mySubmissions}
            healthMetrics={healthMetrics}
            percentages={{ pub: pubPercent, rev: revPercent }}
            recentSubmissionsTitle="Active Submissions"
            metricsLabels={{ pubRate: "Publication Rate", revRate: "Review Rate" }}
        >
            <div className="p-6 border-primary/10 bg-card/30 border-dashed border-2 flex flex-col items-center justify-center text-center rounded-xl">
                <TrendingUp className="w-8 h-8 text-primary/20 mb-3" />
                <h4 className="mb-1">Support</h4>
                <p className="opacity-60 mb-4">Need help with your submissions?</p>
                <Button asChild size="sm" variant="outline" className="h-9 px-6 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 rounded-lg cursor-pointer">
                    <Link href="/editor/messages" className="cursor-pointer">Contact</Link>
                </Button>
            </div>
        </DashboardRegistry>
    );
}

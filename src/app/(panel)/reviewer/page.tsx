import { Suspense, cache } from "react";
import { redirect } from "next/navigation";
import {
    FileText,
    CheckCircle,
    Clock,
    ArrowRight,
    Shield,
    ExternalLink,
    Timer,
    MessageSquare,
    Zap,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { submissions, submissionVersions, reviewAssignments } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getMySubmissions } from '@/actions/author-submissions';
import type { DashboardSubmission } from "@/features/dashboard/components/DashboardRegistry";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
    DashboardStatsSkeleton,
    DashboardSubmissionsSkeleton
} from "@/features/dashboard/components/DashboardSkeletons";

export const metadata = {
    title: "Reviewer Dashboard | IJITEST",
};

const getReviewerAssignments = cache(async (userId: string) => {
    return await db.select({
        id: reviewAssignments.id,
        status: reviewAssignments.status,
        assignedAt: reviewAssignments.assignedAt,
        deadline: reviewAssignments.deadline,
        title: submissionVersions.title,
        paperId: submissions.paperId,
        submissionId: submissions.id
    })
        .from(reviewAssignments)
        .leftJoin(submissions, eq(reviewAssignments.submissionId, submissions.id))
        .leftJoin(submissionVersions, and(eq(submissions.id, submissionVersions.submissionId), eq(submissionVersions.versionNumber, 1)))
        .where(eq(reviewAssignments.reviewerId, userId))
        .orderBy(desc(reviewAssignments.assignedAt))
        .limit(10);
});

/* Streaming Component: Reviewer Stats */
async function ReviewerStatsSection({ userId }: { userId: string }) {
    try {
        const assignedReviews = await getReviewerAssignments(userId);
        const totalAssigned = assignedReviews.length;
        const completedReviews = assignedReviews.filter(r => r.status === 'completed').length;
        const pendingReviews = assignedReviews.filter(r => r.status === 'assigned' || r.status === 'accepted').length;
        const completionRate = totalAssigned > 0 ? (completedReviews / totalAssigned) * 100 : 0;

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="p-3.5 sm:p-4 bg-card border-border/70 shadow-2xs rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                        </div>
                        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-none font-semibold text-[10px]">TOTAL</Badge>
                    </div>
                    <div>
                        <h4 className="text-xl lg:text-2xl font-bold text-foreground">{totalAssigned}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Assigned Tasks</p>
                    </div>
                </Card>

                <Card className="p-3.5 sm:p-4 bg-card border-border/70 shadow-2xs rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-semibold text-[10px]">DONE</Badge>
                    </div>
                    <div>
                        <h4 className="text-xl lg:text-2xl font-bold text-foreground">{completedReviews}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Completed Evaluations</p>
                    </div>
                </Card>

                <Card className="p-3.5 sm:p-4 bg-card border-border/70 shadow-2xs rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-amber-500" />
                        </div>
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-none font-semibold text-[10px]">PENDING</Badge>
                    </div>
                    <div>
                        <h4 className="text-xl lg:text-2xl font-bold text-foreground">{pendingReviews}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">Awaiting Review</p>
                    </div>
                </Card>

                <Card className="p-3.5 sm:p-4 bg-card border-border/70 shadow-2xs rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                            <Zap className="w-4 h-4 text-purple-500" />
                        </div>
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-none font-semibold text-[10px]">HEALTH</Badge>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-lg font-bold text-foreground">{completionRate.toFixed(0)}%</h4>
                            <span className="text-[10px] text-muted-foreground">Accuracy</span>
                        </div>
                        <Progress value={completionRate} className="h-1.5 bg-muted" />
                    </div>
                </Card>
            </div>
        );
    } catch (err) {
        console.error("ReviewerStatsSection error:", err);
        return <div className="p-4 text-xs text-muted-foreground">Unable to load review statistics</div>;
    }
}

/* Streaming Component: Reviewer Assignment Queue */
async function ReviewerQueueSection({ userId }: { userId: string }) {
    try {
        const assignedReviews = await getReviewerAssignments(userId);

        return (
            <Card className="lg:col-span-8 border-border/70 shadow-2xs bg-card overflow-hidden rounded-xl">
                <div className="p-3.5 sm:p-4 border-b border-border/70 flex items-center justify-between bg-muted/10">
                    <h3 className="card-title-brand font-semibold text-sm">Evaluation Queue</h3>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-medium text-muted-foreground">Live Updates</span>
                    </div>
                </div>
                <div className="divide-y divide-border/70">
                    {assignedReviews.length === 0 ? (
                        <div className="p-10 text-center space-y-2.5">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center mx-auto opacity-40">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="font-semibold text-sm text-foreground">No Assignments Found</p>
                                <p className="text-xs text-muted-foreground">New tasks will appear here once editorial authorization is granted.</p>
                            </div>
                        </div>
                    ) : assignedReviews.map((review) => (
                        <div key={review.id} className="p-3.5 sm:p-4 hover:bg-muted/10 transition-colors group">
                            <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1.5 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] font-mono border-border/70 px-2 py-0.5">REF: {review.paperId}</Badge>
                                        <Badge className={`text-[10px] font-semibold py-0.5 px-2 border-none ${review.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                            {review.status}
                                        </Badge>
                                        {review.deadline && (
                                            <span className="text-[10px] font-medium text-rose-500 flex items-center gap-1">
                                                <Timer className="w-3 h-3" /> Due {new Date(review.deadline).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{review.title}</h4>
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-60" /> Assigned {review.assignedAt ? new Date(review.assignedAt).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                </div>
                                <Button asChild size="sm" className="btn-secondary h-8 px-3 font-semibold text-xs rounded-lg transition-colors">
                                    <Link href={`/reviewer/submissions/${review.submissionId}`}>
                                        Evaluate <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        );
    } catch (err) {
        console.error("ReviewerQueueSection error:", err);
        return <div className="p-8 text-center text-xs text-muted-foreground">Unable to load evaluation queue</div>;
    }
}

/* Streaming Component: Reviewer My Submissions */
async function ReviewerMySubmissionsSection() {
    try {
        const mySubmissions = await getMySubmissions();

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {mySubmissions.length === 0 ? (
                    <Card className="md:col-span-2 lg:col-span-3 border-dashed border border-border/70 bg-muted/10 py-10 text-center rounded-xl">
                        <div className="flex flex-col items-center gap-2 max-w-xs mx-auto text-muted-foreground">
                            <FileText className="w-7 h-7 opacity-30" />
                            <span className="font-semibold text-xs">No Personal Records</span>
                            <Button asChild size="sm" className="btn-primary mt-1.5 h-8 font-semibold text-xs rounded-lg shadow-2xs">
                                <Link href="/submit">Start Submission</Link>
                            </Button>
                        </div>
                    </Card>
                ) : mySubmissions.map((paper: DashboardSubmission) => (
                    <Card key={paper.id} className="border-border/70 shadow-2xs bg-card hover:shadow-sm transition-all group overflow-hidden rounded-xl">
                        <div className="p-3.5 sm:p-4 space-y-2.5">
                            <div className="flex items-center justify-between">
                                <Badge variant="outline" className="text-[10px] border-border/70 bg-muted/30 px-2 py-0.5">ID: {paper.paperId}</Badge>
                                <Badge className={`text-[10px] font-semibold py-0.5 px-2 border-none ${paper.status === 'published' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' :
                                    paper.status === 'rejected' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30' :
                                        'badge-brand'
                                    }`}>
                                    {paper.status}
                                </Badge>
                            </div>
                            <h3 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem]">{paper.title}</h3>
                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2.5 border-t border-border/70">
                                <span className="flex items-center gap-1.5 font-medium"><Clock className="w-3.5 h-3.5 opacity-60" /> {paper.submittedAt ? new Date(paper.submittedAt).toLocaleDateString() : 'N/A'}</span>
                                <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-primary hover:bg-primary/10 rounded-md font-semibold text-xs">
                                    <Link href={`/track?id=${paper.paperId}`} className="flex items-center gap-1">
                                        Trace <ExternalLink className="w-3 h-3" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        );
    } catch (err) {
        console.error("ReviewerMySubmissionsSection error:", err);
        return <div className="p-8 text-center text-xs text-muted-foreground">Unable to load personal records</div>;
    }
}

function ReviewerDashboardSkeleton() {
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

export default function ReviewerDashboard() {
    return (
        <Suspense fallback={<ReviewerDashboardSkeleton />}>
            <ReviewerDashboardContent />
        </Suspense>
    );
}

async function ReviewerDashboardContent() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== 'reviewer') {
        redirect('/login');
    }

    return (
        <section className="space-y-4">
            {/* Header / Welcome Area - Renders immediately */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="badge-brand text-[10px] font-medium px-2.5 py-0.5 rounded-md">Reviewer Portal</Badge>
                    </div>
                    <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">
                        Reviewer Intel Center
                    </h1>
                    <p className="panel-subtitle text-body-sm text-muted-foreground">
                        Logged in as <span className="font-semibold text-foreground">{user.name || user.email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Button asChild size="sm" className="btn-primary h-9 font-semibold text-xs rounded-lg shadow-2xs">
                        <Link href="/reviewer/reviews">Open Assignment Hub</Link>
                    </Button>
                </div>
            </header>

            {/* Quick Stats Grid - Streamed */}
            <Suspense fallback={<DashboardStatsSkeleton />}>
                <ReviewerStatsSection userId={user.id} />
            </Suspense>

            {/* Main Content Area */}
            <Tabs defaultValue="active-tasks" className="space-y-3 sm:space-y-4">
                <TabsList className="bg-muted/40 p-1 rounded-lg border border-border/70">
                    <TabsTrigger value="active-tasks" className="rounded-md font-medium text-xs px-3.5 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs">Evaluation Queue</TabsTrigger>
                    <TabsTrigger value="my-papers" className="rounded-md font-medium text-xs px-3.5 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-2xs">Personal Records</TabsTrigger>
                </TabsList>

                <TabsContent value="active-tasks" className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
                        {/* Task List (8 cols) - Streamed */}
                        <Suspense fallback={
                            <Card className="lg:col-span-8 border-border/70 shadow-2xs bg-card p-6 space-y-4 animate-pulse rounded-xl">
                                <div className="h-6 w-1/3 bg-muted/50 rounded" />
                                <div className="space-y-3">
                                    <div className="h-16 bg-muted/40 rounded-lg" />
                                    <div className="h-16 bg-muted/40 rounded-lg" />
                                    <div className="h-16 bg-muted/40 rounded-lg" />
                                </div>
                            </Card>
                        }>
                            <ReviewerQueueSection userId={user.id} />
                        </Suspense>

                        {/* Sidebar Info (4 cols) - Static, Renders immediately */}
                        <Card className="lg:col-span-4 border-border/70 shadow-2xs bg-muted/5 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
                            <div className="space-y-3">
                                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                                    <MessageSquare className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="card-title-brand font-semibold text-base">Editorial Guidelines</h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Please ensure all evaluations are completed within the designated timeframe. Your intelligence directly impacts the journal&apos;s publication cycle.
                                </p>
                                <div className="space-y-2 pt-1">
                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Double-Blind Protocol
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Conflict of Interest Check
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        Technical Merit Criteria
                                    </div>
                                </div>
                            </div>
                            <Button asChild variant="outline" className="btn-outline mt-4 w-full h-8 text-xs font-semibold rounded-lg">
                                <Link href="/reviewer/reviews">Access Management Hub</Link>
                            </Button>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="my-papers" className="space-y-3 sm:space-y-4">
                    <Suspense fallback={<DashboardSubmissionsSkeleton />}>
                        <ReviewerMySubmissionsSection />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </section>
    );
}

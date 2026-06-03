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

export const metadata = {
    title: "Reviewer Dashboard | IJITEST",
};

export default async function ReviewerDashboard() {
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== 'reviewer') {
        redirect('/login');
    }

    // 1. Data Fetching
    const [assignedReviews, mySubmissions] = await Promise.all([
        db.select({
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
            .where(eq(reviewAssignments.reviewerId, user.id))
            .orderBy(desc(reviewAssignments.assignedAt))
            .limit(10),
        getMySubmissions()
    ]);

    // 2. Statistics
    const totalAssigned = assignedReviews.length;
    const completedReviews = assignedReviews.filter(r => r.status === 'completed').length;
    const pendingReviews = assignedReviews.filter(r => r.status === 'assigned' || r.status === 'accepted').length;
    const completionRate = totalAssigned > 0 ? (completedReviews / totalAssigned) * 100 : 0;

    return (
        <section className="space-y-8 pb-20">
            {/* Header / Welcome Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="font-black text-foreground tracking-tight uppercase text-2xl xl:text-3xl">
                        Reviewer Intel <span className="text-primary/40 text-sm font-medium tracking-widest ml-2">Center</span>
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">
                        Logged in as <span className="text-foreground font-bold">{user.name || user.email}</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button asChild size="lg" className="h-12 px-6 bg-primary text-white font-bold uppercase text-[11px] tracking-[0.2em] rounded-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all cursor-pointer">
                        <Link className="cursor-pointer" href="/reviewer/reviews">Open Assignment Hub</Link>
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6 bg-card border-border/50 shadow-sm rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-500" />
                        </div>
                        <Badge variant="outline" className="bg-blue-500/5 text-blue-600 border-none font-bold text-[10px]">TOTAL</Badge>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-foreground">{totalAssigned}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Assigned Tasks</p>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border/50 shadow-sm rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                        </div>
                        <Badge variant="outline" className="bg-emerald-500/5 text-emerald-600 border-none font-bold text-[10px]">DONE</Badge>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-foreground">{completedReviews}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Completed Evaluations</p>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border/50 shadow-sm rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-500" />
                        </div>
                        <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-none font-bold text-[10px]">PENDING</Badge>
                    </div>
                    <div>
                        <h4 className="text-3xl font-black text-foreground">{pendingReviews}</h4>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Awaiting Review</p>
                    </div>
                </Card>

                <Card className="p-6 bg-card border-border/50 shadow-sm rounded-xl space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-purple-500" />
                        </div>
                        <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-none font-bold text-[10px]">HEALTH</Badge>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-xl font-black text-foreground">{completionRate.toFixed(0)}%</h4>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Accuracy</span>
                        </div>
                        <Progress value={completionRate} className="h-1.5 bg-muted" />
                    </div>
                </Card>
            </div>

            {/* Main Content Area */}
            <Tabs defaultValue="active-tasks" className="space-y-6">
                <TabsList className="bg-muted/30 p-1 rounded-xl border border-border/50">
                    <TabsTrigger value="active-tasks" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Evaluation Queue</TabsTrigger>
                    <TabsTrigger value="my-papers" className="rounded-lg font-bold uppercase text-[10px] tracking-widest px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Personal Records</TabsTrigger>
                </TabsList>

                <TabsContent value="active-tasks" className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Task List (8 cols) */}
                        <Card className="lg:col-span-8 border-border/50 shadow-sm bg-card overflow-hidden rounded-xl">
                            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/5">
                                <h3 className="font-bold text-sm uppercase tracking-widest">Evaluation Queue</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates</span>
                                </div>
                            </div>
                            <div className="divide-y divide-border/30">
                                {assignedReviews.length === 0 ? (
                                    <div className="p-20 text-center space-y-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-30">
                                            <Shield className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground">No Assignments Found</p>
                                            <p className="text-[10px] text-muted-foreground/60 font-medium">New tasks will appear here once editorial authorization is granted.</p>
                                        </div>
                                    </div>
                                ) : assignedReviews.map((review) => (
                                    <div key={review.id} className="p-6 hover:bg-muted/10 transition-all group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-3 min-w-0">
                                                <div className="flex flex-wrap items-center gap-3">
                                                    <Badge variant="outline" className="text-[9px] font-mono border-border/50 px-2 py-0.5">REF: {review.paperId}</Badge>
                                                    <Badge className={`text-[9px] font-bold uppercase py-0.5 px-2 border-none ${review.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                        {review.status}
                                                    </Badge>
                                                    {review.deadline && (
                                                        <span className="text-[9px] font-bold text-rose-500 uppercase flex items-center gap-1">
                                                            <Timer className="w-3 h-3" /> Due {new Date(review.deadline).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-primary transition-colors">{review.title}</h4>
                                                <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 opacity-50" /> Assigned {review.assignedAt ? new Date(review.assignedAt).toLocaleDateString() : 'N/A'}</span>
                                                </div>
                                            </div>
                                            <Button asChild size="sm" className="h-9 px-5 bg-foreground text-background hover:bg-primary hover:text-white font-bold uppercase text-[10px] tracking-widest rounded-lg transition-all cursor-pointer">
                                                <Link className="cursor-pointer" href={`/reviewer/reviews/${review.id}`}>
                                                    Evaluate <ArrowRight className="w-3.5 h-3.5 ml-2" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Sidebar Info (4 cols) */}
                        <Card className="lg:col-span-4 border-border/50 shadow-sm bg-muted/5 rounded-xl p-8 flex flex-col h-full">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                                <MessageSquare className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="font-black text-lg uppercase tracking-tight mb-2">Editorial Guidelines</h3>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium mb-8">
                                Please ensure all evaluations are completed within the designated timeframe. Your intelligence directly impacts the journal&apos;s publication cycle.
                            </p>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Double-Blind Protocol
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Conflict of Interest Check
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-foreground uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    Technical Merit Criteria
                                </div>
                            </div>
                            <Button asChild variant="outline" className="mt-auto h-11 text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all cursor-pointer">
                                <Link className="cursor-pointer" href="/reviewer/reviews">Access Management Hub</Link>
                            </Button>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="my-papers" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mySubmissions.length === 0 ? (
                            <Card className="md:col-span-2 lg:col-span-3 border-dashed border-2 border-border/50 bg-muted/10 py-16 text-center rounded-xl">
                                <div className="flex flex-col items-center gap-3 max-w-xs mx-auto text-muted-foreground">
                                    <FileText className="w-10 h-10 opacity-20" />
                                    <span className="font-bold uppercase tracking-widest text-xs">No Personal Records</span>
                                    <Button asChild size="sm" className="mt-2 bg-primary text-white hover:bg-primary/90 font-bold uppercase text-[10px] rounded-lg shadow-sm cursor-pointer">
                                        <Link className="cursor-pointer" href="/submit">Start Submission</Link>
                                    </Button>
                                </div>
                            </Card>
                        ) : mySubmissions.map((paper: DashboardSubmission) => (
                            <Card key={paper.id} className="border-border/50 shadow-sm bg-background hover:shadow-md transition-all group overflow-hidden rounded-xl">
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-[9px] border-none bg-muted px-2 py-0.5">ID: {paper.paperId}</Badge>
                                        <Badge className={`text-[9px] font-bold uppercase py-0.5 px-2 border-none ${paper.status === 'published' ? 'bg-emerald-50 text-emerald-600' :
                                            paper.status === 'rejected' ? 'bg-rose-50 text-rose-600' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                            {paper.status}
                                        </Badge>
                                    </div>
                                    <h3 className="font-bold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors h-10">{paper.title}</h3>
                                    <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-4 border-t border-border/10">
                                        <span className="flex items-center gap-1.5 font-medium uppercase"><Clock className="w-3 h-3 opacity-50" /> {paper.submittedAt ? new Date(paper.submittedAt).toLocaleDateString() : 'N/A'}</span>
                                        <Button asChild variant="ghost" size="sm" className="h-7 px-3 text-primary hover:bg-primary/15 rounded-md font-bold uppercase text-[9px] cursor-pointer">
                                            <Link href={`/track?id=${paper.paperId}`} className="flex items-center gap-1.5 cursor-pointer">
                                                Trace <ExternalLink className="w-3 h-3" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </section>
    );
}

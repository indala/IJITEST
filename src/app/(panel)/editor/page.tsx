import {
    FileStack,
    ShieldCheck,
    CreditCard,
    BookOpen,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Search,
    Calendar,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';
import { getSession } from '@/actions/session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = 'force-dynamic';

export default async function EditorDashboard() {
    try {
        const user = await getSession();

        // Stats for Editor
        const [submissionRows]: any = await pool.execute('SELECT COUNT(*) as count FROM submissions');
        const totalSubmissions = submissionRows[0].count;

        const [reviewRows]: any = await pool.execute("SELECT COUNT(*) as count FROM submissions WHERE status = 'under_review'");
        const underReview = reviewRows[0].count;

        const [paymentRows]: any = await pool.execute("SELECT COUNT(*) as count FROM payments WHERE status = 'unpaid'");
        const pendingPayments = paymentRows[0].count;

        const [issueRows]: any = await pool.execute(
            "SELECT year FROM volumes_issues WHERE status = 'open' ORDER BY year DESC LIMIT 1"
        );
        const currentIssue = issueRows.length > 0
            ? `${issueRows[0].year} Edition`
            : '2026 Edition';

        const stats = [
            { label: 'Total Submissions', value: String(totalSubmissions), icon: <FileStack className="w-5 h-5" />, variant: 'primary', trend: 'Active' },
            { label: 'Under Review', value: String(underReview), icon: <ShieldCheck className="w-5 h-5" />, variant: 'blue', trend: 'Workflow' },
            { label: 'Pending Payment', value: String(pendingPayments), icon: <CreditCard className="w-5 h-5" />, variant: 'emerald', trend: 'Financial' },
            { label: 'Current Edition', value: currentIssue, icon: <BookOpen className="w-5 h-5" />, variant: 'amber', trend: 'Publication' },
        ];

        const [recentSubmissions]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5'
        );

        return (
            <div className="space-y-6">
                {/* Header & Status Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                            Editor Workspace
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground">Manage content lifecycle and review workflows for {user?.fullName}.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            <Search className="w-4 h-4" /> Filter Papers
                        </Button>
                        <Button size="sm" className="h-9 px-3 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                            <FileStack className="w-4 h-4" /> Screen New
                        </Button>
                    </div>
                </div>

                {/* Role Overview Banner */}
                <Card className="bg-blue-600/5 border-blue-600/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <CheckCircle className="w-32 h-32 text-blue-600" />
                    </div>
                    <CardContent className="p-6 sm:p-8">
                        <div className="max-w-3xl space-y-4">
                            <Badge className="bg-blue-600 text-white uppercase text-[9px] font-black tracking-[0.2em] px-2 py-0.5 border-none">The Decision-Maker</Badge>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Focus: Content Flow & Life Cycle Management</h2>
                            <div className="flex flex-wrap gap-2">
                                {['Pre-screening submissions', 'Assigning reviewers', 'Final Accept/Reject decisions', 'Scheduling releases'].map((action, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-background/50 border border-blue-600/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground">
                                        <div className="w-1 h-1 bg-blue-600 rounded-full" />
                                        {action}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="border-border/50 shadow-sm group">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <h3 className="text-2xl font-black text-foreground tracking-tighter">{stat.value}</h3>
                                    <Badge variant="outline" className={`h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter bg-muted/50 border-none ${stat.variant === 'primary' ? 'text-primary' : stat.variant === 'blue' ? 'text-blue-500' : stat.variant === 'emerald' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${stat.variant === 'primary' ? 'bg-primary/10 text-primary' : stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-500' : stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Submissions List */}
                    <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col">
                        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">Recent Submissions</CardTitle>
                                <CardDescription className="text-[10px] font-medium text-muted-foreground mt-1 text-xs">Awaiting editorial action or review assignment.</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                                <Link href="/editor/submissions" className="flex items-center gap-2">
                                    View Queue <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="divide-y divide-border/50">
                                {recentSubmissions.map((sub: any) => (
                                    <Link
                                        href={`/editor/submissions/${sub.id}`}
                                        key={sub.paper_id}
                                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors group"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-10 rounded-lg bg-muted flex items-center justify-center font-mono font-black text-[9px] text-muted-foreground border border-border shrink-0">
                                                {sub.paper_id.split('-').pop()}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs font-black text-foreground truncate group-hover:text-primary transition-colors">{sub.title}</h4>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                                                    {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="ml-4 h-5 px-1.5 text-[8px] font-black uppercase tracking-widest whitespace-nowrap bg-primary/5 text-primary border-none">
                                            {sub.status.replace('_', ' ')}
                                        </Badge>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Operational Tasks */}
                    <div className="space-y-6 flex flex-col">
                        <Card className="bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20 flex-1 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <CardHeader className="p-6">
                                <CardTitle className="text-xl font-black tracking-tight">Editor Tasks</CardTitle>
                                <CardDescription className="text-[11px] font-medium text-white/70">Workflow management & screening.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-3 flex-1">
                                <div className="space-y-2">
                                    {[
                                        { icon: ShieldCheck, label: 'Screen new manuscripts' },
                                        { icon: AlertCircle, label: 'Assign expert reviewers' },
                                        { icon: BookOpen, label: 'Review editorial guidelines' }
                                    ].map((action, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors cursor-default">
                                            <action.icon className="w-4 h-4 text-white/60" />
                                            <span className="text-xs font-bold text-white/90">{action.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-6 mt-auto">
                                <Button asChild className="w-full bg-white text-blue-600 hover:bg-white/90 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl shadow-lg shadow-black/10">
                                    <Link href="/editor/submissions">
                                        Open Submissions Queue
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Editor Dashboard Error:", error);
        return <div className="p-8 text-center text-muted-foreground font-black uppercase text-xs">Error loading editor dashboard. Check server logs.</div>;
    }
}

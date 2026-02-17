import {
    FileStack,
    Users,
    Activity,
    BookOpen,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    Search,
    UserPlus,
    ShieldCheck
} from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';
import { getSession } from '@/actions/session';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    try {
        const user = await getSession();

        // Stats for Admin
        const [submissionRows]: any = await pool.execute('SELECT COUNT(*) as count FROM submissions');
        const totalSubmissions = submissionRows[0].count;

        const [userRows]: any = await pool.execute('SELECT COUNT(*) as count FROM users');
        const totalUsers = userRows[0].count;

        const [issueRows]: any = await pool.execute(
            "SELECT year FROM volumes_issues WHERE status = 'open' ORDER BY year DESC LIMIT 1"
        );
        const currentIssue = issueRows.length > 0
            ? `${issueRows[0].year} Edition`
            : '2026 Edition';

        const stats = [
            { label: 'System Health', value: '100%', icon: <Activity className="w-5 h-5" />, variant: 'emerald', trend: 'Online' },
            { label: 'Total Staff', value: String(totalUsers), icon: <Users className="w-5 h-5" />, variant: 'primary', trend: 'Active' },
            { label: 'Submissions', value: String(totalSubmissions), icon: <FileStack className="w-5 h-5" />, variant: 'blue', trend: 'Managed' },
            { label: 'Edition', value: currentIssue, icon: <BookOpen className="w-5 h-5" />, variant: 'amber', trend: 'Public' },
        ];

        const [recentSubmissions]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 5'
        );

        return (
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black text-foreground tracking-tight flex items-center gap-2">
                            System Overview
                        </h1>
                        <p className="text-xs font-medium text-muted-foreground">Infrastructure and technical oversight for {user?.fullName}.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg">
                            <Search className="w-4 h-4" /> Global Search
                        </Button>
                        <Button size="sm" className="h-9 px-3 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                            <UserPlus className="w-4 h-4" /> New Staff
                        </Button>
                    </div>
                </div>

                {/* Main Action Banner */}
                <Card className="bg-primary/5 border-primary/10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <ShieldCheck className="w-32 h-32" />
                    </div>
                    <CardContent className="p-6 sm:p-8">
                        <div className="max-w-3xl space-y-4">
                            <Badge className="bg-primary text-white uppercase text-[9px] font-black tracking-[0.2em] px-2 py-0.5 border-none">Architect Active</Badge>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Main Job: Infrastructure & Technical Oversight</h2>
                            <div className="flex flex-wrap gap-2">
                                {['Creating user accounts', 'Managing site security', 'Updating journal metadata'].map((action, i) => (
                                    <div key={i} className="flex items-center gap-2 bg-background/50 border border-primary/10 px-3 py-1.5 rounded-lg text-[10px] font-bold text-muted-foreground">
                                        <div className="w-1 h-1 bg-primary rounded-full" />
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
                                    <Badge variant="outline" className={`h-4 px-1.5 text-[8px] font-black uppercase tracking-tighter bg-muted/50 border-none ${stat.variant === 'emerald' ? 'text-emerald-500' : stat.variant === 'primary' ? 'text-primary' : 'text-blue-500'}`}>
                                        {stat.trend}
                                    </Badge>
                                </div>
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-500' : stat.variant === 'primary' ? 'bg-primary/10 text-primary' : stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                    {stat.icon}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Global Activity */}
                    <Card className="lg:col-span-2 border-border/50 shadow-sm flex flex-col">
                        <CardHeader className="p-6 flex flex-row items-center justify-between space-y-0 pb-4">
                            <div>
                                <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">Recent Global Activity</CardTitle>
                                <CardDescription className="text-[10px] font-medium text-muted-foreground mt-1 text-xs">Latest submissions across the journal.</CardDescription>
                            </div>
                            <Button asChild variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5">
                                <Link href="/admin/submissions" className="flex items-center gap-2">
                                    Full Audit <ArrowRight className="w-3.5 h-3.5" />
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                            <div className="divide-y divide-border/50">
                                {recentSubmissions.map((sub: any) => (
                                    <Link
                                        href={`/admin/submissions/${sub.id}`}
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

                    {/* Secondary Metrics / Quick Link */}
                    <div className="space-y-6 flex flex-col">
                        <Card className="bg-secondary text-white border-none shadow-xl shadow-secondary/20 flex-1 flex flex-col relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <TrendingUp className="w-24 h-24" />
                            </div>
                            <CardHeader className="p-6">
                                <CardTitle className="text-xl font-black tracking-tight">Architect Mode</CardTitle>
                                <CardDescription className="text-[11px] font-medium text-white/70">Technical control and monitoring.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-6 pt-0 space-y-3 flex-1">
                                <div className="space-y-2">
                                    {[
                                        { icon: ShieldCheck, label: 'Manage credentials' },
                                        { icon: Activity, label: 'Inspect server logs' },
                                        { icon: Users, label: 'Control user permissions' }
                                    ].map((action, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-white/10 p-3 rounded-xl hover:bg-white/20 transition-colors cursor-default">
                                            <action.icon className="w-4 h-4 text-white/60" />
                                            <span className="text-xs font-bold text-white/90">{action.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                            <div className="p-6 mt-auto">
                                <Button asChild className="w-full bg-white text-secondary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest h-11 rounded-xl shadow-lg shadow-black/10">
                                    <Link href="/admin/users">
                                        Manage Users & Access
                                    </Link>
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Admin Dashboard Error:", error);
        return <div className="p-8 text-center text-muted-foreground font-black uppercase text-xs">Error loading admin dashboard. Check server logs.</div>;
    }
}

import {
    FileStack,
    ShieldCheck,
    CreditCard,
    BookOpen,
    AlertCircle,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

import { getSession } from '@/actions/session';

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
            { label: 'Total Submissions', value: String(totalSubmissions), icon: <FileStack className="w-6 h-6" />, color: 'bg-primary', trend: 'Active' },
            { label: 'Under Review', value: String(underReview), icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-blue-600', trend: 'Workflow' },
            { label: 'Pending Payment', value: String(pendingPayments), icon: <CreditCard className="w-6 h-6" />, color: 'bg-secondary', trend: 'Financial' },
            { label: 'Current Edition', value: currentIssue, icon: <BookOpen className="w-6 h-6" />, color: 'bg-green-600', trend: 'Publication' },
        ];

        const [recentRows]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 3'
        );

        const currentRole = {
            title: 'Editor',
            subtitle: 'The Decision-Maker',
            job: 'Content Flow & Life Cycle Management',
            actions: ['Pre-screening submissions', 'Assigning reviewers', 'Final Accept/Reject decisions', 'Scheduling publication releases']
        };

        return (
            <div className="space-y-12">
                {/* Role Overview */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-4 py-1.5 rounded-full bg-blue-600/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                                        Active Role: {currentRole.title}
                                    </span>
                                    <span className="text-gray-400 font-bold text-sm italic">"{currentRole.subtitle}"</span>
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 mb-2">Welcome Back, {user?.fullName}</h2>
                                <p className="text-gray-500 font-medium max-w-2xl">
                                    <span className="font-bold text-gray-900">Main Job:</span> {currentRole.job}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {currentRole.actions.slice(0, 2).map((action, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-gray-50 text-gray-600 text-xs font-bold border border-gray-100 italic">
                                        • {action}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter bg-blue-50 text-blue-600">
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                            <h3 className="text-3xl font-serif font-black text-gray-900">{stat.value}</h3>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Recent Submissions</h2>
                            <Link href="/editor/submissions" className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {recentRows.map((sub: any) => (
                                <Link
                                    href={`/editor/submissions/${sub.id}`}
                                    key={sub.paper_id}
                                    className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-white transition-all cursor-pointer group/item"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-12 rounded-xl bg-white flex items-center justify-center font-mono font-black text-[10px] text-gray-400 border border-gray-100 px-2 text-center">
                                            {sub.paper_id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{sub.title}</h4>
                                            <p className="text-xs text-gray-500">By {sub.author_name} • {new Date(sub.submitted_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {sub.status.replace('_', ' ')}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="relative z-10">
                            <TrendingUp className="w-12 h-12 mb-6 opacity-30" />
                            <h2 className="text-2xl font-serif font-black mb-4">Editor Tasks</h2>
                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-white/50" />
                                    <span className="text-sm font-bold">Screen new manuscripts</span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-white/50" />
                                    <span className="text-sm font-bold">Review editorial guidelines</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/editor/submissions" className="bg-white text-blue-600 w-full py-4 rounded-xl font-bold mt-8 shadow-xl shadow-black/10 hover:bg-gray-100 transition-all text-center block">
                            Review Submissions
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Editor Dashboard Error:", error);
        return <div>Error loading editor dashboard.</div>;
    }
}

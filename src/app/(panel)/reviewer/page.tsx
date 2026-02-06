import {
    FileStack,
    ShieldCheck,
    AlertCircle,
    TrendingUp,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

import { getSession } from '@/actions/session';

export default async function ReviewerDashboard() {
    try {
        const user = await getSession();
        if (!user) redirect('/login');

        // Stats for Reviewer
        const [pendingRows]: any = await pool.execute(
            "SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ? AND status != 'completed'",
            [user.id]
        );
        const [completedRows]: any = await pool.execute(
            "SELECT COUNT(*) as count FROM reviews WHERE reviewer_id = ? AND status = 'completed'",
            [user.id]
        );

        const stats = [
            { label: 'Pending Reviews', value: String(pendingRows[0].count), icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-blue-600', trend: 'Due Soon' },
            { label: 'Completed', value: String(completedRows[0].count), icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-green-600', trend: 'History' },
            { label: 'Papers Assigned', value: String(pendingRows[0].count + completedRows[0].count), icon: <FileStack className="w-6 h-6" />, color: 'bg-primary', trend: '+100%' },
        ];

        const [assignedRows]: any = await pool.execute(`
            SELECT r.id, s.paper_id, s.title, s.author_name, r.status, r.assigned_at 
            FROM reviews r 
            JOIN submissions s ON r.submission_id = s.id 
            WHERE r.reviewer_id = ? 
            ORDER BY r.assigned_at DESC LIMIT 3
        `, [user.id]);

        const currentRole = {
            title: 'Reviewer',
            subtitle: 'The Expert Witness',
            job: 'Technical Evaluation & Quality Control',
            actions: ['Reading manuscripts', 'Checking for plagiarism/errors', 'Providing recommendations', 'Supporting technical excellence']
        };

        return (
            <div className="space-y-12">
                {/* Role Overview */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full translate-x-32 -translate-y-32 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="px-4 py-1.5 rounded-full bg-green-600/10 text-green-600 text-[10px] font-black uppercase tracking-widest">
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group">
                            <div className="flex items-center justify-between mb-6">
                                <div className={`${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    {stat.icon}
                                </div>
                                <span className="text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter bg-green-50 text-green-600">
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
                            <h2 className="text-2xl font-serif font-black text-gray-900">My Recent Assignments</h2>
                            <Link href="/reviewer/reviews" className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {assignedRows.map((sub: any) => (
                                <Link
                                    href="/reviewer/reviews"
                                    key={sub.paper_id}
                                    className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-white transition-all cursor-pointer group/item"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-12 rounded-xl bg-white flex items-center justify-center font-mono font-black text-[10px] text-gray-400 border border-gray-100 px-2 text-center">
                                            {sub.paper_id}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{sub.title}</h4>
                                            <p className="text-xs text-gray-500">By {sub.author_name} • {new Date(sub.assigned_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                        {sub.status.replace('_', ' ')}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="bg-green-600 p-10 rounded-[2.5rem] text-white relative overflow-hidden h-full flex flex-col justify-between">
                        <div className="relative z-10">
                            <TrendingUp className="w-12 h-12 mb-6 opacity-30" />
                            <h2 className="text-2xl font-serif font-black mb-4">Review Tasks</h2>
                            <div className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-white/50" />
                                    <span className="text-sm font-bold">Complete pending evaluations</span>
                                </div>
                            </div>
                        </div>
                        <Link href="/reviewer/reviews" className="bg-white text-green-600 w-full py-4 rounded-xl font-bold mt-8 shadow-xl shadow-black/10 hover:bg-gray-100 transition-all text-center block">
                            Open Review Portal
                        </Link>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Reviewer Dashboard Error:", error);
        return <div>Error loading reviewer dashboard.</div>;
    }
}

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

export default async function AdminDashboard() {
    try {
        // Fetch stats from MySQL
        const [submissionRows]: any = await pool.execute('SELECT COUNT(*) as count FROM submissions');
        const totalSubmissions = submissionRows[0].count;

        const [reviewRows]: any = await pool.execute("SELECT COUNT(*) as count FROM submissions WHERE status = 'under_review'");
        const underReview = reviewRows[0].count;

        const [recentRows]: any = await pool.execute(
            'SELECT id, paper_id, title, author_name, status, submitted_at FROM submissions ORDER BY submitted_at DESC LIMIT 3'
        );

        const stats = [
            { label: 'Total Submissions', value: String(totalSubmissions), icon: <FileStack className="w-6 h-6" />, color: 'bg-primary', trend: '+100%' },
            { label: 'Under Review', value: String(underReview), icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-blue-600', trend: 'Active' },
            { label: 'Pending Payment', value: '0', icon: <CreditCard className="w-6 h-6" />, color: 'bg-secondary', trend: 'Stable' },
            { label: 'Current Issue', value: 'Vol 1, Iss 1', icon: <BookOpen className="w-6 h-6" />, color: 'bg-green-600', trend: 'In Progress' },
        ];

        return (
            <div className="space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    {/* Recent Submissions */}
                    <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm p-10">
                        <div className="flex items-center justify-between mb-10">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Recent Submissions</h2>
                            <Link href="/admin/submissions" className="text-primary font-bold text-sm flex items-center gap-2 hover:underline">
                                View All <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-6">
                            {recentRows.map((sub: any) => (
                                <Link
                                    href={`/admin/submissions/${sub.id}`}
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
                            {recentRows.length === 0 && (
                                <p className="text-center py-10 text-gray-400 font-bold uppercase tracking-widest italic text-sm">No recent submissions</p>
                            )}
                        </div>
                    </div>

                    {/* System Health / Quick Action */}
                    <div className="space-y-8">
                        <div className="bg-secondary p-10 rounded-[2.5rem] text-white relative overflow-hidden h-full flex flex-col justify-between">
                            <div className="relative z-10">
                                <TrendingUp className="w-12 h-12 mb-6 opacity-30" />
                                <h2 className="text-2xl font-serif font-black mb-4">Urgent Tasks</h2>
                                <div className="space-y-4">
                                    <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                        <AlertCircle className="w-5 h-5 text-white/50" />
                                        <span className="text-sm font-bold">Review system active</span>
                                    </div>
                                    <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                        <AlertCircle className="w-5 h-5 text-white/50" />
                                        <span className="text-sm font-bold">Database connected</span>
                                    </div>
                                </div>
                            </div>
                            <button className="bg-white text-secondary w-full py-4 rounded-xl font-bold mt-8 shadow-xl shadow-black/10 hover:bg-gray-100 transition-all">
                                Review Submissions
                            </button>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    } catch (error: any) {
        console.error("Dashboard Dashboard Error:", error);
        return (
            <div className="p-10 bg-red-50 border border-red-100 rounded-[2.5rem] text-red-600">
                <h2 className="text-xl font-bold mb-4">Dashboard Error</h2>
                <p className="mb-4">We encountered an issue while loading the dashboard. This is likely due to a database connection problem.</p>
                <div className="bg-white/50 p-4 rounded-xl font-mono text-xs">
                    {error.message}
                </div>
                <p className="mt-6 text-sm">Please check your <strong>.env</strong> file and ensure the MySQL credentials are correct.</p>
            </div>
        );
    }
}

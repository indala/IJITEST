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

const stats = [
    { label: 'Total Submissions', value: '1,248', icon: <FileStack className="w-6 h-6" />, color: 'bg-primary', trend: '+12%' },
    { label: 'Under Review', value: '45', icon: <ShieldCheck className="w-6 h-6" />, color: 'bg-blue-600', trend: '+3' },
    { label: 'Pending Payment', value: '12', icon: <CreditCard className="w-6 h-6" />, color: 'bg-secondary', trend: '-2' },
    { label: 'Volume 10, Issue 5', value: '85%', icon: <BookOpen className="w-6 h-6" />, color: 'bg-green-600', trend: 'In Progress' },
];

const recentSubmissions = [
    { id: '001', title: 'Machine Learning for Energy', author: 'Dr. Rajesh', status: 'Submitted', time: '2 hours ago' },
    { id: '098', title: 'IoT Security Survey', author: 'Sarah Jenkins', status: 'In Review', time: '5 hours ago' },
    { id: '045', title: 'Blockchain Protocols', author: 'Michael Zhang', status: 'Accepted', time: '1 day ago' },
];

export default function AdminDashboard() {
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
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${stat.trend.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                                }`}>
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
                        {recentSubmissions.map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-white transition-all">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center font-mono font-black text-xs text-gray-400 border border-gray-100">
                                        #{sub.id}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">{sub.title}</h4>
                                        <p className="text-xs text-gray-500">By {sub.author} • {sub.time}</p>
                                    </div>
                                </div>
                                <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
                                    {sub.status}
                                </span>
                            </div>
                        ))}
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
                                    <span className="text-sm font-bold">5 Peer reviews overdue</span>
                                </div>
                                <div className="bg-white/10 p-4 rounded-xl flex items-center gap-4">
                                    <AlertCircle className="w-5 h-5 text-white/50" />
                                    <span className="text-sm font-bold">3 High similarity reports</span>
                                </div>
                            </div>
                        </div>
                        <button className="bg-white text-secondary w-full py-4 rounded-xl font-bold mt-8 shadow-xl shadow-black/10 hover:bg-gray-100 transition-all">
                            Launch Review Board
                        </button>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full translate-x-16 -translate-y-16"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

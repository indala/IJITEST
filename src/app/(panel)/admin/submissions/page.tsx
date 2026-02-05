import {
    Search,
    Filter,
    MoreVertical,
    Download,
    Eye,
    Paperclip,
    CheckCircle2,
    Clock,
    AlertTriangle
} from 'lucide-react';
import pool from '@/lib/db';
import Link from 'next/link';

export default async function Submissions() {
    // Fetch submissions from MySQL
    const [rows]: any = await pool.execute(
        'SELECT * FROM submissions ORDER BY submitted_at DESC'
    );

    const submissions = rows;

    return (
        <div className="space-y-8">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="relative flex-1 max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        className="w-full bg-white border border-gray-100 pl-12 pr-4 py-4 rounded-2xl shadow-sm focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                        placeholder="Search by Paper ID, Title, or Author..."
                    />
                </div>
                <div className="flex items-center gap-4">
                    <button className="bg-white border border-gray-100 p-4 rounded-2xl text-gray-500 hover:text-primary hover:border-primary/20 transition-all shadow-sm flex items-center gap-2 font-bold">
                        <Filter className="w-5 h-5" /> Filter
                    </button>
                    <Link href="/submit" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                        Add Manual Submission
                    </Link>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Paper ID</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Details</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Submission Date</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {submissions.map((sub: any) => (
                            <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-8 py-8">
                                    <span className="font-mono font-black text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-500">
                                        {sub.paper_id}
                                    </span>
                                </td>
                                <td className="px-8 py-8">
                                    <h4 className="font-bold text-gray-900 text-sm mb-1">{sub.title}</h4>
                                    <p className="text-xs text-gray-400 font-medium">Author: {sub.author_name}</p>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                                        <Clock className="w-4 h-4 text-gray-300" /> {new Date(sub.submitted_at).toLocaleDateString()}
                                    </div>
                                </td>
                                <td className="px-8 py-8">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'submitted' ? 'bg-blue-50 text-blue-600' :
                                        sub.status === 'under_review' ? 'bg-orange-50 text-orange-600' :
                                            sub.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                                        }`}>
                                        {sub.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-8 py-8">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link href={`/admin/submissions/${sub.id}`} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                        {sub.file_path && (
                                            <a href={sub.file_path} download className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                                <Download className="w-5 h-5" />
                                            </a>
                                        )}
                                        <button className="p-3 text-gray-300 hover:text-gray-600 transition-all">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {submissions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest italic">
                                    No submissions found in the database.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* Pagination Placeholder */}
                <div className="bg-gray-50/30 px-8 py-6 flex items-center justify-between border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Showing {submissions.length} Submissions</p>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 bg-white border border-gray-100 rounded-lg text-xs font-bold text-gray-400 cursor-not-allowed">Previous</button>
                        <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-primary shadow-sm">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

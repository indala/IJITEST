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
import DeleteSubmissionButton from "@/features/submissions/components/DeleteSubmissionButton";
import SubmissionTabs from '@/features/submissions/components/SubmissionTabs';

export const dynamic = 'force-dynamic';

export default async function Submissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams;
    const currentStatus = status || 'all';

    // Fetch submissions from MySQL with optional status filtering
    let query = 'SELECT * FROM submissions';
    let params: any[] = [];

    if (currentStatus === 'pending') {
        query += ' WHERE status IN ("under_review", "accepted")';
    } else if (currentStatus !== 'all') {
        query += ' WHERE status = ?';
        params.push(currentStatus);
    }

    query += ' ORDER BY submitted_at DESC';

    const [rows]: any = await pool.execute(query, params);
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

            {/* Status Tabs */}
            <SubmissionTabs currentStatus={currentStatus} />

            {/* Submissions List */}
            <div className="w-full">
                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left font-sans">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Paper ID</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Details</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Submission Date</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 uppercase">
                            {submissions.map((sub: any) => (
                                <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-8">
                                        <span className="font-mono font-black text-xs bg-gray-100 px-3 py-1.5 rounded-lg text-gray-500">
                                            {sub.paper_id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-8">
                                        <h4 className="font-bold text-gray-900 text-sm mb-1 tracking-tight">{sub.title}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-widest">Author: {sub.author_name}</p>
                                    </td>
                                    <td className="px-8 py-8">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 tracking-widest">
                                            <Clock className="w-4 h-4 text-primary" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-8">
                                        <span className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.25em] shadow-sm border ${sub.status === 'submitted' ? 'bg-indigo-50 text-indigo-900 border-indigo-100' :
                                                sub.status === 'under_review' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                                    sub.status === 'accepted' ? 'bg-purple-50 text-purple-900 border-purple-100' :
                                                        sub.status === 'rejected' ? 'bg-rose-50 text-rose-900 border-rose-100' :
                                                            sub.status === 'paid' ? 'bg-emerald-50 text-emerald-900 border-emerald-100' : 'bg-cyan-50 text-cyan-900 border-cyan-100'
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
                                            {sub.status !== 'paid' && sub.status !== 'published' && (
                                                <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="icon" />
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {submissions.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] italic">
                                        No active submissions found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {submissions.map((sub: any) => (
                        <div key={sub.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4">
                                <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${sub.status === 'submitted' ? 'bg-indigo-50 text-indigo-900 border-indigo-100' :
                                        sub.status === 'under_review' ? 'bg-amber-50 text-amber-900 border-amber-100' :
                                            sub.status === 'accepted' ? 'bg-purple-50 text-purple-900 border-purple-100' :
                                                sub.status === 'rejected' ? 'bg-rose-50 text-rose-900 border-rose-100' :
                                                    sub.status === 'paid' ? 'bg-emerald-50 text-emerald-900 border-emerald-100' : 'bg-cyan-50 text-cyan-900 border-cyan-100'
                                    }`}>
                                    {sub.status.replace('_', ' ')}
                                </span>
                            </div>

                            <div className="mb-4">
                                <span className="font-mono font-black text-[10px] text-primary bg-primary/5 px-2 py-1 rounded-lg">
                                    {sub.paper_id}
                                </span>
                            </div>

                            <h4 className="font-bold text-gray-900 text-sm mb-2 leading-snug">{sub.title}</h4>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">By {sub.author_name}</p>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                    <Clock className="w-3 h-3" />
                                    {new Date(sub.submitted_at).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Link href={`/admin/submissions/${sub.id}`} className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                        <Eye className="w-4 h-4" />
                                    </Link>
                                    {sub.file_path && (
                                        <a href={sub.file_path} download className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-primary/10 hover:text-primary transition-all">
                                            <Download className="w-4 h-4" />
                                        </a>
                                    )}
                                    {sub.status !== 'paid' && sub.status !== 'published' && (
                                        <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="icon" />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                    {submissions.length === 0 && (
                        <div className="bg-white p-12 rounded-[2rem] border border-dashed border-gray-200 text-center">
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">No active submissions found</p>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                <div className="mt-8 bg-white md:bg-gray-50/30 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-[2rem] border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Showing {submissions.length} Total Records</p>
                    <div className="flex gap-2">
                        <button className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black text-gray-400 uppercase tracking-widest cursor-not-allowed">Prev</button>
                        <button className="px-6 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-primary uppercase tracking-widest shadow-sm hover:border-primary transition-all">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

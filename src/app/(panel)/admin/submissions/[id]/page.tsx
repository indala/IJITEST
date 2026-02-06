import { getSubmissionById, updateSubmissionStatus, decideSubmission } from "@/actions/submissions";
import { getVolumesIssues, assignPaperToIssue } from "@/actions/publications";
import { waivePayment } from "@/actions/payments";
import pool from "@/lib/db";
import DeleteSubmissionButton from "@/components/DeleteSubmissionButton";
import {
    Calendar,
    User,
    Mail,
    FileText,
    Download,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    BookOpen
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Invalid ID</h2>
                <p className="text-gray-500 mb-8">The submission ID provided is not a valid number.</p>
                <Link href="/admin/submissions" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all inline-block">
                    Return to Submissions
                </Link>
            </div>
        );
    }

    const submission = await getSubmissionById(id);

    if (!submission) {
        return (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h2 className="text-2xl font-serif font-black text-gray-900 mb-2">Submission Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">The manuscript with ID #{id} could not be found in the database. It may have been deleted or the ID is incorrect.</p>
                <Link href="/admin/submissions" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all inline-block">
                    Back to Submissions List
                </Link>
            </div>
        );
    }

    // Helper for status colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'under_review': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'accepted': return 'bg-green-50 text-green-600 border-green-100';
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <Link href="/admin/submissions" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to Submissions
            </Link>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-10 border-b border-gray-50 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4">
                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(submission.status)}`}>
                                {submission.status.replace('_', ' ')}
                            </span>
                            <h1 className="text-3xl font-serif font-black text-gray-900 leading-tight">
                                {submission.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 font-medium">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    <span>Paper ID: {submission.paper_id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {submission.file_path && (
                                <a
                                    href={submission.file_path}
                                    download
                                    className="flex items-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all text-sm"
                                >
                                    <Download className="w-5 h-5" /> Download Manuscript
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-10 grid grid-cols-1 md:grid-cols-3 gap-10">
                    <div className="md:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-serif font-black text-gray-900 mb-4 border-l-4 border-secondary pl-4">Abstract</h3>
                            <p className="text-gray-600 leading-relaxed text-justify">
                                {submission.abstract || "No abstract provided."}
                            </p>
                        </div>

                        {submission.status !== 'submitted' && (
                            <div className="mt-12">
                                <h3 className="text-lg font-serif font-black text-gray-900 mb-6 border-l-4 border-orange-400 pl-4">Reviewer Feedback</h3>
                                <div className="space-y-6">
                                    {(async () => {
                                        const [reviews]: any = await pool.execute(
                                            'SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.submission_id = ? AND r.status = "completed"',
                                            [submission.id]
                                        );

                                        if (reviews.length === 0) return <p className="text-gray-400 italic">No feedback submitted yet.</p>;

                                        return reviews.map((r: any, i: number) => (
                                            <div key={r.id} className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 py-1 rounded">Reviewer {i + 1}</span>
                                                    <span className="text-[10px] font-bold text-gray-400">{r.reviewer_name}</span>
                                                </div>
                                                <p className="text-sm text-gray-600 italic whitespace-pre-wrap leading-relaxed">"{r.feedback}"</p>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-serif font-black text-gray-900 mb-4 border-l-4 border-secondary pl-4">Author Info</h3>
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 space-y-4">
                                <div className="flex items-start gap-3">
                                    <User className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Name</p>
                                        <p className="font-bold text-gray-900">{submission.author_name}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email</p>
                                        <p className="font-bold text-gray-900 break-all">{submission.author_email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-serif font-black text-gray-900 mb-4 border-l-4 border-secondary pl-4">Management</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {submission.status === 'submitted' && (
                                    <>
                                        <h4 className="text-[10px] font-black uppercase text-orange-600 tracking-widest mb-2 px-1">Stage 1: Reviewing</h4>
                                        <Link
                                            href={`/admin/reviews?assign=${submission.id}`}
                                            className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 py-4 rounded-2xl font-bold border border-orange-100 hover:bg-orange-100 transition-all text-sm mb-4"
                                        >
                                            Assign to Reviewer
                                        </Link>
                                    </>
                                )}

                                {submission.status === 'under_review' && (
                                    <>
                                        <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-2 px-1">Stage 2: Final Decision</h4>
                                        <div className="grid grid-cols-1 gap-3 mb-4">
                                            <form action={async () => {
                                                'use server';
                                                await decideSubmission(submission.id, 'accepted');
                                            }}>
                                                <button className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all text-sm">
                                                    <CheckCircle className="w-5 h-5" /> Final Accept
                                                </button>
                                            </form>
                                            <form action={async () => {
                                                'use server';
                                                await decideSubmission(submission.id, 'rejected');
                                            }}>
                                                <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100 hover:bg-red-100 transition-all text-sm">
                                                    <XCircle className="w-5 h-5" /> Reject Paper
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}

                                {submission.status === 'accepted' && (
                                    <>
                                        <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center mb-4">
                                            <p className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-1">Decision: Accepted</p>
                                            <p className="text-xs text-gray-500 font-medium mb-3">Waiting for author payment...</p>

                                            <form action={async () => {
                                                'use server';
                                                await waivePayment(submission.id);
                                            }}>
                                                <button className="w-full py-2 px-4 bg-gray-200 hover:bg-green-100 hover:text-green-700 text-gray-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2">
                                                    <CheckCircle className="w-3 h-3" /> Waive Fee / Free Publish
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}

                                {(submission.status === 'accepted' || submission.status === 'rejected') && submission.status !== 'accepted' && (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center mb-4">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Decision Finalized</p>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{submission.status}</p>
                                    </div>
                                )}

                                {(submission.status === 'paid' || submission.status === 'published') && (
                                    <>
                                        <h4 className="text-[10px] font-black uppercase text-green-600 tracking-widest mb-2 px-1">Stage 3: Publication</h4>
                                        <div className="bg-green-50 p-4 rounded-2xl border border-green-100 mb-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle className="w-4 h-4 text-green-600" />
                                                <span className="text-xs font-bold text-green-700">Payment Verified</span>
                                            </div>

                                            <form action={async (formData) => {
                                                'use server';
                                                const issueId = parseInt(formData.get('issueId') as string);
                                                await assignPaperToIssue(submission.id, issueId);
                                            }} className="space-y-3">
                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Assign Issue</label>
                                                    <select
                                                        name="issueId"
                                                        required
                                                        defaultValue={submission.issue_id || ""}
                                                        className="w-full bg-white border border-green-200 text-gray-900 text-xs rounded-xl focus:ring-green-500 focus:border-green-500 block p-3 font-bold outline-none appearance-none"
                                                    >
                                                        <option value="">Select Volume & Issue...</option>
                                                        {(await getVolumesIssues()).map((vi: any) => (
                                                            <option key={vi.id} value={vi.id}>
                                                                Vol {vi.volume_number}, Issue {vi.issue_number} ({vi.month_range} {vi.year})
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg shadow-green-600/20">
                                                    Update Assignment
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}

                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2 px-1">System Actions</h4>
                                    <DeleteSubmissionButton submissionId={submission.id} variant="full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

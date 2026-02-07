import { getSubmissionById, updateSubmissionStatus, decideSubmission } from "@/actions/submissions";
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
    Shield
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    if (isNaN(id)) return { title: 'Invalid Submission | Editor' };

    const submission = await getSubmissionById(id);
    if (!submission) return { title: 'Submission Not Found | Editor' };

    return {
        title: `Editor View: ${submission.paper_id} | IJITEST`,
        description: `Editorial review management for manuscript ${submission.paper_id}: ${submission.title}`,
    };
}

export default async function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="p-20 text-center bg-white rounded-[2.5rem] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Invalid ID</h2>
                <p className="text-gray-500 mb-8">The submission ID provided is not a valid number.</p>
                <Link href="/editor/submissions" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all inline-block">
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
                <Link href="/editor/submissions" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/95 transition-all inline-block">
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
            <Link href="/editor/submissions" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm">
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
                                            href={`/editor/reviews?assign=${submission.id}`}
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

                                {(submission.status === 'accepted' || submission.status === 'rejected') && (
                                    <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">Decision Finalized</p>
                                        <p className="text-sm font-bold text-gray-900 capitalize">{submission.status}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

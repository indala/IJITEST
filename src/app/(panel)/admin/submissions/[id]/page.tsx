import { getSubmissionById, updateSubmissionStatus } from "@/actions/submissions";
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

export default async function SubmissionDetails({ params }: { params: { id: string } }) {
    const id = parseInt(params.id);
    const submission = await getSubmissionById(id);

    if (!submission) {
        return (
            <div className="p-10 text-center">
                <h2 className="text-2xl font-bold text-gray-400">Submission not found.</h2>
                <Link href="/admin/submissions" className="text-primary hover:underline mt-4 inline-block">Back to list</Link>
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
                                        <p className="font-bold text-gray-900">{submission.author_email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-serif font-black text-gray-900 mb-4 border-l-4 border-secondary pl-4">Management</h3>
                            <div className="grid grid-cols-1 gap-3">
                                <form action={async () => {
                                    'use server';
                                    await updateSubmissionStatus(submission.id, 'under_review');
                                }}>
                                    <button className="w-full flex items-center justify-center gap-2 bg-orange-50 text-orange-600 py-4 rounded-2xl font-bold border border-orange-100 hover:bg-orange-100 transition-all text-sm">
                                        Move to Review
                                    </button>
                                </form>
                                <form action={async () => {
                                    'use server';
                                    await updateSubmissionStatus(submission.id, 'accepted');
                                }}>
                                    <button className="w-full flex items-center justify-center gap-2 bg-green-50 text-green-600 py-4 rounded-2xl font-bold border border-green-100 hover:bg-green-100 transition-all text-sm">
                                        Accept Paper
                                    </button>
                                </form>
                                <form action={async () => {
                                    'use server';
                                    await updateSubmissionStatus(submission.id, 'rejected');
                                }}>
                                    <button className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-4 rounded-2xl font-bold border border-red-100 hover:bg-red-100 transition-all text-sm">
                                        Reject Paper
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

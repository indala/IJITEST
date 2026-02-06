'use client'
import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText } from 'lucide-react';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, uploadReviewFeedback } from '@/actions/reviews';
import { decideSubmission } from '@/actions/submissions';
import { getUsers } from '@/actions/users';
import { getSession } from '@/actions/session';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ReviewsContent() {
    const searchParams = useSearchParams();
    const assignId = searchParams.get('assign');

    const [reviews, setReviews] = useState<any[]>([]);
    const [unassigned, setUnassigned] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState<any>(null);

    useEffect(() => {
        fetchData();
        if (assignId) {
            setShowAssignModal(true);
        }
    }, [assignId]);

    async function fetchData() {
        setLoading(true);
        const session = await getSession();
        setUser(session);

        const reviewerId = session?.role === 'reviewer' ? session.id : undefined;

        const [reviewsData, unassignedData, staffData] = await Promise.all([
            getActiveReviews(reviewerId),
            getUnassignedAcceptedPapers(),
            getUsers('reviewer')
        ]);

        setReviews(reviewsData);
        setUnassigned(unassignedData);
        setStaff(staffData);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Review Tracking...</div>;

    const isInternalStaff = user?.role === 'admin' || user?.role === 'editor';

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">
                        {user?.role === 'reviewer' ? 'My Assigned Reviews' : 'Peer Review Tracking'}
                    </h1>
                    <p className="text-gray-500 font-medium tracking-tight">
                        {user?.role === 'reviewer'
                            ? 'Complete your assigned manuscript evaluations below.'
                            : 'Managing editorial reviews and staff assignments.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <button
                        onClick={() => setShowAssignModal(true)}
                        className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-secondary/20 flex items-center gap-2 hover:bg-secondary/95 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Assign New Reviewer
                    </button>
                )}
            </div>

            {showAssignModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Assign Reviewer</h2>
                            <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form action={async (formData) => {
                            const result = await assignReviewer(formData);
                            if (result.success) {
                                setShowAssignModal(false);
                                fetchData();
                            } else {
                                alert(result.error);
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 pl-2">Select Manuscript</label>
                                <select
                                    name="submissionId"
                                    required
                                    defaultValue={assignId || ""}
                                    className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold appearance-none"
                                >
                                    <option value="">-- Choose a paper --</option>
                                    {unassigned.map(paper => (
                                        <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 pl-2">Available Reviewers</label>
                                <select name="reviewerId" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold appearance-none">
                                    <option value="">-- Choose a staff member --</option>
                                    {staff.map(r => (
                                        <option key={r.id} value={r.id}>{r.full_name} ({r.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 pl-2">Review Deadline</label>
                                <input name="deadline" type="date" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold" />
                            </div>
                            <button className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Send to Review
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {reviews.map((item) => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-8 hover:shadow-lg transition-all group">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter bg-gray-50 px-2 py-1 rounded">ID: {item.paper_id}</span>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{item.title}</h3>
                            <div className="flex flex-wrap gap-6 text-sm mb-6">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium">Reviewer: {item.reviewer_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                    <Clock className="w-4 h-4 text-gray-300" />
                                    <span className={item.status === 'completed' ? 'text-gray-300 line-through' : 'text-orange-600'}>
                                        Due: {new Date(item.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {item.feedback && (
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-sm text-gray-600 italic">
                                    "{item.feedback}"
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 min-w-[200px]">
                            {item.manuscript_path && (
                                <a
                                    href={item.manuscript_path}
                                    download
                                    className="flex items-center justify-center gap-2 bg-gray-50 text-gray-600 py-3 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all border border-transparent"
                                >
                                    <Download className="w-4 h-4 text-primary" /> Download Manuscript
                                </a>
                            )}

                            {item.status !== 'completed' && user?.role === 'reviewer' ? (
                                <button
                                    onClick={() => setSelectedReview(item)}
                                    className="bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <FileUp className="w-4 h-4" /> Submit Review
                                </button>
                            ) : item.feedback_file_path && (
                                <a
                                    href={item.feedback_file_path}
                                    download
                                    className="flex items-center justify-center gap-2 bg-green-50 text-green-600 py-3 rounded-xl font-bold text-xs border border-green-100 hover:bg-green-100 transition-all"
                                >
                                    <FileText className="w-4 h-4" /> View Feedback File
                                </a>
                            )}

                            {item.status === 'completed' && isInternalStaff && (
                                <div className="grid grid-cols-2 gap-2 mt-2 pt-4 border-t border-gray-50">
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to FINAL ACCEPT this paper? Authors will be notified.')) {
                                                const res = await decideSubmission(item.submission_id, 'accepted');
                                                if (res.success) fetchData();
                                                else alert(res.error);
                                            }
                                        }}
                                        className="bg-green-600 text-white py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-green-700 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-green-200"
                                    >
                                        <CheckCircle className="w-3.5 h-3.5" /> Accept
                                    </button>
                                    <button
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to REJECT this paper? Feedback will be sent, and manuscript file will be deleted.')) {
                                                const res = await decideSubmission(item.submission_id, 'rejected');
                                                if (res.success) fetchData();
                                                else alert(res.error);
                                            }
                                        }}
                                        className="bg-red-50 text-red-600 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider border border-red-100 hover:bg-red-100 transition-all flex items-center justify-center gap-1.5"
                                    >
                                        <X className="w-3.5 h-3.5" /> Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="bg-gray-50 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
                        <ShieldAlert className="w-16 h-16 text-gray-200 mb-6" />
                        <h3 className="text-xl font-serif font-black text-gray-400 mb-2">No Reviews Found</h3>
                        <p className="text-gray-400 max-w-sm">There are no peer reviews assigned to you at this time.</p>
                    </div>
                )}
            </div>

            {selectedReview && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-2xl w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Submit Evaluation</h2>
                            <button onClick={() => setSelectedReview(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form action={async (formData) => {
                            const result = await uploadReviewFeedback(selectedReview.id, formData);
                            if (result.success) {
                                setSelectedReview(null);
                                fetchData();
                            } else {
                                alert(result.error);
                            }
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 pl-2">Feedback Summary</label>
                                <textarea
                                    name="feedbackText"
                                    required
                                    rows={4}
                                    className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-medium text-sm leading-relaxed"
                                    placeholder="Provide your initial thoughts or a summary of your review here..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500 pl-2">Deep Review File (Optional)</label>
                                <div className="relative group">
                                    <input
                                        name="feedbackFile"
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 p-8 rounded-2xl flex flex-col items-center justify-center group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                                        <FileUp className="w-8 h-8 text-gray-300 group-hover:text-primary mb-2" />
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Click to upload evaluation file</p>
                                    </div>
                                </div>
                            </div>
                            <button className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Finalize & Submit Review
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Initialising Portal...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}


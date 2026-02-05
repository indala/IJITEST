"use client";

import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download } from 'lucide-react';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, uploadReviewFeedback } from '@/actions/reviews';
import { useState, useEffect } from 'react';

export default function Reviews() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [unassigned, setUnassigned] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssignModal, setShowAssignModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [reviewsData, unassignedData] = await Promise.all([
            getActiveReviews(),
            getUnassignedAcceptedPapers()
        ]);
        setReviews(reviewsData);
        setUnassigned(unassignedData);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Review Tracking...</div>;

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">Peer Review Tracking</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Managing offline reviews. Reviewers receive files via email.</p>
                </div>
                <button
                    onClick={() => setShowAssignModal(true)}
                    className="bg-secondary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-secondary/20 flex items-center gap-2 hover:bg-secondary/95 transition-all"
                >
                    <Plus className="w-5 h-5" /> Assign New Reviewer
                </button>
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
                            await assignReviewer(formData);
                            setShowAssignModal(false);
                            fetchData();
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Select Paper</label>
                                <select name="submissionId" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold appearance-none">
                                    <option value="">-- Choose an accepted/pending paper --</option>
                                    {unassigned.map(paper => (
                                        <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Reviewer Name</label>
                                <input name="reviewerName" type="text" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-secondary/20 font-bold" placeholder="Full name of the reviewer" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Review Deadline</label>
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
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:shadow-lg transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter bg-gray-50 px-2 py-1 rounded">ID: {item.paper_id}</span>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    {item.status.replace('_', ' ')}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-4">{item.title}</h3>
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium">{item.reviewer_name}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-500 font-bold">
                                    <Clock className="w-4 h-4 text-gray-300" />
                                    <span className={item.status === 'completed' ? 'text-gray-300 line-through' : 'text-orange-600'}>
                                        Deadline: {new Date(item.deadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {item.status !== 'completed' ? (
                                <form className="flex items-center gap-3" action={async (formData) => {
                                    await uploadReviewFeedback(item.id, formData);
                                    fetchData();
                                }}>
                                    <div className="relative overflow-hidden">
                                        <input
                                            name="feedbackFile"
                                            type="file"
                                            required
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    // Trigger parent form submission
                                                    e.target.form?.requestSubmit();
                                                }
                                            }}
                                        />
                                        <button type="button" className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2">
                                            <FileUp className="w-5 h-5" /> Upload Feedback
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex items-center gap-3">
                                    {item.feedback_file_path && (
                                        <a
                                            href={item.feedback_file_path}
                                            download
                                            className="bg-gray-50 text-gray-600 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 border border-transparent hover:bg-gray-100 transition-all"
                                        >
                                            <Download className="w-5 h-5 text-primary" /> View Feedback
                                        </a>
                                    )}
                                    <div className="p-4 bg-green-50 text-green-600 rounded-2xl">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                </div>
                            )}
                            <button className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-colors">
                                <Mail className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="bg-gray-50 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
                        <ShieldAlert className="w-16 h-16 text-gray-200 mb-6" />
                        <h3 className="text-xl font-serif font-black text-gray-400 mb-2">No Active Peer Reviews</h3>
                        <p className="text-gray-400 max-w-sm mb-8">Assign papers to reviewers to track their progress and collect feedback.</p>
                    </div>
                )}
            </div>
        </div>
    );
}


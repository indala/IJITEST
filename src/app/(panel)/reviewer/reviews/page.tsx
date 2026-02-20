'use client'
import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText, Eye, AlertTriangle } from 'lucide-react';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, uploadReviewFeedback } from '@/actions/reviews';
import { getUsers } from '@/actions/users';
import { getSession } from '@/actions/session';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

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

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Accessing Review Assignments...</div>;

    const isInternalStaff = user?.role === 'admin' || user?.role === 'editor';

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">
                        {user?.role === 'reviewer' ? 'My Assigned Reviews' : 'Peer Review Tracking'}
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground">
                        {user?.role === 'reviewer'
                            ? 'Complete your assigned manuscript evaluations below.'
                            : 'Managing editorial reviews and staff assignments.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Assign New Reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-foreground tracking-tight">Assign Reviewer</DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground">
                                    Send manuscript to external staff for technical evaluation.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                const result = await assignReviewer(formData);
                                if (result.success) {
                                    setShowAssignModal(false);
                                    fetchData();
                                } else {
                                    alert(result.error);
                                }
                            }} className="space-y-4 pt-4">
                                <div className="space-y-1.5">
                                    <label htmlFor="assign-submissionId" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Select Manuscript</label>
                                    <select
                                        id="assign-submissionId"
                                        name="submissionId"
                                        required
                                        title="Select a manuscript to assign"
                                        aria-label="Select manuscript"
                                        defaultValue={assignId || ""}
                                        className="flex h-11 w-full rounded-lg bg-muted/50 px-3 py-1 text-xs font-bold transition-colors outline-none border-none ring-offset-background focus:ring-1 focus:ring-primary/30 appearance-none"
                                    >
                                        <option value="">-- Choose a paper --</option>
                                        {unassigned.map(paper => (
                                            <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="assign-reviewerId" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Available Reviewers</label>
                                    <select
                                        id="assign-reviewerId"
                                        name="reviewerId"
                                        required
                                        title="Select an available reviewer"
                                        aria-label="Available Reviewers"
                                        className="flex h-11 w-full rounded-lg bg-muted/50 px-3 py-1 text-xs font-bold transition-colors outline-none border-none ring-offset-background focus:ring-1 focus:ring-primary/30 appearance-none"
                                    >
                                        <option value="">-- Choose a staff member --</option>
                                        {staff.map(r => (
                                            <option key={r.id} value={r.id}>{r.full_name} ({r.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label htmlFor="assign-deadline" className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Review Deadline</label>
                                    <Input id="assign-deadline" name="deadline" type="date" required className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs" />
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                        Send to Review
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reviews.map((item) => (
                    <Card key={item.id} className="border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden bg-white/50 backdrop-blur-sm">
                        <CardContent className="p-0">
                            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1 space-y-4 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge className={`h-5 px-1.5 text-[8px] font-black uppercase tracking-[0.15em] border-none shadow-sm ${item.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'}`}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                        <Badge variant="outline" className="h-5 px-1.5 text-[9px] font-mono font-black text-muted-foreground uppercase tracking-tighter bg-muted/30 border-border/50">
                                            DOC-{item.paper_id}
                                        </Badge>
                                    </div>

                                    <h3 className="text-base font-black text-foreground leading-tight tracking-tight capitalize group-hover:text-primary transition-colors">
                                        {item.title}
                                    </h3>

                                    <div className="flex flex-wrap gap-4 items-center">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 bg-muted/20 px-2 py-1 rounded-md">
                                            <User className="w-3.5 h-3.5 opacity-40 text-primary" />
                                            <span>Staff: {item.reviewer_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground bg-orange-500/5 px-2 py-1 rounded-md border border-orange-500/10">
                                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                                            <span className={item.status === 'completed' ? 'text-muted-foreground/30 line-through' : 'text-orange-600'}>
                                                DEADLINE: {new Date(item.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-[11px] text-muted-foreground font-bold leading-relaxed italic relative pl-8">
                                            <span className="absolute left-3 top-3 text-2xl text-primary/20 font-serif leading-none">“</span>
                                            {item.feedback}
                                        </div>
                                    )}
                                </div>

                                <div className="shrink-0 flex flex-col gap-2 min-w-[200px]">
                                    {item.manuscript_path && (
                                        <Button asChild variant="outline" size="sm" className="h-9 gap-2 font-black text-[10px] uppercase tracking-widest border-primary/20 text-primary hover:bg-primary hover:text-white transition-all">
                                            <Link href={`/reviewer/submissions/${item.submission_id}`}>
                                                <Eye className="w-3.5 h-3.5" /> Open Manuscript
                                            </Link>
                                        </Button>
                                    )}

                                    {item.status !== 'completed' && user?.role === 'reviewer' ? (
                                        <Dialog open={selectedReview?.id === item.id} onOpenChange={(open) => !open && setSelectedReview(null)}>
                                            <DialogTrigger asChild>
                                                <Button
                                                    onClick={() => setSelectedReview(item)}
                                                    size="sm"
                                                    className="h-9 gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                                                >
                                                    <FileUp className="w-3.5 h-3.5" /> Submit Evaluation
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-lg rounded-2xl p-6">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black text-foreground tracking-tight">Submit Evaluation</DialogTitle>
                                                    <DialogDescription className="text-xs font-medium text-muted-foreground">
                                                        Provide your expert technical opinion on the manuscript.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <form action={async (formData) => {
                                                    const result = await uploadReviewFeedback(item.id, formData);
                                                    if (result.success) {
                                                        setSelectedReview(null);
                                                        fetchData();
                                                    } else {
                                                        alert(result.error);
                                                    }
                                                }} className="space-y-4 pt-4">
                                                    <div className="space-y-1.5">
                                                        <label htmlFor={`feedback-text-${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Feedback Summary</label>
                                                        <Textarea
                                                            id={`feedback-text-${item.id}`}
                                                            name="feedbackText"
                                                            required
                                                            rows={4}
                                                            className="bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs resize-none"
                                                            placeholder="Provide a summary of your key findings..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label htmlFor={`feedback-file-${item.id}`} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Deep Review File (Optional)</label>
                                                        <div className="relative group">
                                                            <input
                                                                id={`feedback-file-${item.id}`}
                                                                name="feedbackFile"
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                                aria-label="Upload evaluation file"
                                                            />
                                                            <div className="w-full bg-muted/30 border-2 border-dashed border-border/50 p-6 rounded-xl group-hover:bg-muted/50 group-hover:border-primary transition-all flex flex-col items-center justify-center gap-2">
                                                                <FileUp className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover:text-primary transition-colors">Choose Evaluation File</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter className="pt-2">
                                                        <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                                            Finalize evaluation
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : item.feedback_file_path && (
                                        <Button asChild variant="secondary" size="sm" className="h-9 gap-2 font-black text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-none">
                                            <a href={item.feedback_file_path} download>
                                                <FileText className="w-3.5 h-3.5" /> View Feedback File
                                            </a>
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                        <ShieldAlert className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-tight mb-1">Queue Empty</h3>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">No assigned reviews found in your portal</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Connecting to Staff Portal...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}

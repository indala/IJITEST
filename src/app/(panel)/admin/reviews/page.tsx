'use client'

import { ShieldAlert, User, Mail, FileUp, CheckCircle, Clock, Search, Plus, X, Download, FileText, AlertCircle, Calendar, ArrowRight, Trash2, Eye, ExternalLink, ChevronDown } from 'lucide-react';
import { getActiveReviews, getUnassignedAcceptedPapers, assignReviewer, uploadReviewFeedback } from '@/actions/reviews';
import { decideSubmission } from '@/actions/submissions';
import { getUsers } from '@/actions/users';
import { getSession } from '@/actions/session';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";

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

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Synchronizing Review Pipeline...</div>;

    const isInternalStaff = user?.role === 'admin' || user?.role === 'editor';

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">
                        {user?.role === 'reviewer' ? 'Deployment Evaluations' : 'Peer Review Oversight'}
                    </h1>
                    <p className="text-xs font-medium text-muted-foreground">
                        {user?.role === 'reviewer'
                            ? 'Complete your assigned technical evaluations below.'
                            : 'Managing editorial integrity and reviewer assignments.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                                <Plus className="w-4 h-4" /> Delegate Evaluation
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-6">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black text-foreground tracking-tight">Assignment Console</DialogTitle>
                                <DialogDescription className="text-xs font-medium text-muted-foreground">
                                    Strategic delegation of manuscripts to the technical review staff.
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
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Target Manuscript</label>
                                    <div className="relative">
                                        <select
                                            name="submissionId"
                                            required
                                            defaultValue={assignId || ""}
                                            className="w-full h-11 bg-muted/50 border-none rounded-xl px-4 text-[11px] font-bold appearance-none outline-none focus:ring-1 focus:ring-primary/30"
                                        >
                                            <option value="">Choose Ref...</option>
                                            {unassigned.map(paper => (
                                                <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Technical Reviewer</label>
                                    <div className="relative">
                                        <select name="reviewerId" required className="w-full h-11 bg-muted/50 border-none rounded-xl px-4 text-[11px] font-bold appearance-none outline-none focus:ring-1 focus:ring-primary/30">
                                            <option value="">Identify Staff...</option>
                                            {staff.map(r => (
                                                <option key={r.id} value={r.id}>{r.full_name} ({r.role})</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Hard Deadline</label>
                                    <Input name="deadline" type="date" required className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs" />
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                        Commit Assignment
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4">
                {reviews.map((item) => (
                    <Card key={item.id} className="border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden bg-background">
                        <CardContent className="p-0">
                            <div className="p-6 flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase tracking-widest bg-muted/50 border-none text-primary italic">Node: {item.paper_id}</Badge>
                                        <Badge className={`h-5 px-1.5 text-[8px] font-black uppercase tracking-widest ${item.status === 'completed' ? 'bg-emerald-500/10 text-emerald-600 border-none' : 'bg-blue-500/10 text-blue-600 border-none'}`}>
                                            {item.status.replace('_', ' ')}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-black text-foreground tracking-tight leading-tight">{item.title}</h3>
                                    <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                        <div className="flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 opacity-50" />
                                            <span>Eval: {item.reviewer_name}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 ${item.status === 'completed' ? 'opacity-30' : 'text-orange-600'}`}>
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>Due: {new Date(item.deadline).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="p-4 bg-muted/30 rounded-xl border border-border/20 italic text-[11px] text-muted-foreground font-medium leading-relaxed selection:bg-primary/10">
                                            "{item.feedback}"
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-2 shrink-0 md:w-56">
                                    {item.manuscript_path && (
                                        <Button asChild variant="outline" size="sm" className="h-9 gap-2 font-black text-[9px] uppercase tracking-widest border-border/50">
                                            <a href={item.manuscript_path} download>
                                                <Download className="w-3.5 h-3.5 text-primary" /> Download Source
                                            </a>
                                        </Button>
                                    )}

                                    {item.status !== 'completed' && user?.role === 'reviewer' ? (
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="h-10 gap-2 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                                                    <FileUp className="w-3.5 h-3.5" /> Submit Intelligence
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent className="sm:max-w-xl rounded-2xl p-6">
                                                <DialogHeader>
                                                    <DialogTitle className="text-xl font-black text-foreground tracking-tight">Final Evaluation</DialogTitle>
                                                    <DialogDescription className="text-xs font-medium text-muted-foreground"> Commit technical feedback for manuscript {item.paper_id}.</DialogDescription>
                                                </DialogHeader>
                                                <form action={async (formData) => {
                                                    const result = await uploadReviewFeedback(item.id, formData);
                                                    if (result.success) {
                                                        fetchData();
                                                    } else {
                                                        alert(result.error);
                                                    }
                                                }} className="space-y-4 pt-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Summary of Findings</label>
                                                        <textarea
                                                            name="feedbackText"
                                                            required
                                                            rows={4}
                                                            className="w-full bg-muted/50 border-none rounded-xl p-4 text-[11px] font-medium outline-none focus:ring-1 focus:ring-primary/30"
                                                            placeholder="Initial vector of technical feedback..."
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Deep Analysis Node (File)</label>
                                                        <div className="relative group border-2 border-dashed border-border/50 rounded-xl p-6 transition-all hover:bg-muted/50 hover:border-primary/30">
                                                            <input
                                                                name="feedbackFile"
                                                                type="file"
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                            <div className="flex flex-col items-center justify-center pointer-events-none">
                                                                <FileUp className="w-6 h-6 text-muted-foreground/30 group-hover:text-primary mb-2" />
                                                                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Upload Evaluation Payload</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                                            Commit Findings
                                                        </Button>
                                                    </DialogFooter>
                                                </form>
                                            </DialogContent>
                                        </Dialog>
                                    ) : item.feedback_file_path && (
                                        <Button asChild variant="outline" size="sm" className="h-9 gap-2 font-black text-[9px] uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10">
                                            <a href={item.feedback_file_path} download>
                                                <FileText className="w-3.5 h-3.5" /> Intelligence File
                                            </a>
                                        </Button>
                                    )}

                                    {item.status === 'completed' && isInternalStaff && (
                                        <div className="grid grid-cols-1 gap-2 mt-2 pt-4 border-t border-border/50">
                                            <Button
                                                onClick={async () => {
                                                    if (confirm('Authorize acceptance for this manuscript?')) {
                                                        const res = await decideSubmission(item.submission_id, 'accepted');
                                                        if (res.success) fetchData();
                                                        else alert(res.error);
                                                    }
                                                }}
                                                className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-emerald-600/10"
                                            >
                                                <CheckCircle className="w-3.5 h-3.5 mr-2" /> Authorize Accept
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={async () => {
                                                    if (confirm('Commit final rejection?')) {
                                                        const res = await decideSubmission(item.submission_id, 'rejected');
                                                        if (res.success) fetchData();
                                                        else alert(res.error);
                                                    }
                                                }}
                                                className="h-9 font-black text-[10px] uppercase tracking-widest border-red-500/20 text-red-600 hover:bg-red-500/5"
                                            >
                                                <X className="w-3.5 h-3.5 mr-2" /> Commit Reject
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {reviews.length === 0 && !loading && (
                    <div className="py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                        <ShieldAlert className="w-10 h-10 text-muted-foreground/20 mb-4" />
                        <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Queue Empty</h3>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">No technical evaluations active in this sector</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function Reviews() {
    return (
        <Suspense fallback={<div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse">Initializing Portal...</div>}>
            <ReviewsContent />
        </Suspense>
    );
}

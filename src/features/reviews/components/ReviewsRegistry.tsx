'use client';

import React, { useState, useEffect, useMemo, useCallback, Suspense, startTransition } from 'react';
import {
    ShieldAlert, User, FileUp, CheckCircle, Clock, Search,
    Plus, X, Download, FileText, Eye, RefreshCw, Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

import { useActiveReviews, useUnassignedPapers, useAssignReviewer, useSubmitReview } from '@/hooks/queries/useReviews';
import type { ReviewAssignment } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { decideSubmission, autoSyncManuscriptToPdf, requestResubmissionWithComments } from '@/actions/submissions';
import { useQueryClient } from '@tanstack/react-query';

// --- Sub-components ---

const ReviewItemCard = React.memo(({
    item,
    user,
    isInternalStaff,
    onAccept,
    onReject,
    onFeedbackSubmit
}: {
    item: ReviewAssignment,
    user: { role?: string } | null | undefined, // session user
    isInternalStaff: boolean,
    onAccept: (item: ReviewAssignment) => void,
    onReject: (item: ReviewAssignment) => void,
    onFeedbackSubmit: (item: ReviewAssignment, formData: FormData) => Promise<void>
}) => {
    const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleFormSubmit = async (formData: FormData) => {
        setIsSubmitting(true);
        await onFeedbackSubmit(item, formData);
        setIsSubmitting(false);
    };

    const isReviewer = user?.role === 'reviewer';

    return (
        <Card className="border-border/50 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-card rounded-2xl">
            <CardContent className="p-0">
                <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
                    <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className={`h-7 px-4 text-[10px] font-bold border-none rounded-lg ${item.status === 'completed' ? 'bg-emerald-600 text-white' : 'bg-primary text-white'}`}>
                                {item.status.replace('_', ' ')}
                            </Badge>
                            <span className="font-mono font-bold text-[10px] bg-muted px-2 py-1 rounded border border-border/50 text-muted-foreground mr-1">
                                {item.paperId}
                            </span>
                        </div>

                        <h3 className="font-semibold text-foreground hover:text-primary transition-colors text-lg xl:text-xl 2xl:text-2xl leading-tight">
                            {item.title}
                        </h3>

                        <div className="flex flex-wrap gap-8 items-center pt-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                <User className="w-4 h-4 text-primary" />
                                <span>{item.reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Clock className="w-4 h-4" />
                                <span>Due: {new Date(item.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            </div>
                        </div>

                        {item.commentsToAuthor && (
                            <div className="mt-6 p-6 bg-muted/30 rounded-2xl border-l-4 border-l-primary text-base text-foreground leading-relaxed italic">
                                &quot;{item.commentsToAuthor}&quot;
                            </div>
                        )}
                    </div>

                    <div className="shrink-0 flex flex-col gap-4 xl:w-72 border-t xl:border-t-0 pt-8 xl:pt-0 border-border/50">
                        <div className="flex flex-col gap-2 w-full">
                            {item.manuscriptPath && (
                                <Button asChild className="w-full h-10 gap-3 font-bold text-xs rounded-xl bg-primary text-white hover:scale-[1.02] transition-all cursor-pointer">
                                    <a href={item.manuscriptPath} className="flex items-center justify-center w-full" download>
                                        <Download className="w-4 h-4" /> Download
                                    </a>
                                </Button>
                            )}
                            {item.feedbackFilePath && (
                                <Button asChild variant="outline" className="w-full h-12 gap-3 font-bold text-xs uppercase tracking-widest rounded-xl border-emerald-600 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all cursor-pointer">
                                    <a href={item.feedbackFilePath} className="flex items-center justify-center w-full" download>
                                        <FileText className="w-4 h-4" /> View Feedback
                                    </a>
                                </Button>
                            )}
                            {isReviewer && (
                                <Button asChild variant="outline" className="flex-1 h-12 gap-2 font-semibold text-[9px] uppercase tracking-widest rounded-xl border-primary/10 text-primary transition-all shadow-sm cursor-pointer">
                                    <Link href={`/reviewer/submissions/${item.submissionId}`}>
                                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                                    </Link>
                                </Button>
                            )}
                        </div>

                        {item.status !== 'completed' && isReviewer && (
                            <Dialog onOpenChange={(open) => !open && setFeedbackFile(null)}>
                                <DialogTrigger asChild>
                                    <Button className="w-full h-12 gap-3 font-semibold text-[10px] shadow-lg rounded-xl bg-primary text-white dark:text-slate-900 transition-all cursor-pointer">
                                        <FileUp className="w-4 h-4" /> Submit Review
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-3xl rounded-xl p-6 bg-card border-border shadow-2xl">
                                    <DialogHeader className="space-y-1">
                                        <DialogTitle className="text-lg font-bold text-primary tracking-tight">Review Details</DialogTitle>
                                        <DialogDescription className="text-xs text-muted-foreground">
                                            scientific assessment for paper: <span className="text-foreground">{item.paperId}</span>
                                        </DialogDescription>
                                    </DialogHeader>

                                    <form action={handleFormSubmit} className="space-y-5 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Primary decisions */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">recommendation</label>
                                                    <Select name="decision" required>
                                                        <SelectTrigger className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm">
                                                            <SelectValue placeholder="identify decision..." />
                                                        </SelectTrigger>
                                                        <SelectContent className="rounded-xl border-border bg-card">
                                                            <SelectItem value="accept">accept manuscript</SelectItem>
                                                            <SelectItem value="minorRevision">minor revision</SelectItem>
                                                            <SelectItem value="majorRevision">major revision</SelectItem>
                                                            <SelectItem value="reject">reject</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-medium text-muted-foreground">score (1-10)</label>
                                                        <Input
                                                            name="score"
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            required
                                                            placeholder="8"
                                                            className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-medium text-muted-foreground">confidence (1-5)</label>
                                                        <Input
                                                            name="confidence"
                                                            type="number"
                                                            min="1"
                                                            max="5"
                                                            required
                                                            placeholder="4"
                                                            className="h-11 bg-muted/30 border-border/50 rounded-lg px-4 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">confidential notes (for editor)</label>
                                                    <Textarea
                                                        name="commentsToEditor"
                                                        rows={3}
                                                        className="w-full bg-primary/5 border-none rounded-lg p-3 text-sm text-foreground resize-none"
                                                        placeholder="confidential notes for oversight..."
                                                    />
                                                </div>
                                            </div>

                                            {/* Files and Authors */}
                                            <div className="space-y-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">comments to authors</label>
                                                    <Textarea
                                                        name="commentsToAuthor"
                                                        required
                                                        rows={5}
                                                        className="w-full bg-muted/30 border-border/50 rounded-lg p-3 text-sm text-foreground resize-none"
                                                        placeholder="technical feedback for authors..."
                                                    />
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-medium text-muted-foreground">technical report (pdf)</label>
                                                    <div className={`relative group border-2 border-dashed ${feedbackFile ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-border bg-muted/20'} rounded-lg p-4 transition-all hover:bg-muted/30 hover:border-primary/50`}>
                                                        <input
                                                            title="feedbackFile"
                                                            name="feedbackFile"
                                                            type="file"
                                                            accept=".pdf"
                                                            onChange={(e) => setFeedbackFile(e.target.files?.[0] || null)}
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                        />
                                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                                            {feedbackFile ? (
                                                                <>
                                                                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                                    <p className="text-[11px] font-medium text-emerald-600 truncate max-w-[140px]">{feedbackFile.name}</p>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <FileUp className="w-4 h-4 text-primary/40 group-hover:scale-110 transition-all" />
                                                                    <p className="text-[11px] font-medium text-primary/60">select assessment pdf</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DialogFooter className="pt-2 border-t border-border/50">
                                            <Button type="submit" disabled={isSubmitting} className="w-full h-12 bg-primary text-white dark:text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer">
                                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        )}

                        {item.status === 'completed' && isInternalStaff && !['accepted', 'rejected', 'published', 'paid'].includes(item.submissionStatus) && (
                            <div className="grid grid-cols-2 gap-3 mt-4 pt-6 border-t border-primary/5">
                                <Button
                                    onClick={() => onAccept(item)}
                                    className="h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" /> ACCEPT
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => onReject(item)}
                                    className="h-12 font-semibold text-[10px] uppercase tracking-widest border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all"
                                >
                                    <X className="w-4 h-4 mr-2" /> REJECT
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
});

ReviewItemCard.displayName = "ReviewItemCard";

// --- Main Registry Component ---

interface GroupedReview {
    submissionId: number;
    paperId: string;
    title: string;
    submissionStatus: string;
    assignments: ReviewAssignment[];
}

const GroupedReviewCard = React.memo(({
    group,
    onAccept,
    onReject,
    onRevision,
}: {
    group: GroupedReview;
    onAccept: (submissionId: number) => void;
    onReject: (submissionId: number) => void;
    onRevision: (submissionId: number, concatenatedComments: string) => Promise<void>;
}) => {
    const completedAssignments = useMemo(() => {
        return group.assignments.filter(a => a.status === 'completed' && a.commentsToAuthor);
    }, [group.assignments]);

    const [selectedComments, setSelectedComments] = useState<Record<number, boolean>>({});
    const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
    const [revisionText, setRevisionText] = useState('');
    const [isSubmittingRevision, setIsSubmittingRevision] = useState(false);

    const handleToggleComment = (assignmentId: number) => {
        setSelectedComments(prev => ({
            ...prev,
            [assignmentId]: !prev[assignmentId]
        }));
    };

    const getConcatenatedComments = useCallback(() => {
        return completedAssignments
            .filter(a => selectedComments[a.id])
            .map(a => `[Reviewer ${a.reviewerName}]:\n${a.commentsToAuthor}`)
            .join('\n\n');
    }, [completedAssignments, selectedComments]);

    const handleOpenRevisionDialog = () => {
        const text = getConcatenatedComments();
        setRevisionText(text);
        setRevisionDialogOpen(true);
    };

    const handleConfirmRevision = async () => {
        setIsSubmittingRevision(true);
        try {
            await onRevision(group.submissionId, revisionText);
            setRevisionDialogOpen(false);
        } finally {
            setIsSubmittingRevision(false);
        }
    };

    const totalReviews = group.assignments.length;
    const completedReviews = group.assignments.filter(a => a.status === 'completed').length;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'accepted': return 'bg-emerald-600 text-white';
            case 'paymentPending': return 'bg-amber-600 text-white';
            case 'published': return 'bg-emerald-600 text-white';
            case 'rejected': return 'bg-rose-600 text-white';
            case 'underReview': return 'bg-amber-600 text-white';
            case 'revisionRequested': return 'bg-blue-600 text-white';
            default: return 'bg-primary text-white';
        }
    };

    return (
        <Card className="border-border/50 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-card rounded-2xl">
            <CardContent className="p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-4 border-b border-border/50">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                            <Badge className={`h-6 px-3 text-[10px] font-bold rounded-lg border-none ${getStatusColor(group.submissionStatus)}`}>
                                {group.submissionStatus.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </Badge>
                            <span className="font-mono font-bold text-[10px] bg-muted px-2 py-1 rounded border border-border/50 text-muted-foreground mr-1">
                                {group.paperId}
                            </span>
                        </div>
                        <h3 className="font-semibold text-foreground text-lg xl:text-xl leading-tight group-hover:text-primary transition-colors">
                            {group.title}
                        </h3>
                    </div>
                    <div className="flex flex-col items-end shrink-0">
                        <div className="text-xs font-bold text-muted-foreground">Review Progress</div>
                        <div className="text-lg font-black text-primary">
                            {completedReviews} of {totalReviews} complete
                        </div>
                        {/* Progress Bar */}
                        <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden mt-1 border border-border/20">
                            <div 
                                className="h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500" 
                                style={{ width: `${totalReviews > 0 ? (completedReviews / totalReviews) * 100 : 0}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Reviewers List */}
                <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase opacity-60">
                        Assigned Reviewers & Evaluations
                    </h4>
                    <div className="grid gap-3">
                        {group.assignments.map((assignment) => {
                            const isCompleted = assignment.status === 'completed';
                            return (
                                <div 
                                    key={assignment.id} 
                                    className={`p-4 rounded-xl border transition-all ${
                                        isCompleted 
                                            ? 'bg-muted/10 border-border/40 hover:bg-muted/20' 
                                            : 'bg-amber-500/5 border-amber-500/10'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-foreground">{assignment.reviewerName}</span>
                                                <Badge className={`h-5 text-[8px] font-extrabold uppercase border-none rounded ${
                                                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                                                }`}>
                                                    {assignment.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                                <span>Assigned: {assignment.assignedAt ? new Date(assignment.assignedAt).toLocaleDateString('en-US') : 'N/A'}</span>
                                                <span>Deadline: {new Date(assignment.deadline).toLocaleDateString('en-US')}</span>
                                            </div>
                                        </div>

                                        {isCompleted && (
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`h-6 text-[10px] font-bold uppercase rounded border-none ${
                                                    assignment.decision === 'accept' 
                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                        : assignment.decision === 'reject' 
                                                        ? 'bg-rose-500/10 text-rose-500' 
                                                        : 'bg-amber-500/10 text-amber-500'
                                                }`}>
                                                    {assignment.decision?.replace(/([A-Z])/g, ' $1').toLowerCase() || 'Completed'}
                                                </Badge>
                                                {assignment.feedbackFilePath && (
                                                    <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5 font-bold text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/5 rounded-lg">
                                                        <a href={assignment.feedbackFilePath} download>
                                                            <Download className="w-3.5 h-3.5" /> File
                                                        </a>
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Comments selection with Checkbox */}
                                    {isCompleted && assignment.commentsToAuthor && (
                                        <div className="mt-4 flex gap-3 items-start p-3 bg-card border border-border/30 rounded-lg group/comment">
                                            <input
                                                title="Select comments"
                                                type="checkbox"
                                                id={`check-${assignment.id}`}
                                                checked={!!selectedComments[assignment.id]}
                                                onChange={() => handleToggleComment(assignment.id)}
                                                className="mt-1 w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer accent-primary shrink-0"
                                            />
                                            <label 
                                                htmlFor={`check-${assignment.id}`} 
                                                className="text-sm text-foreground/80 leading-relaxed italic cursor-pointer select-none flex-1 group-hover/comment:text-foreground transition-colors"
                                            >
                                                &quot;{assignment.commentsToAuthor}&quot;
                                            </label>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Group Actions */}
                {!['accepted', 'rejected', 'published', 'paid'].includes(group.submissionStatus) && (
                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-border/50">
                        <Button
                            onClick={() => onAccept(group.submissionId)}
                            className="w-full sm:w-auto h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" /> Accept Manuscript
                        </Button>
                        <Button
                            onClick={handleOpenRevisionDialog}
                            disabled={completedReviews === 0}
                            className="w-full sm:w-auto h-11 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-600/10 cursor-pointer"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" /> Request Revision
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => onReject(group.submissionId)}
                            className="w-full sm:w-auto h-11 px-5 font-bold text-xs uppercase tracking-wider border-rose-500/20 text-rose-600 bg-rose-500/5 hover:bg-rose-500/10 rounded-xl transition-all cursor-pointer"
                        >
                            <X className="w-4 h-4 mr-2" /> Reject
                        </Button>
                    </div>
                )}

                {/* Revision Request Dialog */}
                <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
                    <DialogContent className="sm:max-w-2xl rounded-xl p-6 bg-card border-border shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-primary tracking-tight">Request Revision</DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                                Technical feedback for paper: <span className="text-foreground">{group.paperId}</span>
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                    Concatenated Comments to Author
                                </label>
                                <Textarea
                                    rows={8}
                                    value={revisionText}
                                    onChange={(e) => setRevisionText(e.target.value)}
                                    className="w-full bg-muted/30 border-border/50 rounded-lg p-3 text-sm text-foreground resize-none focus:ring-2 focus:ring-primary"
                                    placeholder="Enter comments to author..."
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/50 flex gap-2">
                            <Button 
                                variant="outline" 
                                onClick={() => setRevisionDialogOpen(false)}
                                className="h-11 font-bold text-xs rounded-lg cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleConfirmRevision} 
                                disabled={isSubmittingRevision || !revisionText.trim()} 
                                className="h-11 bg-primary text-white font-bold text-xs rounded-lg px-6 cursor-pointer"
                            >
                                {isSubmittingRevision ? 'Sending...' : 'Send Revision Request'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
});
GroupedReviewCard.displayName = "GroupedReviewCard";

export function ReviewsRegistry({ role }: { role: 'admin' | 'editor' | 'reviewer' }) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const reviewerId = role === 'reviewer' ? (session?.user as { id?: string })?.id : undefined;
    const assignIdFromUrl = searchParams.get('assign');

    const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useActiveReviews(reviewerId);
    const { data: unassigned = [], isLoading: loadingUnassigned } = useUnassignedPapers();
    const { data: staff = [], isLoading: loadingStaff } = useUsers('reviewer');
    const assignMutation = useAssignReviewer();
    const uploadMutation = useSubmitReview();
    const router = useRouter();
    const queryClient = useQueryClient();

    const loading = loadingReviews || loadingUnassigned || loadingStaff;

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [assignFile, setAssignFile] = useState<File | null>(null);
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(assignIdFromUrl || "");
    const [isConverting, setIsConverting] = useState(false);

    const handleAutoConvert = async () => {
        if (!selectedSubmissionId) return;
        setIsConverting(true);
        const tid = toast.loading("Converting archive...");
        try {
            const res = await autoSyncManuscriptToPdf(parseInt(selectedSubmissionId));
            if (res.success) {
                toast.success("Manuscript synchronized", { id: tid });
                queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
                router.refresh();
            } else {
                toast.error(res.error || "Conversion failed", { id: tid });
            }
        } catch {
            toast.error("Failed to connect to conversion engine", { id: tid });
        } finally {
            setIsConverting(false);
        }
    };

    useEffect(() => {
        const assignId = searchParams.get('assign');
        if (assignId) {
            startTransition(() => {
                setShowAssignModal(true);
                setSelectedSubmissionId(assignId);
            });
        }
    }, [searchParams]);

    const handleAccept = useCallback((item: ReviewAssignment) => {
        toast('Authorize acceptance for this manuscript?', {
            action: {
                label: 'Confirm Accept',
                onClick: async () => {
                    const res = await decideSubmission(item.submissionId, 'accepted');
                    if (res.success) {
                        toast.success('Accepted');
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews]);

    const handleReject = useCallback((item: ReviewAssignment) => {
        toast('Commit final rejection?', {
            action: {
                label: 'Confirm Reject',
                onClick: async () => {
                    const res = await decideSubmission(item.submissionId, 'rejected');
                    if (res.success) {
                        toast.success('Rejected');
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews]);

    const handleFeedbackSubmit = useCallback(async (item: ReviewAssignment, formData: FormData) => {
        const toastId = toast.loading('Submitting...');
        try {
            const result = await uploadMutation.mutateAsync({ assignmentId: item.id, formData });
            if (result.success) {
                toast.success('Feedback committed', { id: toastId });
                refetchReviews();
            } else {
                toast.error(result.error, { id: toastId });
            }
        } catch {
            toast.error('Failed to submit findings', { id: toastId });
        }
    }, [uploadMutation, refetchReviews]);

    const handleAcceptGroup = useCallback((submissionId: number) => {
        toast('Authorize acceptance for this manuscript?', {
            action: {
                label: 'Confirm Accept',
                onClick: async () => {
                    const res = await decideSubmission(submissionId, 'accepted');
                    if (res.success) {
                        toast.success('Accepted');
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews]);

    const handleRejectGroup = useCallback((submissionId: number) => {
        toast('Commit final rejection?', {
            action: {
                label: 'Confirm Reject',
                onClick: async () => {
                    const res = await decideSubmission(submissionId, 'rejected');
                    if (res.success) {
                        toast.success('Rejected');
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews]);

    const handleRevisionGroup = useCallback(async (submissionId: number, comments: string) => {
        const toastId = toast.loading('Submitting revision request...');
        try {
            const res = await requestResubmissionWithComments(submissionId, comments);
            if (res.success) {
                toast.success('Revision request committed', { id: toastId });
                refetchReviews();
            } else {
                toast.error(res.error, { id: toastId });
            }
        } catch {
            toast.error('Failed to submit revision request', { id: toastId });
        }
    }, [refetchReviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch =
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.reviewerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.paperId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchQuery, statusFilter]);

    const isInternalStaff = role === 'admin' || role === 'editor';

    const groupedReviews = useMemo(() => {
        if (!isInternalStaff) return [];
        const groupsMap = new Map<number, GroupedReview>();
        for (const r of filteredReviews) {
            if (!groupsMap.has(r.submissionId)) {
                groupsMap.set(r.submissionId, {
                    submissionId: r.submissionId,
                    paperId: r.paperId,
                    title: r.title,
                    submissionStatus: r.submissionStatus,
                    assignments: []
                });
            }
            groupsMap.get(r.submissionId)!.assignments.push(r);
        }
        return Array.from(groupsMap.values());
    }, [filteredReviews, isInternalStaff]);

    const selectedPaper = unassigned.find(p => p.id.toString() === selectedSubmissionId);
    const hasExistingPdf = !!selectedPaper?.pdfUrl;

    if (loading) {
        return (
            <div className="p-32 text-center space-y-6">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-muted-foreground text-xs animate-pulse">Loading reviews...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <h1 className="text-2xl 2xl:text-3xl font-bold text-primary tracking-tight">
                        {role === 'reviewer' ? 'Reviews' : 'Manage Reviews'}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed">
                        {role === 'reviewer'
                            ? 'Technical evaluation portal for manuscript review workflows.'
                            : 'Global administration of editorial integrity and peer-review lifecycle.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-6 gap-3 bg-primary text-white font-semibold text-[10px] rounded-xl shadow-lg transition-all cursor-pointer dark:text-black">
                                <Plus className="w-4 h-4" />Assign Reviewer
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl rounded-xl p-5 bg-card border-none shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-semibold text-foreground">Assign Reviewer</DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Assign manuscripts to technical staff.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={async (formData) => {
                                const res = await assignMutation.mutateAsync(formData);
                                if (res.success) {
                                    toast.success('Reviewer assigned');
                                    setShowAssignModal(false);
                                    setAssignFile(null);
                                } else toast.error(res.error);
                            }} className="space-y-5 pt-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Manuscript</label>
                                    <Select name="submissionId" required defaultValue={selectedSubmissionId} onValueChange={setSelectedSubmissionId}>
                                        <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                            <SelectValue placeholder="Identify paper..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {unassigned.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()}>{paper.paperId} | {paper.title.slice(0, 40)}...</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Reviewer</label>
                                    <Select name="reviewerId" required>
                                        <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                            <SelectValue placeholder="Identify staff..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-primary/5 bg-card">
                                            {staff.map(r => (
                                                <SelectItem key={r.id} value={r.id.toString()}>{r.profile?.fullName || r.email}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Deadline</label>
                                    <Input
                                        name="deadline"
                                        type="date"
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-bold text-primary tracking-widest uppercase">Manuscript PDF {hasExistingPdf ? '(Verified)' : '(Required)'}</label>
                                        {hasExistingPdf && (
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 animate-pulse">
                                                <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                                <span className="text-[8px] font-black uppercase">System Asset Ready</span>
                                            </div>
                                        )}
                                    </div>

                                    {!hasExistingPdf && selectedSubmissionId && (
                                        <Button
                                            type="button"
                                            onClick={handleAutoConvert}
                                            disabled={isConverting}
                                            variant="outline"
                                            className="w-full h-14 gap-3 border-primary/20 bg-primary/5 text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white dark:hover:text-black transition-all shadow-xl shadow-primary/5 cursor-pointer group"
                                        >
                                            {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />}
                                            <span>Upload using PDF Converter</span>
                                        </Button>
                                    )}

                                    <div className={`relative group border-2 border-dashed ${assignFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-primary/20 bg-primary/5'} rounded-xl p-6 transition-all hover:bg-primary/5 hover:border-primary/40`}>
                                        <input
                                            title="pdfFile"
                                            name="pdfFile"
                                            type="file"
                                            accept=".pdf"
                                            required={!hasExistingPdf}
                                            onChange={(e) => setAssignFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex items-center justify-center pointer-events-none space-x-3">
                                            {assignFile ? (
                                                <>
                                                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                                                    <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-widest truncate max-w-[200px]">{assignFile.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <FileUp className="w-5 h-5 text-primary/40 group-hover:scale-110 transition-all" />
                                                    <p className="text-[10px] font-semibold text-primary/60 uppercase tracking-widest">
                                                        {hasExistingPdf ? 'Overwrite existing PDF' : 'Select manuscript PDF'}
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={assignMutation.isPending || isConverting} className="w-full h-16 bg-primary text-white font-semibold text-[10px] tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all cursor-pointer dark:text-black">
                                        {assignMutation.isPending ? 'SYNCHRONIZING...' : 'COMMIT ASSIGNMENT'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </header>

            {/* Filters */}
            <div className="flex flex-col md:flex-row items-center gap-6 bg-muted/20 p-8 rounded-2xl border border-border/50">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search by manuscript ID or title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-14 pl-14 pr-6 bg-card border-border/50 rounded-xl text-base font-medium focus:ring-4 focus:ring-primary/10 transition-all w-full"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-14 px-8 bg-card border-border/50 rounded-xl text-xs font-bold uppercase tracking-widest text-primary min-w-[240px]">
                        <SelectValue placeholder="System Filter" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border bg-card">
                        <SelectItem value="all" className="font-bold text-xs uppercase tracking-widest">All Records</SelectItem>
                        <SelectItem value="assigned" className="font-bold text-xs uppercase tracking-widest">Pending Evaluation</SelectItem>
                        <SelectItem value="completed" className="font-bold text-xs uppercase tracking-widest">Audit Completed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase opacity-40">Registry queue</h2>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary/40 bg-primary/5 border-none">
                        {isInternalStaff ? groupedReviews.length : filteredReviews.length}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isInternalStaff ? (
                        groupedReviews.map((group) => (
                            <GroupedReviewCard
                                key={group.submissionId}
                                group={group}
                                onAccept={handleAcceptGroup}
                                onReject={handleRejectGroup}
                                onRevision={handleRevisionGroup}
                            />
                        ))
                    ) : (
                        filteredReviews.map((item) => (
                            <ReviewItemCard
                                key={item.id}
                                item={item}
                                user={session?.user}
                                isInternalStaff={isInternalStaff}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onFeedbackSubmit={handleFeedbackSubmit}
                            />
                        ))
                    )}

                    {((isInternalStaff && groupedReviews.length === 0) || (!isInternalStaff && filteredReviews.length === 0)) && (
                        <div className="py-32 text-center bg-primary/2 border-2 border-dashed border-primary/5 rounded-xl space-y-4">
                            <ShieldAlert className="w-12 h-12 text-primary/10 mx-auto" />
                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">No matching evaluations found</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function ReviewsRegistrySuspense(props: { role: 'admin' | 'editor' | 'reviewer' }) {
    return (
        <Suspense fallback={<div className="p-20 text-center text-[10px] font-bold text-primary/20 tracking-widest animate-pulse">SYNCHRONIZING INTERFACE...</div>}>
            <ReviewsRegistry {...props} />
        </Suspense>
    );
}

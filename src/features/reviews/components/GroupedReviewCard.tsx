'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { CheckCircle, X, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import type { Submission, Version, SubmissionStatus } from '@/db/types';
import type { ReviewAssignment } from '@/hooks/queries/useReviews';

export interface GroupedReview {
    submissionId: Submission['id'];
    paperId: Submission['paperId'];
    title: Version['title'];
    submissionStatus: SubmissionStatus;
    assignments: ReviewAssignment[];
}

interface GroupedReviewCardProps {
    group: GroupedReview;
    onAccept: (submissionId: Submission['id']) => void;
    onReject: (submissionId: Submission['id']) => void;
    onRevision: (submissionId: Submission['id'], concatenatedComments: string) => Promise<void>;
}

export const GroupedReviewCard = React.memo(({
    group,
    onAccept,
    onReject,
    onRevision,
}: GroupedReviewCardProps) => {
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
                                className={`h-full bg-linear-to-r from-primary to-primary/80 transition-all duration-500 ${
                                    totalReviews <= 0 || completedReviews <= 0 ? 'w-0' :
                                    completedReviews >= totalReviews ? 'w-full' :
                                    (completedReviews / totalReviews) <= 0.2 ? 'w-1/5' :
                                    (completedReviews / totalReviews) <= 0.25 ? 'w-1/4' :
                                    (completedReviews / totalReviews) <= 0.35 ? 'w-1/3' :
                                    (completedReviews / totalReviews) <= 0.45 ? 'w-2/5' :
                                    (completedReviews / totalReviews) <= 0.55 ? 'w-1/2' :
                                    (completedReviews / totalReviews) <= 0.62 ? 'w-3/5' :
                                    (completedReviews / totalReviews) <= 0.7 ? 'w-2/3' :
                                    (completedReviews / totalReviews) <= 0.78 ? 'w-3/4' : 'w-4/5'
                                }`} 
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
                                                <span>Deadline: {assignment.deadline ? new Date(assignment.deadline).toLocaleDateString('en-US') : 'N/A'}</span>
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

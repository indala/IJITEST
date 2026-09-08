'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    User as UserIcon, FileUp, CheckCircle, Clock,
    Download, FileText, Eye, X, Star
} from 'lucide-react';
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
import type { ReviewAssignment } from '@/hooks/queries/useReviews';
import type { User } from '@/db/types';
import { rateReview } from '@/actions/reviews';
import { toast } from 'sonner';

interface ReviewItemCardProps {
    item: ReviewAssignment;
    user: { role?: User['role'] } | null | undefined;
    isInternalStaff: boolean;
    onAccept: (item: ReviewAssignment) => void;
    onReject: (item: ReviewAssignment) => void;
    onFeedbackSubmit: (item: ReviewAssignment, formData: FormData) => Promise<void>;
}

export const ReviewItemCard = React.memo(({
    item,
    user,
    isInternalStaff,
    onAccept,
    onReject,
    onFeedbackSubmit
}: ReviewItemCardProps) => {
    const [feedbackFile, setFeedbackFile] = useState<File | null>(null);
    const [isPending, startFeedbackTransition] = useTransition();
    const [currentRating, setCurrentRating] = useState<number | null | undefined>(item.editorRating);
    const [isRatingPending, startRatingTransition] = useTransition();

    const handleRate = (stars: number) => {
        setCurrentRating(stars);
        startRatingTransition(async () => {
            const res = await rateReview(item.id, stars);
            if (res.success) {
                toast.success(`Reviewer rated ${stars} stars!`);
            } else {
                toast.error(res.error || "Failed to save rating");
            }
        });
    };

    const handleFormSubmit = (formData: FormData) => {
        startFeedbackTransition(async () => {
            await onFeedbackSubmit(item, formData);
        });
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
                                <UserIcon className="w-4 h-4 text-primary" />
                                <span>{item.reviewerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Clock className="w-4 h-4" />
                                <span>Due: {item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</span>
                            </div>
                        </div>

                        {item.commentsToAuthor && (
                            <div className="mt-6 p-6 bg-muted/30 rounded-2xl border-l-4 border-l-primary text-base text-foreground leading-relaxed italic">
                                &quot;{item.commentsToAuthor}&quot;
                            </div>
                        )}

                        {item.status === 'completed' && (
                            <div className="flex flex-wrap items-center gap-3 pt-3 mt-2 border-t border-border/40">
                                <span className="text-xs font-semibold text-muted-foreground">Editor Rating:</span>
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            disabled={!isInternalStaff || isRatingPending}
                                            onClick={() => handleRate(star)}
                                            className={`transition-transform p-0.5 ${isInternalStaff ? 'cursor-pointer hover:scale-125' : 'cursor-default'}`}
                                            title={`Rate reviewer ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <Star
                                                className={`w-4 h-4 transition-colors ${
                                                    (currentRating ?? 0) >= star
                                                        ? 'fill-amber-400 text-amber-400'
                                                        : 'text-muted-foreground/30 hover:text-amber-400'
                                                }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                {currentRating ? (
                                    <span className="text-[11px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                        {currentRating} / 5 Stars
                                    </span>
                                ) : isInternalStaff ? (
                                    <span className="text-[10px] text-muted-foreground italic">
                                        (Click star to rate reviewer performance)
                                    </span>
                                ) : null}
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
                                    <Button className="w-full h-12 gap-3 font-semibold text-[10px] shadow-lg rounded-xl bg-primary text-white transition-all cursor-pointer">
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

                                                <div className="space-y-3 p-3 bg-muted/20 rounded-xl border border-border/60">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Evaluation Rubric (1-5)</p>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-medium text-muted-foreground">Originality & Novelty</label>
                                                            <Select name="rubricOriginality" defaultValue="4">
                                                                <SelectTrigger className="h-9 bg-background border-border/50 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[5, 4, 3, 2, 1].map(n => (
                                                                        <SelectItem key={n} value={String(n)}>{n} - {n === 5 ? 'Exceptional' : n === 4 ? 'Good' : n === 3 ? 'Average' : n === 2 ? 'Weak' : 'Unacceptable'}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-medium text-muted-foreground">Technical Methodology</label>
                                                            <Select name="rubricMethodology" defaultValue="4">
                                                                <SelectTrigger className="h-9 bg-background border-border/50 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[5, 4, 3, 2, 1].map(n => (
                                                                        <SelectItem key={n} value={String(n)}>{n} - {n === 5 ? 'Rigorous' : n === 4 ? 'Sound' : n === 3 ? 'Adequate' : n === 2 ? 'Flawed' : 'Invalid'}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-medium text-muted-foreground">Clarity & Organization</label>
                                                            <Select name="rubricClarity" defaultValue="4">
                                                                <SelectTrigger className="h-9 bg-background border-border/50 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[5, 4, 3, 2, 1].map(n => (
                                                                        <SelectItem key={n} value={String(n)}>{n} - {n === 5 ? 'Excellent' : n === 4 ? 'Clear' : n === 3 ? 'Understandable' : n === 2 ? 'Poor' : 'Unreadable'}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-medium text-muted-foreground">Literature Review</label>
                                                            <Select name="rubricLiteratureReview" defaultValue="4">
                                                                <SelectTrigger className="h-9 bg-background border-border/50 text-xs">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {[5, 4, 3, 2, 1].map(n => (
                                                                        <SelectItem key={n} value={String(n)}>{n} - {n === 5 ? 'Comprehensive' : n === 4 ? 'Good' : n === 3 ? 'Moderate' : n === 2 ? 'Sparse' : 'Missing'}</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-medium text-muted-foreground">overall score (1-10)</label>
                                                        <Input
                                                            name="score"
                                                            type="number"
                                                            min="1"
                                                            max="10"
                                                            required
                                                            defaultValue="8"
                                                            placeholder="8"
                                                            className="h-10 bg-muted/30 border-border/50 rounded-lg px-3 text-sm"
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
                                                            defaultValue="4"
                                                            placeholder="4"
                                                            className="h-10 bg-muted/30 border-border/50 rounded-lg px-3 text-sm"
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
                                            <Button type="submit" disabled={isPending} className="w-full h-12 bg-primary text-white font-bold text-xs rounded-lg transition-all cursor-pointer">
                                                {isPending ? 'Submitting...' : 'Submit'}
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

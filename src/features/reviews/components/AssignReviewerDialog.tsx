'use client';

import { useState } from 'react';
import { Plus, CheckCircle, FileUp, RefreshCw, Loader2, ThumbsUp, ThumbsDown, AlertTriangle, Bookmark } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { SafeUserWithProfile, UnassignedPaper, ReviewerPerformanceMetrics } from '@/db/types';

interface AssignReviewerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unassigned: UnassignedPaper[];
    sortedStaff: SafeUserWithProfile[];
    metrics?: Record<string, ReviewerPerformanceMetrics> | undefined;
    selectedSubmissionId: string;
    onSelectedSubmissionIdChange: (id: string) => void;
    onAutoConvert: () => Promise<void>;
    isConverting: boolean;
    onAssign: (formData: FormData) => void;
    isAssigning: boolean;
}

const formatLastActive = (dateStr: Date | string | null | undefined) => {
    if (!dateStr) return "never active";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "active now";
    if (diffMins < 60) return `active ${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `active ${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "active yesterday";
    return `active ${diffDays}d ago`;
};

export function AssignReviewerDialog({
    open,
    onOpenChange,
    unassigned,
    sortedStaff,
    metrics,
    selectedSubmissionId,
    onSelectedSubmissionIdChange,
    onAutoConvert,
    isConverting,
    onAssign,
    isAssigning,
}: AssignReviewerDialogProps) {
    const [assignFile, setAssignFile] = useState<File | null>(null);
    const [selectedReviewerId, setSelectedReviewerId] = useState<string>("");

    const selectedPaper = unassigned.find(p => p.id.toString() === selectedSubmissionId);
    const hasExistingPdf = !!selectedPaper?.pdfUrl;

    const suggestions = selectedPaper?.reviewerSuggestions || [];
    const preferredSuggestions = suggestions.filter(s => s.type === 'suggested');
    const opposedSuggestions = suggestions.filter(s => s.type === 'opposed');

    // Check if the currently chosen reviewer is opposed
    const chosenReviewer = sortedStaff.find(r => r.id === selectedReviewerId);
    const selectedIsOpposed = chosenReviewer && opposedSuggestions.find(
        s => (s.email && s.email.toLowerCase() === chosenReviewer.email.toLowerCase()) ||
             (s.mappedReviewerId && s.mappedReviewerId === chosenReviewer.id)
    );

    const handleSubmit = (formData: FormData) => {
        onAssign(formData);
        setAssignFile(null);
        setSelectedReviewerId("");
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="h-10 px-6 gap-3 bg-primary text-white font-semibold text-[10px] rounded-xl shadow-lg transition-all cursor-pointer">
                    <Plus className="w-4 h-4" />Assign Reviewer
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-xl p-5 bg-card border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">Assign Reviewer</DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Assign manuscripts to technical staff with conflict-of-interest checks.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-5 pt-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">Manuscript</label>
                            <div className="flex items-center gap-1.5">
                                {selectedPaper?.sectionTitle && (
                                    <span className="text-[8px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
                                        <Bookmark className="w-2.5 h-2.5" />
                                        {selectedPaper.sectionTitle}
                                    </span>
                                )}
                                {selectedPaper?.isBlinded && (
                                    <span className="text-[8px] font-bold bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        🔒 Blinded
                                    </span>
                                )}
                            </div>
                        </div>
                        <Select 
                            name="submissionId" 
                            required 
                            defaultValue={selectedSubmissionId} 
                            onValueChange={(val) => {
                                onSelectedSubmissionIdChange(val);
                                setSelectedReviewerId("");
                            }}
                        >
                            <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                <SelectValue placeholder="Identify paper..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/5 bg-card">
                                {unassigned.map(paper => (
                                    <SelectItem key={paper.id} value={paper.id.toString()}>
                                        {paper.paperId} | {paper.title.slice(0, 35)}... {paper.isBlinded ? '(Blinded)' : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Author Reviewer Suggestions Widget */}
                        {suggestions.length > 0 && (
                            <div className="p-3 bg-muted/20 border border-border/50 rounded-xl space-y-2 text-xs">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground m-0">
                                    Author Reviewer Preferences:
                                </p>
                                <div className="space-y-1">
                                    {preferredSuggestions.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                                            <ThumbsUp className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                <strong>Suggested:</strong> {s.givenName} {s.familyName || ""} ({s.email})
                                                {s.suggestionReason && <em className="text-muted-foreground ml-1">"{s.suggestionReason}"</em>}
                                            </span>
                                        </div>
                                    ))}
                                    {opposedSuggestions.map((s, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-medium">
                                            <ThumbsDown className="w-3.5 h-3.5 shrink-0" />
                                            <span>
                                                <strong>Opposed:</strong> {s.givenName} {s.familyName || ""} ({s.email})
                                                {s.suggestionReason && <em className="text-muted-foreground ml-1">"{s.suggestionReason}"</em>}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Reviewer</label>
                        <Select 
                            name="reviewerId" 
                            required 
                            value={selectedReviewerId} 
                            onValueChange={setSelectedReviewerId}
                        >
                            <SelectTrigger className="h-14 bg-primary/5 border-none rounded-xl px-5 font-semibold text-primary">
                                <SelectValue placeholder="Identify staff..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-primary/5 bg-card">
                                {sortedStaff.map(r => {
                                    const m = metrics?.[r.id];
                                    const ratingBadge = m && m.completedReviewsCount > 0 
                                        ? `⭐ ${m.averageRating ?? 'N/A'} (${m.completedReviewsCount})` 
                                        : '⭐ New';

                                    const isSuggested = preferredSuggestions.some(
                                        s => (s.email && s.email.toLowerCase() === r.email.toLowerCase()) ||
                                             (s.mappedReviewerId && s.mappedReviewerId === r.id)
                                    );
                                    const isOpposed = opposedSuggestions.some(
                                        s => (s.email && s.email.toLowerCase() === r.email.toLowerCase()) ||
                                             (s.mappedReviewerId && s.mappedReviewerId === r.id)
                                    );

                                    return (
                                        <SelectItem key={r.id} value={r.id.toString()}>
                                            <span className="flex items-center gap-1.5 flex-wrap">
                                                <span>{r.profile?.fullName || r.email}</span>
                                                <span className="text-xs text-muted-foreground">[{ratingBadge}]</span>
                                                <span className="text-[10px] text-muted-foreground/70">({formatLastActive(r.lastActiveAt)})</span>
                                                {isSuggested && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-bold border border-emerald-500/20">
                                                        👍 Author Preferred
                                                    </span>
                                                )}
                                                {isOpposed && (
                                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 font-bold border border-rose-500/20">
                                                        ⚠️ Author Opposed
                                                    </span>
                                                )}
                                            </span>
                                        </SelectItem>
                                    );
                                })}
                            </SelectContent>
                        </Select>

                        {/* Active Warning Banner if Opposed Reviewer is Selected */}
                        {selectedIsOpposed && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400">
                                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                                <div className="text-xs space-y-0.5">
                                    <p className="font-bold m-0">Author Conflict of Interest Warning</p>
                                    <p className="m-0 text-muted-foreground leading-snug">
                                        The author explicitly requested not to assign this reviewer:
                                        <span className="font-semibold text-rose-600 dark:text-rose-400 ml-1">
                                            "{selectedIsOpposed.suggestionReason || 'Conflict of interest stated by author'}"
                                        </span>
                                    </p>
                                </div>
                            </div>
                        )}
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
                            <label className="text-[10px] font-bold text-primary tracking-widest uppercase">
                                Manuscript PDF {hasExistingPdf ? '(Verified)' : '(Required)'}
                            </label>
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
                                onClick={onAutoConvert}
                                disabled={isConverting}
                                variant="outline"
                                className="w-full h-14 gap-3 border-primary/20 bg-primary/5 text-primary font-black text-[10px] tracking-widest rounded-xl hover:bg-primary hover:text-white transition-all shadow-xl shadow-primary/5 cursor-pointer group"
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
                        <Button 
                            type="submit" 
                            disabled={isAssigning || isConverting} 
                            className="w-full h-16 bg-primary text-white font-semibold text-[10px] tracking-[0.3em] rounded-xl shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all cursor-pointer"
                        >
                            {isAssigning ? 'SYNCHRONIZING...' : 'COMMIT ASSIGNMENT'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

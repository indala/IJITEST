'use client';

import { useState } from 'react';
import { Plus, CheckCircle, FileUp, RefreshCw, Loader2 } from 'lucide-react';
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
import type { SafeUserWithProfile, UnassignedPaper } from '@/db/types';

interface AssignReviewerDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    unassigned: UnassignedPaper[];
    sortedStaff: SafeUserWithProfile[];
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
    selectedSubmissionId,
    onSelectedSubmissionIdChange,
    onAutoConvert,
    isConverting,
    onAssign,
    isAssigning,
}: AssignReviewerDialogProps) {
    const [assignFile, setAssignFile] = useState<File | null>(null);

    const selectedPaper = unassigned.find(p => p.id.toString() === selectedSubmissionId);
    const hasExistingPdf = !!selectedPaper?.pdfUrl;

    const handleSubmit = (formData: FormData) => {
        onAssign(formData);
        setAssignFile(null);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button className="h-10 px-6 gap-3 bg-primary text-white font-semibold text-[10px] rounded-xl shadow-lg transition-all cursor-pointer">
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
                <form action={handleSubmit} className="space-y-5 pt-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase px-1">Manuscript</label>
                        <Select 
                            name="submissionId" 
                            required 
                            defaultValue={selectedSubmissionId} 
                            onValueChange={onSelectedSubmissionIdChange}
                        >
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
                                {sortedStaff.map(r => (
                                    <SelectItem key={r.id} value={r.id.toString()}>{r.profile?.fullName || r.email} ({formatLastActive(r.lastActiveAt)})</SelectItem>
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

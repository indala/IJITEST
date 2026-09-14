'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Upload,
    FileText,
    CheckCircle2,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { toast } from "sonner";
import Link from 'next/link';
import {
    verifyManuscriptForRevision,
    submitPublicRevision,
    type ManuscriptVerificationResult
} from "@/actions/submit-multimode";

export default function RevisedSubmissionForm() {
    const [paperId, setPaperId] = useState("");
    const [authorEmail, setAuthorEmail] = useState("");
    const [isVerifying, startVerifyTransition] = useTransition();
    const [verifiedPaper, setVerifiedPaper] = useState<ManuscriptVerificationResult | null>(null);

    // Form inputs
    const [manuscriptFile, setManuscriptFile] = useState<File | null>(null);
    const [rebuttalFile, setRebuttalFile] = useState<File | null>(null);
    const [changelog, setChangelog] = useState("");
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [submissionSuccess, setSubmissionSuccess] = useState<{ paperId: string; version: number } | null>(null);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paperId.trim() || !authorEmail.trim()) {
            toast.error("Please enter both Manuscript ID and Correspondent Email.");
            return;
        }

        startVerifyTransition(async () => {
            const res = await verifyManuscriptForRevision(paperId, authorEmail);
            if (res.success && res.data) {
                setVerifiedPaper(res.data);
                toast.success("Manuscript verified for revision submission.");
            } else {
                setVerifiedPaper(null);
                toast.error(res.error || "Verification failed. Check your credentials.");
            }
        });
    };

    const handleReset = () => {
        setVerifiedPaper(null);
        setManuscriptFile(null);
        setRebuttalFile(null);
        setChangelog("");
        setSubmissionSuccess(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifiedPaper) return;

        if (!manuscriptFile) {
            toast.error("Please select your revised manuscript (.docx).");
            return;
        }

        const formData = new FormData();
        formData.append("paperId", verifiedPaper.paperId);
        formData.append("authorEmail", verifiedPaper.authorEmail);
        formData.append("manuscript", manuscriptFile);
        formData.append("changelog", changelog);
        if (rebuttalFile) {
            formData.append("rebuttalFile", rebuttalFile);
        }

        startSubmitTransition(async () => {
            const res = await submitPublicRevision(formData);
            if (res.success && res.data) {
                toast.success("Revised manuscript submitted successfully!");
                setSubmissionSuccess(res.data);
            } else {
                toast.error(res.error || "Failed to submit revision.");
            }
        });
    };

    if (submissionSuccess) {
        return (
            <Card className="border-border/70 shadow-sm bg-card overflow-hidden">
                <CardContent className="p-6 sm:p-10 text-center space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="card-title-brand m-0 text-foreground">Revision Submitted Successfully</h2>
                        <p className="text-muted-foreground max-w-md mx-auto m-0">
                            Version {submissionSuccess.version} of manuscript <span className="font-mono font-bold text-foreground">{submissionSuccess.paperId}</span> has been received and queued for editorial re-evaluation.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <Button asChild className="btn-primary">
                            <Link href={`/track?id=${submissionSuccess.paperId}`}>
                                Track Manuscript Status
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handleReset} className="cursor-pointer">
                            Submit Another Revision
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Step 1: Verification */}
            <form onSubmit={handleVerify} className="space-y-4 bg-muted/20 p-4 sm:p-6 rounded-xl border border-border/60">
                <div className="space-y-1">
                    <h3 className="card-title-brand m-0">Step 1: Verify Manuscript</h3>
                    <p className="text-caption text-muted-foreground m-0">
                        Enter the Manuscript ID and registered corresponding author email to verify revision eligibility.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="rev-paperId" className="form-label-brand">
                            Manuscript ID <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="rev-paperId"
                            placeholder="e.g. IJITEST-2026-0042"
                            value={paperId}
                            onChange={(e) => setPaperId(e.target.value)}
                            disabled={isVerifying || !!verifiedPaper}
                            className="input-standard"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="rev-email" className="form-label-brand">
                            Corresponding Author Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="rev-email"
                            type="email"
                            placeholder="author@university.edu"
                            value={authorEmail}
                            onChange={(e) => setAuthorEmail(e.target.value)}
                            disabled={isVerifying || !!verifiedPaper}
                            className="input-standard"
                            required
                        />
                    </div>
                </div>

                {!verifiedPaper ? (
                    <Button
                        type="submit"
                        disabled={isVerifying}
                        className="btn-primary cursor-pointer w-full sm:w-auto"
                    >
                        {isVerifying ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Verifying Manuscript…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Verify Manuscript
                            </span>
                        )}
                    </Button>
                ) : (
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-emerald-600 font-medium text-caption">
                            <CheckCircle2 className="w-4 h-4" />
                            Manuscript Verified for Revision
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleReset}
                            className="text-caption cursor-pointer h-8"
                        >
                            <RefreshCw className="w-3.5 h-3.5 mr-1" />
                            Change Paper ID
                        </Button>
                    </div>
                )}
            </form>

            {/* Step 2: Upload Revision Details (When Verified) */}
            {verifiedPaper && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-50 duration-300">
                    {/* Paper Summary Box */}
                    <div className="p-4 sm:p-5 rounded-xl border border-secondary/30 bg-secondary/5 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge variant="outline" className="font-mono text-badge">
                                {verifiedPaper.paperId}
                            </Badge>
                            <Badge className="badge-warning">
                                Revision Requested
                            </Badge>
                        </div>
                        <h3 className="text-foreground m-0 font-bold leading-snug">
                            {verifiedPaper.title}
                        </h3>
                        <p className="text-caption text-muted-foreground m-0">
                            Author: <span className="font-semibold text-foreground">{verifiedPaper.authorName}</span> ({verifiedPaper.authorEmail})
                        </p>
                    </div>

                    {/* Revised Manuscript File Upload */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="revised-file" className="form-label-brand">
                                Revised Manuscript Document (.docx) <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-meta text-muted-foreground">Max 20MB (.docx only)</span>
                        </div>
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                manuscriptFile
                                    ? 'border-emerald-500 bg-emerald-50/20'
                                    : 'border-border/70 hover:border-primary/40 bg-muted/10'
                            }`}
                            onClick={() => document.getElementById('revised-file-input')?.click()}
                        >
                            <input
                                id="revised-file-input"
                                type="file"
                                accept=".docx"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && !file.name.toLowerCase().endsWith('.docx')) {
                                        toast.error("Strict Policy: Only .docx files are accepted for revised manuscripts.");
                                        e.target.value = '';
                                        return;
                                    }
                                    setManuscriptFile(file);
                                }}
                            />
                            {manuscriptFile ? (
                                <div className="space-y-1">
                                    <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <p className="font-bold text-foreground m-0">{manuscriptFile.name}</p>
                                    <p className="text-meta text-muted-foreground m-0">{(manuscriptFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                                    <p className="font-semibold text-foreground m-0 text-caption">
                                        Click or drop your revised .docx manuscript here
                                    </p>
                                    <p className="text-meta text-muted-foreground m-0">
                                        Ensure all reviewer feedback corrections are highlighted or tracked.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Rebuttal File Upload (Optional Document) */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="rebuttal-file" className="form-label-brand">
                                Response to Reviewers / Rebuttal Letter <span className="text-meta text-muted-foreground">(Optional File)</span>
                            </Label>
                            <span className="text-meta text-muted-foreground">.docx or .pdf</span>
                        </div>
                        <div
                            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                                rebuttalFile
                                    ? 'border-emerald-500 bg-emerald-50/20'
                                    : 'border-border/70 hover:border-primary/40 bg-muted/10'
                            }`}
                            onClick={() => document.getElementById('rebuttal-file-input')?.click()}
                        >
                            <input
                                id="rebuttal-file-input"
                                type="file"
                                accept=".docx,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && !file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.pdf')) {
                                        toast.error("Rebuttal document must be a .docx or .pdf file.");
                                        e.target.value = '';
                                        return;
                                    }
                                    setRebuttalFile(file);
                                }}
                            />
                            {rebuttalFile ? (
                                <div className="space-y-1">
                                    <FileText className="w-7 h-7 text-emerald-600 mx-auto" />
                                    <p className="font-bold text-foreground m-0">{rebuttalFile.name}</p>
                                    <p className="text-meta text-muted-foreground m-0">{(rebuttalFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <Upload className="w-6 h-6 text-muted-foreground/60 mx-auto" />
                                    <p className="font-semibold text-foreground m-0 text-caption">
                                        Upload point-by-point response letter (.docx / .pdf)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Text Changelog / Response Summary */}
                    <div className="space-y-1.5">
                        <Label htmlFor="changelog" className="form-label-brand">
                            Summary of Changes / Response to Reviewers <span className="text-destructive">*</span>
                        </Label>
                        <Textarea
                            id="changelog"
                            placeholder="Detail how you addressed each reviewer comment (e.g. 'Reviewer 1 comment 1: We updated Section 3.2 to include additional comparative data...')"
                            value={changelog}
                            onChange={(e) => setChangelog(e.target.value)}
                            className="min-h-32 input-standard"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !manuscriptFile}
                        className="btn-primary w-full h-11 text-label uppercase tracking-wider cursor-pointer"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting Revised Manuscript…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Submit Revised Manuscript
                            </span>
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
}

'use client';

import { useState, useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Search,
    Upload,
    FileText,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Download,
    CreditCard,
    ShieldCheck,
    ExternalLink
} from 'lucide-react';
import { toast } from "sonner";
import Link from 'next/link';
import { useSettingsContext } from "@/components/providers/SettingsContext";
import {
    verifyManuscriptForFinalSubmission,
    submitPublicFinalSubmission,
    type ManuscriptVerificationResult
} from "@/actions/submit-multimode";

export default function FinalSubmissionForm() {
    const settings = useSettingsContext();
    const [paperId, setPaperId] = useState("");
    const [authorEmail, setAuthorEmail] = useState("");
    const [isVerifying, startVerifyTransition] = useTransition();
    const [verifiedPaper, setVerifiedPaper] = useState<ManuscriptVerificationResult | null>(null);

    // Form inputs
    const [cameraReadyFile, setCameraReadyFile] = useState<File | null>(null);
    const [copyrightFile, setCopyrightFile] = useState<File | null>(null);
    const [paymentReceiptFile, setPaymentReceiptFile] = useState<File | null>(null);
    const [utrNumber, setUtrNumber] = useState("");
    const [isSubmitting, startSubmitTransition] = useTransition();
    const [submissionSuccess, setSubmissionSuccess] = useState<{ paperId: string } | null>(null);

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        if (!paperId.trim() || !authorEmail.trim()) {
            toast.error("Please enter both Manuscript ID and Correspondent Email.");
            return;
        }

        startVerifyTransition(async () => {
            const res = await verifyManuscriptForFinalSubmission(paperId, authorEmail);
            if (!res.success) {
                setVerifiedPaper(null);
                toast.error(res.error);
            } else if (res.data) {
                setVerifiedPaper(res.data);
                toast.success("Manuscript verified for final camera-ready submission.");
            } else {
                setVerifiedPaper(null);
                toast.error("Verification returned no manuscript data.");
            }
        });
    };

    const handleReset = () => {
        setVerifiedPaper(null);
        setCameraReadyFile(null);
        setCopyrightFile(null);
        setPaymentReceiptFile(null);
        setUtrNumber("");
        setSubmissionSuccess(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifiedPaper) return;

        if (!cameraReadyFile) {
            toast.error("Please upload the final camera-ready manuscript (.docx).");
            return;
        }

        if (!copyrightFile) {
            toast.error("Please upload the signed copyright transfer agreement (.docx or .pdf).");
            return;
        }

        const formData = new FormData();
        formData.append("paperId", verifiedPaper.paperId);
        formData.append("authorEmail", verifiedPaper.authorEmail);
        formData.append("cameraReadyManuscript", cameraReadyFile);
        formData.append("copyrightForm", copyrightFile);
        if (utrNumber.trim()) {
            formData.append("utrNumber", utrNumber.trim());
        }
        if (paymentReceiptFile) {
            formData.append("paymentReceipt", paymentReceiptFile);
        }

        startSubmitTransition(async () => {
            const res = await submitPublicFinalSubmission(formData);
            if (!res.success) {
                toast.error(res.error);
            } else if (res.data) {
                toast.success("Final camera-ready package received successfully!");
                setSubmissionSuccess(res.data);
            } else {
                toast.error("Final submission returned no confirmation.");
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
                        <h2 className="card-title-brand m-0 text-foreground">Final Package Received</h2>
                        <p className="text-muted-foreground max-w-md mx-auto m-0">
                            The camera-ready manuscript and copyright agreement for manuscript <span className="font-mono font-bold text-foreground">{submissionSuccess.paperId}</span> have been safely recorded.
                        </p>
                        <p className="text-caption text-muted-foreground m-0">
                            Our production team will format the galley proof for your final sign-off prior to volume publication.
                        </p>
                    </div>

                    <div className="pt-4 flex flex-wrap justify-center gap-3">
                        <Button asChild className="btn-primary">
                            <Link href={`/track?id=${submissionSuccess.paperId}`}>
                                Track Publication Progress
                            </Link>
                        </Button>
                        <Button variant="outline" onClick={handleReset} className="cursor-pointer">
                            Submit Another Paper
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    }

    const templateUrl = settings['templateUrl'] || '/docs/template-url.docx';
    const copyrightUrl = settings['copyrightUrl'] || '/docs/copyright-url.docx';

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Step 1: Verification */}
            <form onSubmit={handleVerify} className="space-y-4 bg-muted/20 p-4 sm:p-6 rounded-xl border border-border/60">
                <div className="space-y-1">
                    <h3 className="card-title-brand m-0">Step 1: Verify Accepted Manuscript</h3>
                    <p className="text-caption text-muted-foreground m-0">
                        Enter your Manuscript ID and corresponding author email to verify acceptance status.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="final-paperId" className="form-label-brand">
                            Manuscript ID <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="final-paperId"
                            placeholder="e.g. IJITEST-2026-0012"
                            value={paperId}
                            onChange={(e) => setPaperId(e.target.value)}
                            disabled={isVerifying || !!verifiedPaper}
                            className="input-standard"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="final-email" className="form-label-brand">
                            Corresponding Author Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="final-email"
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
                                Verifying Acceptance…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Verify Accepted Paper
                            </span>
                        )}
                    </Button>
                ) : (
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-emerald-600 font-medium text-caption">
                            <CheckCircle2 className="w-4 h-4" />
                            Manuscript Verified as Accepted
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

            {/* Step 2: Upload Final Package */}
            {verifiedPaper && (
                <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in-50 duration-300">
                    {/* Paper Summary Box */}
                    <div className="p-4 sm:p-5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <Badge variant="outline" className="font-mono text-badge">
                                {verifiedPaper.paperId}
                            </Badge>
                            <Badge className="badge-success">
                                {verifiedPaper.status === 'paymentPending' ? 'Payment Pending / Accepted' : 'Accepted for Publication'}
                            </Badge>
                        </div>
                        <h3 className="text-foreground m-0 font-bold leading-snug">
                            {verifiedPaper.title}
                        </h3>
                        <p className="text-caption text-muted-foreground m-0">
                            Corresponding Author: <span className="font-semibold text-foreground">{verifiedPaper.authorName}</span> ({verifiedPaper.authorEmail})
                        </p>
                    </div>

                    {/* Quick Downloads Header */}
                    <div className="p-4 bg-muted/40 rounded-xl border border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                            <h4 className="font-bold text-foreground m-0 text-caption">Download Official Templates</h4>
                            <p className="text-meta text-muted-foreground m-0">
                                Camera-ready manuscripts must strictly follow the IEEE journal layout.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Button asChild variant="outline" size="sm" className="h-8 text-caption">
                                <a href={templateUrl} download target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5 mr-1" /> Word Template (.docx)
                                </a>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="h-8 text-caption">
                                <a href={copyrightUrl} download target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5 mr-1" /> Copyright Form (.docx)
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* File Upload 1: Camera-Ready Manuscript */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="camera-ready-file" className="form-label-brand">
                                Final Camera-Ready Manuscript (.docx) <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-meta text-muted-foreground">Strict Policy: .docx only</span>
                        </div>
                        <div
                            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
                                cameraReadyFile
                                    ? 'border-emerald-500 bg-emerald-50/20'
                                    : 'border-border/70 hover:border-primary/40 bg-muted/10'
                            }`}
                            onClick={() => document.getElementById('camera-ready-file-input')?.click()}
                        >
                            <input
                                id="camera-ready-file-input"
                                type="file"
                                accept=".docx"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && !file.name.toLowerCase().endsWith('.docx')) {
                                        toast.error("Strict Policy: Only .docx files are accepted for camera-ready papers.");
                                        e.target.value = '';
                                        return;
                                    }
                                    setCameraReadyFile(file);
                                }}
                            />
                            {cameraReadyFile ? (
                                <div className="space-y-1">
                                    <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <p className="font-bold text-foreground m-0">{cameraReadyFile.name}</p>
                                    <p className="text-meta text-muted-foreground m-0">{(cameraReadyFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <Upload className="w-8 h-8 text-muted-foreground/60 mx-auto" />
                                    <p className="font-semibold text-foreground m-0 text-caption">
                                        Click or drop your camera-ready .docx file here
                                    </p>
                                    <p className="text-meta text-muted-foreground m-0">
                                        Ensure author biographies, photos, affiliations, and final IEEE references are incorporated.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* File Upload 2: Signed Copyright Form */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="copyright-file" className="form-label-brand">
                                Signed Copyright Transfer Form <span className="text-destructive">*</span>
                            </Label>
                            <span className="text-meta text-muted-foreground">.docx or .pdf</span>
                        </div>
                        <div
                            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
                                copyrightFile
                                    ? 'border-emerald-500 bg-emerald-50/20'
                                    : 'border-border/70 hover:border-primary/40 bg-muted/10'
                            }`}
                            onClick={() => document.getElementById('copyright-file-input')?.click()}
                        >
                            <input
                                id="copyright-file-input"
                                type="file"
                                accept=".docx,.pdf"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file && !file.name.toLowerCase().endsWith('.docx') && !file.name.toLowerCase().endsWith('.pdf')) {
                                        toast.error("Copyright form must be a .docx or .pdf file.");
                                        e.target.value = '';
                                        return;
                                    }
                                    setCopyrightFile(file);
                                }}
                            />
                            {copyrightFile ? (
                                <div className="space-y-1">
                                    <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                                    <p className="font-bold text-foreground m-0">{copyrightFile.name}</p>
                                    <p className="text-meta text-muted-foreground m-0">{(copyrightFile.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <Upload className="w-7 h-7 text-muted-foreground/60 mx-auto" />
                                    <p className="font-semibold text-foreground m-0 text-caption">
                                        Upload signed copyright transfer agreement (.docx / .pdf)
                                    </p>
                                    <p className="text-meta text-muted-foreground m-0">
                                        Must be signed by the corresponding author on behalf of all authors.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Section 3: APC Payment Details */}
                    <div className="p-4 sm:p-5 rounded-xl border border-border/70 bg-card space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/50 pb-3">
                            <div className="space-y-0.5">
                                <h4 className="font-bold text-foreground m-0 text-caption flex items-center gap-1.5">
                                    <CreditCard className="w-4 h-4 text-primary" />
                                    Article Processing Charge (APC) Verification
                                </h4>
                                <p className="text-meta text-muted-foreground m-0">
                                    Provide payment confirmation or complete your grant settlement.
                                </p>
                            </div>
                            <Button asChild variant="outline" size="sm" className="h-8 text-caption shrink-0">
                                <Link href={`/payment/${verifiedPaper.paperId}`} target="_blank">
                                    Pay Online via Gateway <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="utr-number" className="form-label-brand">
                                    Bank Transaction / UTR / Reference ID
                                </Label>
                                <Input
                                    id="utr-number"
                                    placeholder="e.g. UTR1234567890 or Razorpay PayID"
                                    value={utrNumber}
                                    onChange={(e) => setUtrNumber(e.target.value)}
                                    className="input-standard"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="receipt-file" className="form-label-brand">
                                    Payment Receipt / Screenshot <span className="text-meta text-muted-foreground">(Optional)</span>
                                </Label>
                                <Input
                                    id="receipt-file"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={(e) => setPaymentReceiptFile(e.target.files?.[0] || null)}
                                    className="input-standard cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isSubmitting || !cameraReadyFile || !copyrightFile}
                        className="btn-primary w-full h-11 text-label uppercase tracking-wider cursor-pointer"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting Camera-Ready Package…
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Submit Camera-Ready Package
                            </span>
                        )}
                    </Button>
                </form>
            )}
        </div>
    );
}

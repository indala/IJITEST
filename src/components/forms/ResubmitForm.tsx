"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { resubmitPaper } from "@/actions/author-submissions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, AlertCircle, CheckCircle, FileText, Loader2 } from "lucide-react";
import { type ActionResponse, type Submission, type Version } from "@/db/types";

interface ResubmitFormProps {
    submissionId: Submission['id'];
    paperId: Submission['paperId'];
    title: Version['title'];
    daysRemaining: number;
    currentStatus: Submission['status'];
}

export function ResubmitForm({ submissionId, paperId, title, daysRemaining, currentStatus }: ResubmitFormProps) {
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [manuscript, setManuscript] = useState<File | null>(null);

    const isUrgent = daysRemaining <= 5;

    const uploadAction = async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
        if (!manuscript) {
            setError("Please upload the revised manuscript.");
            return null;
        }

        formData.set("manuscript", manuscript);
        setError(null);

        try {
            const res = await resubmitPaper(submissionId, formData);
            if (!res.success) {
                setError(res.error || "Failed to resubmit");
            } else {
                setSuccess(true);
                setTimeout(() => router.push(`/author/submissions/${submissionId}`), 2500);
            }
            return res;
        } catch (err) {
            console.error("Resubmission error:", err);
            const errRes = { success: false, error: "An unexpected error occurred during submission." };
            setError(errRes.error);
            return errRes;
        }
    };

    const [, formAction, isPending] = useActionState(uploadAction, null);

    if (success) {
        return (
            <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-10 flex flex-col items-center gap-4 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500" />
                    <h3 className="font-black text-xl uppercase tracking-widest text-foreground">Resubmission Received</h3>
                    <p className="text-sm text-muted-foreground max-w-sm">
                        Your revised manuscript has been submitted. The editorial team will be notified. Redirecting…
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <form action={formAction} className="space-y-6">
            {/* Urgency Banner */}
            <div className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${isUrgent
                ? 'bg-orange-50  border-orange-200  text-orange-700 '
                : 'bg-amber-50  border-amber-200  text-amber-700 '}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                    <span className="font-black">{daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining</span> to submit your revision.
                    Failure to resubmit will deactivate your account.
                </span>
            </div>

            {/* Paper info */}
            <Card className="border-border/50 bg-muted/10">
                <CardContent className="p-5 space-y-2">
                    <p className="text-[9px] font-black tracking-widest uppercase text-muted-foreground">Revising Submission</p>
                    <p className="font-bold text-foreground line-clamp-2">{title}</p>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px] font-mono">{paperId}</Badge>
                        <Badge className="text-[9px] bg-orange-500/10 text-orange-600 border-none capitalize">
                            {currentStatus.replace('_', ' ')}
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Manuscript Upload */}
            <div className="space-y-2">
                <Label htmlFor="manuscript-upload" className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    Revised Manuscript <span className="text-rose-500">*</span>
                </Label>
                <div
                    className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${manuscript ? 'border-emerald-400 bg-emerald-50/30 ' : 'border-border hover:border-primary/40 bg-muted/10'}`}
                    onClick={() => !isPending && document.getElementById('manuscript-upload')?.click()}
                >
                    <input
                        id="manuscript-upload"
                        type="file"
                        title="Upload revised manuscript"
                        accept=".docx"
                        className="hidden"
                        onChange={(e) => setManuscript(e.target.files?.[0] || null)}
                        disabled={isPending}
                    />
                    {manuscript ? (
                        <>
                            <FileText className="w-8 h-8 text-emerald-500 mb-2" />
                            <p className="text-sm font-bold text-foreground">{manuscript.name}</p>
                            <p className="text-[10px] text-muted-foreground">{(manuscript.size / 1024).toFixed(0)} KB</p>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm font-bold text-muted-foreground">Click to upload revised manuscript</p>
                            <p className="text-[10px] text-muted-foreground/70">Strict Policy: .DOCX only (max 20MB)</p>
                        </>
                    )}
                </div>
            </div>

            {/* Changelog / Cover Letter */}
            <div className="space-y-2">
                <Label htmlFor="changelog" className="text-xs font-bold uppercase tracking-widest text-foreground/80">
                    Response to Reviewers / Cover Letter <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                    id="changelog"
                    name="changelog"
                    placeholder="Summarize the changes made in response to reviewer comments..."
                    className="min-h-35 text-sm resize-none border-border/60 focus:border-primary/40 rounded-xl"
                    disabled={isPending}
                />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-sm font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            <Button
                type="submit"
                disabled={isPending}
                className="w-full h-12 bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest text-sm rounded-xl shadow cursor-pointer"
            >
                {isPending ? (
                    <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</span>
                ) : (
                    <span className="flex items-center gap-2"><Upload className="w-4 h-4" /> Submit Revision</span>
                )}
            </Button>
        </form>
    );
}

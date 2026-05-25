"use client";

import { useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Upload, CheckCircle2, AlertCircle, Loader2, Info } from "lucide-react";
import { resubmitPaper } from "@/actions/author-submissions";
import { toast } from "sonner";
import { type ActionResponse, type Submission } from "@/db/types";

interface ResubmissionFormProps {
    submissionId: Submission['id'];
    daysRemaining: number;
}

export function ResubmissionForm({ submissionId, daysRemaining }: ResubmissionFormProps) {
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    const uploadAction = async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
        try {
            const res = await resubmitPaper(submissionId, formData);
            if (res.success) {
                setSuccess(true);
                toast.success("Manuscript resubmitted successfully!");
                setTimeout(() => {
                    router.refresh();
                }, 2000);
            } else {
                toast.error(res.error || "Failed to resubmit");
            }
            return res;
        } catch (err) {
            console.error("Resubmission error:", err);
            const errRes = { success: false, error: "An unexpected error occurred during submission." };
            toast.error(errRes.error);
            return errRes;
        }
    };

    const [, formAction, isPending] = useActionState(uploadAction, null);

    if (success) {
        return (
            <Card className="border-green-100 bg-green-50/30">
                <CardContent className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <CardTitle className="text-green-900 mb-2">Resubmission Successful!</CardTitle>
                    <CardDescription className="text-green-700">
                        Your revised manuscript has been uploaded and the editorial team has been notified.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-primary/10 shadow-xl shadow-primary/5">
            <CardHeader className="border-b border-primary/5 bg-primary/1">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl font-black tracking-tight text-primary">Submit Revised Manuscript</CardTitle>
                        <CardDescription>Upload your updated documents and address reviewer feedback.</CardDescription>
                    </div>
                    <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-xl text-xs font-bold border border-orange-100 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {daysRemaining} days remaining to resubmit
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <form action={formAction} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="changelog" className="text-sm font-bold text-primary/60">Response to Reviewers / Changelog</Label>
                        <Textarea 
                            id="changelog" 
                            name="changelog"
                            placeholder="Briefly describe the changes made in this revision..."
                            className="min-h-[120px] rounded-xl border-primary/10 focus:border-secondary transition-all"
                            required
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="manuscript" className="text-sm font-bold text-primary/60">Revised Manuscript (Main File)</Label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-primary/10 rounded-2xl cursor-pointer hover:bg-primary/2 hover:border-secondary/30 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 text-primary/20 mb-2" />
                                <p className="text-xs text-primary/40 font-bold">DOCX, PDF (Max 20MB)</p>
                            </div>
                            <Input id="manuscript" name="manuscript" type="file" className="hidden" required disabled={isPending} />
                        </label>
                    </div>

                    <Alert className="bg-primary/5 border-primary/10 rounded-2xl">
                        <Info className="w-4 h-4" />
                        <AlertTitle className="text-xs font-black uppercase tracking-widest text-primary/40">Important Note</AlertTitle>
                        <AlertDescription className="text-sm text-primary/60 italic">
                            Uploading a revision will reset the status to &quot;Submitted&quot; and notify the editors. Please ensure all reviewer comments have been addressed.
                        </AlertDescription>
                    </Alert>

                    <Button 
                        type="submit" 
                        disabled={isPending}
                        className="w-full h-14 rounded-2xl bg-primary hover:bg-secondary transition-all text-white font-black tracking-widest shadow-xl shadow-primary/20 cursor-pointer"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Processing Resubmission...
                            </>
                        ) : (
                            "Finalize & Resubmit Manuscript"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

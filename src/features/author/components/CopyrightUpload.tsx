"use client";

import React, { useState, useCallback, useActionState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle, Loader2, ShieldCheck } from "lucide-react";
import { uploadCopyrightFormAfterAcceptance } from "@/actions/author-submissions";
import { type ActionResponse, type Submission } from "@/db/types";

interface CopyrightUploadProps {
    submissionId: Submission['id'];
    copyrightUrl?: string | undefined;
}

export function CopyrightUpload({ submissionId, copyrightUrl }: CopyrightUploadProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);

    const uploadAction = async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
        if (!file) {
            toast.error("Please select a signed .docx copyright form first.");
            return { success: false, error: "Please select a signed .docx copyright form first." };
        }

        formData.set("copyrightForm", file);

        try {
            const res = await uploadCopyrightFormAfterAcceptance(submissionId, formData);
            if (res.success) {
                toast.success("Copyright transfer form uploaded successfully!");
                setFile(null);
                router.refresh();
            } else {
                toast.error(res.error || "Failed to upload copyright form.");
            }
            return res;
        } catch (err) {
            console.error("Copyright upload error:", err);
            toast.error("An unexpected error occurred during file upload.");
            return { success: false, error: "An unexpected error occurred during file upload." };
        }
    };

    const [, formAction, isPending] = useActionState(uploadAction, null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        if (selectedFile) {
            const isDocx = selectedFile.name.toLowerCase().endsWith('.docx') || 
                           selectedFile.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
            if (!isDocx) {
                toast.error("Strict Policy: Only .docx files are accepted for the copyright agreement.");
                e.target.value = '';
                setFile(null);
                return;
            }
            setFile(selectedFile);
        }
    }, []);

    return (
        <Card className="border-primary/10 shadow-xl shadow-primary/5 overflow-hidden animate-in fade-in duration-500">
            <CardHeader className="bg-primary/1 border-b border-primary/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-black text-primary">Copyright & Consent Agreement</CardTitle>
                        <CardDescription>A signed copyright agreement is mandatory before publication.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="text-sm text-primary/70 leading-relaxed space-y-2">
                    <p>
                        Congratulations! Your manuscript has been accepted. To complete the editorial workflow, please download the official template, fill/sign it, and upload it back as a <strong>.docx</strong> document.
                    </p>
                    {copyrightUrl && (
                        <div className="pt-2">
                            <Button asChild variant="outline" size="sm" className="h-9 gap-2 border-primary/20 text-[#000066] hover:bg-[#000066]/5 font-semibold text-xs transition-all">
                                <a href={copyrightUrl} download target="_blank" rel="noopener noreferrer">
                                    <Download className="w-3.5 h-3.5" />
                                    Download Copyright Template
                                </a>
                            </Button>
                        </div>
                    )}
                </div>

                <form action={formAction} className="space-y-4">
                    <div className="relative">
                        <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                            id="post-accept-copyright-upload"
                            accept=".docx"
                            disabled={isPending}
                        />
                        <label
                            htmlFor="post-accept-copyright-upload"
                            className={`flex flex-col items-center justify-center w-full min-h-[160px] border-2 border-dashed rounded-2xl transition-all cursor-pointer shadow-sm relative overflow-hidden ${
                                file
                                    ? 'border-emerald-500/50 bg-emerald-500/5'
                                    : 'border-primary/10 bg-card hover:border-primary/30 hover:bg-primary/2'
                             }`}
                        >
                            {file ? (
                                <div className="text-center px-4 py-6">
                                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-semibold text-gray-900 truncate max-w-[280px]">{file.name}</p>
                                    <p className="text-[10px] font-bold text-emerald-600/70 uppercase mt-1">Ready to upload ({(file.size / 1024).toFixed(0)} KB)</p>
                                </div>
                            ) : (
                                <div className="text-center px-4 py-6">
                                    <div className="w-12 h-12 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                                        <Upload className="w-5 h-5 text-primary/40" />
                                    </div>
                                    <p className="text-xs font-semibold text-primary/80">Select Signed Copyright Form</p>
                                    <p className="text-[10px] font-bold text-primary/40 uppercase mt-1">DOCX Only (Max 10MB)</p>
                                </div>
                            )}
                        </label>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending || !file}
                        className="w-full h-12 bg-[#000066] hover:bg-[#000088] text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
                    >
                        {isPending ? (
                            <div className="flex items-center justify-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting Document...
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Submit Copyright Form
                            </div>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

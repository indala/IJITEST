'use client'

import { useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { FileUp, FileCheck, Loader2, Download, RefreshCw, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { uploadManuscriptPdf, autoSyncManuscriptToPdf } from "@/actions/submissions";
import type { ActionResponse } from "@/db/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { submissionKeys } from "@/features/submissions";

export default function AdminPdfUpload({ submissionId, currentUrl }: { submissionId: number, currentUrl?: string | null }) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [showUpload, setShowUpload] = useState(!currentUrl);

    const [, uploadAction, isUploading] = useActionState<ActionResponse, FormData>(
        async (_prev, formData) => {
            const toastId = toast.loading('Uploading manuscript PDF proof...');
            const result = await uploadManuscriptPdf(submissionId, formData);
            if (result.success) {
                toast.success('Manuscript PDF updated successfully', { id: toastId });
                setShowUpload(false);
                queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                router.refresh();
            } else {
                toast.error(result.error, { id: toastId });
            }
            return result;
        },
        { success: false, error: "" }
    );

    const [, convertAction, isConverting] = useActionState<ActionResponse, FormData>(
        async (_prev, _formData) => {
            const toastId = toast.loading('Converting author DOCX to PDF proof...');
            const result = await autoSyncManuscriptToPdf(submissionId);
            if (result.success) {
                toast.success('PDF proof converted and synced successfully', { id: toastId });
                setShowUpload(false);
                queryClient.invalidateQueries({ queryKey: submissionKeys.all });
                router.refresh();
            } else {
                toast.error(result.error, { id: toastId });
            }
            return result;
        },
        { success: false, error: "" }
    );

    if (!showUpload && currentUrl) {
        return (
            <div className="space-y-3">
                <Button
                    asChild
                    variant="outline"
                    className="w-full h-11 gap-2.5 border-emerald-500/20 bg-emerald-500/5 text-emerald-700 font-semibold rounded-xl hover:bg-emerald-600 hover:text-white transition-all cursor-pointer shadow-xs"
                >
                    <a href={currentUrl} download className="flex items-center justify-center w-full">
                        <Download className="w-4 h-4" />
                        <span>Download Current PDF</span>
                    </a>
                </Button>

                <div className="grid grid-cols-2 gap-2">
                    <form action={convertAction} className="w-full">
                        <Button
                            type="submit"
                            disabled={isConverting || isUploading}
                            variant="outline"
                            className="w-full h-9 gap-1.5 text-xs text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-all cursor-pointer border border-border/60"
                        >
                            {isConverting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-primary" />}
                            <span>Re-convert DOCX</span>
                        </Button>
                    </form>

                    <Button
                        onClick={() => setShowUpload(true)}
                        variant="outline"
                        className="w-full h-9 gap-1.5 text-xs text-foreground font-semibold rounded-lg hover:bg-muted/80 transition-all cursor-pointer border border-border/60"
                    >
                        <FileUp className="w-3.5 h-3.5 text-primary" />
                        <span>Upload New PDF</span>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form action={uploadAction} className="space-y-4">
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Upload or Generate Galley</label>
                    {currentUrl && (
                        <button
                            type="button"
                            onClick={() => setShowUpload(false)}
                            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                            <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={() => convertAction(new FormData())}
                    disabled={isConverting || isUploading}
                    variant="outline"
                    className="w-full h-12 gap-3 border-primary/20 bg-primary/5 text-primary font-semibold rounded-xl hover:bg-primary hover:text-white transition-all shadow-xs cursor-pointer group"
                >
                    {isConverting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 group-hover:scale-110 transition-transform" />}
                    <span>Convert from Author&apos;s DOCX</span>
                </Button>

                <div className="relative py-1">
                    <Separator className="bg-border/50" />
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-wider">or upload file</span>
                </div>

                <div className={`relative group border-2 border-dashed rounded-xl p-6 transition-all duration-300 flex flex-col items-center justify-center gap-2.5 ${isUploading ? 'bg-primary/5 border-primary/20 cursor-wait' : 'bg-muted/30 border-primary/10 hover:bg-primary/5 hover:border-primary/30 cursor-pointer'} `}>
                    <input
                        title="pdfFile"
                        name="pdfFile"
                        type="file"
                        accept=".pdf"
                        required
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 disabled:cursor-wait"
                        disabled={isUploading || isConverting}
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-2 animate-pulse py-2">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-xs font-semibold text-primary">Uploading & Syncing PDF...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                <FileUp className="w-5 h-5 text-primary" />
                            </div>
                            <div className="text-center space-y-0.5">
                                <p className="text-xs font-bold text-foreground">Click or drag formatted PDF proof</p>
                                <p className="text-[11px] text-muted-foreground">Only .pdf format accepted</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            <Button
                type="submit"
                disabled={isUploading || isConverting}
                className="w-full h-10 gap-2 bg-primary text-white font-semibold rounded-xl transition-all shadow-md shadow-primary/20 hover:opacity-90 cursor-pointer"
            >
                {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <FileCheck className="w-4 h-4" />
                )}
                <span>Save Formatted PDF</span>
            </Button>
        </form>
    );
}

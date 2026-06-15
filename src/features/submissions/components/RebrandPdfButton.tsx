"use client";

import { RefreshCw, Loader2, CheckCircle2 } from "lucide-react";
import { rebrandPaperPdf } from "@/actions/publications";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface RebrandPdfButtonProps {
    submissionId: number;
}

export default function RebrandPdfButton({ submissionId }: RebrandPdfButtonProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleRebrand = () => {
        startTransition(async () => {
            try {
                const res = await rebrandPaperPdf(submissionId);
                if (res.success) {
                    toast.success("PDF re-branded successfully with latest settings!", {
                        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
                    });
                    setOpen(false);
                } else {
                    toast.error(res.error || "Failed to re-brand publication PDF.");
                }
            } catch (error) {
                console.error("Rebrand click error:", error);
                toast.error("An error occurred during re-branding.");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    disabled={isPending}
                    className="w-full h-10 gap-2 bg-white/5  text-white font-semibold text-[10px] tracking-widest border border-white/10 rounded-xl cursor-pointer disabled:opacity-50"
                >
                    {isPending ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <RefreshCw className="w-3.5 h-3.5" />
                    )}
                    Re-brand publication PDF
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-[2.5rem] p-8 bg-white border-primary/5 shadow-2xl">
                <AlertDialogHeader className="space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner mb-2">
                        <RefreshCw className="w-8 h-8 text-primary" />
                    </div>
                    <AlertDialogTitle className="text-2xl font-black text-primary tracking-widerer">Re-brand Publication PDF</AlertDialogTitle>
                    <AlertDialogDescription className="text-xs font-medium text-primary/40 leading-relaxed tracking-widest">
                        {"This action will regenerate the header and footer branding for this published paper's PDF using the latest journal metadata (ISSN, Website URL, and Journal Name) currently in your system settings. The page numbering and volume assignments will remain intact."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="pt-6 gap-4">
                    <AlertDialogCancel className="h-14 px-8 rounded-2xl font-black text-[10px] tracking-widest border-primary/10 text-primary/40 hover:bg-primary/5 cursor-pointer">
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleRebrand}
                        disabled={isPending}
                        className="h-14 px-8 rounded-2xl bg-primary text-white font-black text-[10px] tracking-widest hover:bg-primary/90 shadow-xl shadow-primary/20 cursor-pointer flex items-center gap-2"
                    >
                        {isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        Confirm Re-brand
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

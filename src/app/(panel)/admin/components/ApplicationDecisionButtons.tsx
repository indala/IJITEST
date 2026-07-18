"use client";

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { approveApplication, rejectApplication } from "@/actions/applications";
import { type ActionResponse } from "@/db/types";
import { CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
    id: number;
}

export default function ApplicationDecisionButtons({ id }: Props) {
    const [reason, setReason] = useState("");
    const [showReasonInput, setShowReasonInput] = useState(false);

    const [, approveAction] = useActionState<ActionResponse, FormData>(
        async (_prev, _formData) => {
            const toastId = toast.loading("Approving application...");
            const result = await approveApplication(id);
            if (result.success) {
                toast.success("Application Approved", {
                    id: toastId,
                    description: "User has been invited via email.",
                });
            } else {
                toast.error("Error", {
                    id: toastId,
                    description: result.error,
                });
            }
            return result;
        },
        { success: false, error: "" }
    );

    const [, rejectAction, isRejecting] = useActionState<ActionResponse, FormData>(
        async (_prev, _formData) => {
            if (reason.trim().length < 20) {
                toast.error("Reason Required", {
                    description: "Please provide a rejection reason (min 20 chars).",
                });
                return { success: false, error: "Reason too short" };
            }

            const toastId = toast.loading("Rejecting application...");
            const result = await rejectApplication(id, reason);
            if (result.success) {
                setShowReasonInput(false);
                setReason("");
                toast.info("Application Rejected", {
                    id: toastId,
                    description: "Rejection email has been sent.",
                });
            } else {
                toast.error("Error", {
                    id: toastId,
                    description: result.error,
                });
            }
            return result;
        },
        { success: false, error: "" }
    );

    const loading = isRejecting;

    function handleRejectClick() {
        if (!showReasonInput) {
            setShowReasonInput(true);
            return;
        }
        rejectAction(new FormData());
    }

    return (
        <div className="flex flex-col gap-2">
            {showReasonInput && (
                <div className="space-y-2 mb-2 animate-in fade-in slide-in-from-top-1 duration-200">
                    <textarea
                        className="w-full h-20 p-2 text-[10px] bg-muted border border-primary/10 rounded-md focus:ring-1 focus:ring-primary/20 outline-none resize-none font-medium text-foreground placeholder:text-muted-foreground/50"
                        placeholder="Rejection Reason (min 20 characters)..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                         <Button
                            onClick={() => { setShowReasonInput(false); setReason(""); }}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[8px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
                         >
                            Cancel
                         </Button>
                    </div>
                </div>
            )}
            <div className="flex gap-2">
                <Button
                    onClick={handleRejectClick}
                    disabled={loading}
                    size="sm"
                    variant="outline"
                    className={`h-7 flex-1 rounded-md text-[9px] font-black uppercase tracking-widest border-rose-100 transition-all ${showReasonInput ? 'bg-rose-600 text-white hover:bg-rose-700' : 'text-rose-600 hover:bg-rose-50'}`}
                >
                    {isRejecting ? (
                        <div className="w-3 h-3 border-2 border-rose-600/20 border-t-rose-600 rounded-full animate-spin" />
                    ) : (
                        <>{showReasonInput ? 'Confirm Rejection' : 'Reject'} <XCircle className="w-3 h-3 ml-1" /></>
                    )}
                </Button>
                {!showReasonInput && (
                    <form action={approveAction}>
                        <ApproveButton />
                    </form>
                )}
            </div>
        </div>
    );
}

function ApproveButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            size="sm"
            className="h-7 flex-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500 hover:bg-emerald-600 text-white"
        >
            {pending ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
                <>Approve <CheckCircle2 className="w-3 h-3 ml-1" /></>
            )}
        </Button>
    );
}

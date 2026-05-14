"use client";

import { useActionState, useEffect } from "react";
import { decideSubmission } from "@/actions/submissions";
import { waivePayment } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestResubmissionModal } from "@/components/panels/RequestResubmissionModal";

import { ActionResponse } from "@/db/types";

interface SubmissionDecisionActionsProps {
    submissionId: number;
    paperId: string;
    paperTitle: string;
    status: string;
}

export function SubmissionDecisionActions({ 
    submissionId, 
    paperId, 
    paperTitle, 
    status 
}: SubmissionDecisionActionsProps) {
    
    // 1. Decision Action (Accept/Reject)
    const [decideState, decideAction, isDeciding] = useActionState(
        async (_prev: ActionResponse | null, formData: FormData) => {
            const decision = formData.get("decision") as "accepted" | "rejected";
            return await decideSubmission(submissionId, decision);
        },
        { success: false, error: "" }
    );

    // 2. Waive Action
    const [waiveState, waiveAction, isWaiving] = useActionState(
        async () => {
            return await waivePayment(submissionId);
        },
        { success: false, error: "" }
    );

    useEffect(() => {
        if (decideState.success && !isDeciding) {
            toast.success(decideState.message || "Decision finalized successfully");
        } else if (!decideState.success && decideState.error) {
            toast.error(decideState.error);
        }
    }, [decideState, isDeciding]);

    useEffect(() => {
        if (waiveState.success && !isWaiving) {
            toast.success("Payment waived successfully");
        } else if (!waiveState.success && waiveState.error) {
            toast.error(waiveState.error);
        }
    }, [waiveState, isWaiving]);

    if (status === 'underReview') {
        return (
            <div className="grid grid-cols-1 gap-2 2xl:gap-4">
                <form action={decideAction}>
                    <input type="hidden" name="decision" value="accepted" />
                    <Button 
                        type="submit"
                        disabled={isDeciding}
                        className="w-full h-11 2xl:h-16 gap-2 2xl:gap-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] 2xl:text-lg tracking-widest rounded-xl shadow-xl shadow-emerald-600/20 cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4 2xl:w-6 2xl:h-6" /> 
                        {isDeciding ? "Authorizing..." : "Authorize Acceptance"}
                    </Button>
                </form>
                
                <form action={decideAction}>
                    <input type="hidden" name="decision" value="rejected" />
                    <Button 
                        type="submit"
                        disabled={isDeciding}
                        variant="outline" 
                        className="w-full h-11 2xl:h-16 gap-2 2xl:gap-4 border-red-500/20 text-red-600 font-semibold text-[11px] 2xl:text-lg tracking-widest rounded-xl cursor-pointer"
                    >
                        <XCircle className="w-4 h-4 2xl:w-6 2xl:h-6" /> 
                        {isDeciding ? "Processing..." : "Final Rejection"}
                    </Button>
                </form>

                <RequestResubmissionModal
                    submissionId={submissionId}
                    paperId={paperId}
                    paperTitle={paperTitle}
                />
            </div>
        );
    }

    if (status === 'accepted') {
        return (
            <form action={waiveAction}>
                <Button 
                    type="submit"
                    disabled={isWaiving}
                    variant="outline" 
                    className="w-full h-9 gap-2 border-emerald-500/30 text-emerald-600 font-semibold text-[9px]  tracking-widest rounded-lg hover:bg-emerald-500 hover:text-white cursor-pointer"
                >
                    {isWaiving ? "Waiving..." : "Waive Transaction Fee"}
                </Button>
            </form>
        );
    }

    return null;
}

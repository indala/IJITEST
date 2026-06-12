"use client";

import { useActionState } from "react";
import { decideSubmission } from "@/actions/submissions";
import { waivePayment } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestResubmissionModal } from "@/components/panels/RequestResubmissionModal";

import type { ActionResponse } from "@/db/types";

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
    const [, decideAction, isDeciding] = useActionState(
        async (_prev: ActionResponse | null, formData: FormData) => {
            const decision = formData.get("decision") as "accepted" | "rejected";
            const result = await decideSubmission(submissionId, decision);
            if (result.success) {
                toast.success(result.message || "Decision finalized successfully");
            } else {
                toast.error(result.error);
            }
            return result;
        },
        { success: false, error: "" }
    );

    // 2. Waive Action
    const [, waiveAction, isWaiving] = useActionState(
        async () => {
            const result = await waivePayment(submissionId);
            if (result.success) {
                toast.success("Payment waived successfully");
            } else {
                toast.error(result.error);
            }
            return result;
        },
        { success: false, error: "" }
    );

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
                        className="w-full h-11 2xl:h-16 gap-2 2xl:gap-4 border-red-500/20 text-red-600 font-semibold text-[11px] 2xl:text-lg tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-700 hover:border-red-500/30 cursor-pointer"
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

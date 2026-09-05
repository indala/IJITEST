"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { decideSubmission } from "@/actions/submissions";
import { waivePayment } from "@/actions/payments";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { RequestResubmissionModal } from "@/components/panels/RequestResubmissionModal";

import type { ActionResponse, Submission, Version, SubmissionStatus, FinalDecision } from "@/db/types";

interface SubmissionDecisionActionsProps {
    submissionId: Submission['id'];
    paperId: Submission['paperId'];
    paperTitle: Version['title'];
    status: SubmissionStatus;
}

export function SubmissionDecisionActions({
    submissionId,
    paperId,
    paperTitle,
    status
}: SubmissionDecisionActionsProps) {

    // 1. Decision Action (Accept/Reject)
    const [, decideAction] = useActionState(
        async (_prev: ActionResponse | null, formData: FormData) => {
            const decision = formData.get("decision") as Extract<FinalDecision, "accepted" | "rejected">;
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
    const [, waiveAction] = useActionState(
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
                    <AcceptButton />
                </form>

                <form action={decideAction}>
                    <input type="hidden" name="decision" value="rejected" />
                    <RejectButton />
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
                <WaiveButton />
            </form>
        );
    }

    return null;
}

function AcceptButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            className="w-full h-11 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
        >
            <CheckCircle className="w-4 h-4" />
            {pending ? "Authorizing..." : "Authorize Acceptance"}
        </Button>
    );
}

function RejectButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            variant="outline"
            className="w-full h-11 gap-2 border-red-500/20 text-red-600 font-semibold text-xs uppercase tracking-wider rounded-lg hover:bg-red-500/10 hover:text-red-700 hover:border-red-500/30 cursor-pointer"
        >
            <XCircle className="w-4 h-4" />
            {pending ? "Processing..." : "Final Rejection"}
        </Button>
    );
}

function WaiveButton() {
    const { pending } = useFormStatus();
    return (
        <Button
            type="submit"
            disabled={pending}
            variant="outline"
            className="w-full h-9 gap-2 border-emerald-500/30 text-emerald-600 font-semibold text-[9px] tracking-widest rounded-lg hover:bg-emerald-500 hover:text-white cursor-pointer"
        >
            {pending ? "Waiving..." : "Waive Transaction Fee"}
        </Button>
    );
}

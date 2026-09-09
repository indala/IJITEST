"use client";

import { useState, useTransition, useEffect, use, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Clock, Shield, Loader2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { respondToReviewInvitation } from "@/actions/reviews";
import Link from "next/link";

interface InvitationPageProps {
    params: Promise<{ token: string }>;
}

function ReviewInvitationContent({ params }: InvitationPageProps) {
    const { token } = use(params);
    const searchParams = useSearchParams();
    const preselectedAction = searchParams.get("action") as "accept" | "decline" | null;

    const [isPending, startTransition] = useTransition();
    const [status, setStatus] = useState<"idle" | "success_accepted" | "success_declined" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [declineReason, setDeclineReason] = useState<string>("");
    const [showDeclineForm, setShowDeclineForm] = useState(preselectedAction === "decline");
    const [paperInfo, setPaperInfo] = useState<{ paperId: string; title: string; deadline: string | null } | null>(null);

    const handleAction = (action: "accept" | "decline") => {
        startTransition(async () => {
            const res = await respondToReviewInvitation(token, action, action === "decline" ? declineReason : undefined);
            if (res.success && res.data) {
                setPaperInfo(res.data);
                setStatus(action === "accept" ? "success_accepted" : "success_declined");
            } else {
                setStatus("error");
                setErrorMessage(res.error || "Failed to process review invitation response.");
            }
        });
    };

    // If preselected as accept, auto-trigger
    useEffect(() => {
        if (preselectedAction === "accept" && status === "idle") {
            handleAction("accept");
        }
    }, [preselectedAction]);

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6">
            <Card className="w-full max-w-lg border-border/70 shadow-2xl rounded-2xl overflow-hidden bg-card">
                <CardHeader className="p-6 sm:p-8 bg-muted/20 border-b border-border/60 text-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                        <Shield className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground tracking-tight">
                        Peer Review Invitation
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                        International Journal of Innovative Trends in Engineering Science and Technology
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-6 sm:p-8 space-y-6">
                    {status === "idle" && (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                You have been formally invited by the editorial board to evaluate a submitted research manuscript.
                                Please confirm your availability below.
                            </p>

                            {!showDeclineForm ? (
                                <div className="space-y-3 pt-2">
                                    <Button
                                        onClick={() => handleAction("accept")}
                                        disabled={isPending}
                                        className="w-full h-12 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl cursor-pointer shadow-md"
                                    >
                                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        Accept Review Assignment
                                    </Button>

                                    <Button
                                        variant="outline"
                                        onClick={() => setShowDeclineForm(true)}
                                        disabled={isPending}
                                        className="w-full h-12 gap-2 border-border/70 text-rose-600 hover:bg-rose-500/10 font-semibold text-sm rounded-xl cursor-pointer"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Decline Invitation
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4 pt-2 border-t border-border/60">
                                    <label className="text-xs font-semibold text-muted-foreground">
                                        Reason for Declining (Optional)
                                    </label>
                                    <Textarea
                                        value={declineReason}
                                        onChange={(e) => setDeclineReason(e.target.value)}
                                        placeholder="e.g. Schedule conflicts, conflict of interest, or outside area of expertise..."
                                        rows={3}
                                        className="text-sm rounded-xl resize-none"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowDeclineForm(false)}
                                            disabled={isPending}
                                            className="flex-1 h-11 rounded-xl text-xs font-semibold cursor-pointer"
                                        >
                                            Back
                                        </Button>
                                        <Button
                                            onClick={() => handleAction("decline")}
                                            disabled={isPending}
                                            className="flex-1 h-11 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                                        >
                                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                                            Confirm Decline
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {status === "success_accepted" && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
                                <CheckCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Invitation Accepted!</h3>
                                <p className="text-xs text-muted-foreground">
                                    Thank you for agreeing to review manuscript <span className="font-semibold text-foreground">{paperInfo?.paperId}</span>.
                                </p>
                            </div>
                            {paperInfo?.deadline && (
                                <div className="bg-muted/30 p-3 rounded-xl border border-border/60 inline-flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="w-4 h-4 text-amber-600" />
                                    <span>Evaluation due by: <strong className="text-foreground">{new Date(paperInfo.deadline).toLocaleDateString()}</strong></span>
                                </div>
                            )}
                            <div className="pt-4">
                                <Button asChild className="w-full h-11 rounded-xl font-semibold text-xs btn-primary">
                                    <Link href="/reviewer/reviews">
                                        Open Reviewer Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === "success_declined" && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border/70 text-muted-foreground flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-foreground">Invitation Declined</h3>
                                <p className="text-xs text-muted-foreground">
                                    We have notified the editorial office. Thank you for your response.
                                </p>
                            </div>
                            <div className="pt-4">
                                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-semibold text-xs">
                                    <Link href="/">
                                        Return to Journal Home
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 flex items-center justify-center mx-auto">
                                <XCircle className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-rose-600">Action Could Not Be Completed</h3>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    {errorMessage || "The invitation token is invalid or has already been used."}
                                </p>
                            </div>
                            <div className="pt-4">
                                <Button asChild variant="outline" className="w-full h-11 rounded-xl font-semibold text-xs">
                                    <Link href="/">
                                        Return to Home
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function ReviewInvitationPage(props: InvitationPageProps) {
    return (
        <Suspense fallback={
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
        }>
            <ReviewInvitationContent {...props} />
        </Suspense>
    );
}

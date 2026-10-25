"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, ExternalLink, CheckCircle2, ShieldCheck } from "lucide-react";
import { submitPayPalPaymentReference } from "@/actions/paypal-actions";
import { toast } from "sonner";

interface PayPalPaymentProps {
    submissionId: number;
    paperId: string;
    usdAmount?: string;
    onSuccess?: () => void;
}

export default function PayPalPayment({ 
    submissionId, 
    paperId, 
    usdAmount = "50.00", 
    onSuccess 
}: PayPalPaymentProps) {
    const [txId, setTxId] = useState("");
    const [payerEmail, setPayerEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [step, setStep] = useState<"checkout" | "confirm">("checkout");

    const paypalAccount = "razh1977@gmail.com";
    const paypalDirectUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=${encodeURIComponent(paypalAccount)}&item_name=${encodeURIComponent(`IJITEST Article Processing Charge - ${paperId}`)}&amount=${encodeURIComponent(usdAmount)}&currency_code=USD`;

    const handleConfirm = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!txId.trim() || txId.trim().length < 5) {
            toast.error("Invalid Transaction ID", {
                description: "Please enter your 10+ character PayPal Transaction ID."
            });
            return;
        }

        setSubmitting(true);
        try {
            const res = await submitPayPalPaymentReference({
                submissionId,
                paperId,
                paypalTransactionId: txId.trim(),
                amount: usdAmount,
                currency: "USD",
                payerEmail: payerEmail.trim() || undefined
            });

            if (res.success) {
                toast.success("PayPal Payment Verified", {
                    description: `Registered invoice ${res.invoiceNumber}. Your manuscript is cleared for publishing.`
                });
                if (onSuccess) onSuccess();
            } else {
                toast.error("Verification Failed", {
                    description: res.error
                });
            }
        } catch (err) {
            toast.error("Submission Error", {
                description: err instanceof Error ? err.message : "Failed to record transaction."
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 text-left">
            {/* Account Details Box */}
            <div className="p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-xl space-y-2 text-body-sm">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <ShieldCheck className="size-4 text-blue-700" />
                        Official PayPal Account
                    </span>
                    <span className="font-mono text-badge font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">
                        USD ${usdAmount}
                    </span>
                </div>
                <div className="space-y-1 text-caption text-blue-950">
                    <div className="flex justify-between items-center py-0.5 border-b border-blue-100">
                        <span className="text-blue-700">Recipient ID:</span>
                        <strong className="font-mono select-all text-blue-900">{paypalAccount}</strong>
                    </div>
                    <div className="flex justify-between items-center py-0.5 border-b border-blue-100">
                        <span className="text-blue-700">Beneficiary:</span>
                        <span className="font-medium">Dr. Ravibabu T. / Felix Academic</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                        <span className="text-blue-700">Item Reference:</span>
                        <span className="font-mono font-medium">{paperId}</span>
                    </div>
                </div>
            </div>

            {step === "checkout" ? (
                <div className="space-y-3">
                    <Button 
                        asChild 
                        className="w-full h-11 bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
                    >
                        <a 
                            href={paypalDirectUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={() => setStep("confirm")}
                        >
                            <span>Pay $50.00 via PayPal Portal</span>
                            <ExternalLink className="size-4" />
                        </a>
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setStep("confirm")}
                            className="text-meta text-primary font-semibold hover:underline cursor-pointer"
                        >
                            Already transferred? Enter your PayPal Transaction ID &rarr;
                        </button>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleConfirm} className="space-y-3 bg-muted/20 p-3.5 rounded-xl border border-border/70">
                    <div className="space-y-1">
                        <label className="text-meta font-bold text-foreground block">
                            PayPal Transaction ID / Order ID *
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g. 9AB12345CD67890EF"
                            value={txId}
                            onChange={(e) => setTxId(e.target.value)}
                            required
                            className="font-mono text-body-sm h-9 bg-background"
                        />
                        <p className="text-caption text-muted-foreground m-0">
                            Found in your PayPal payment confirmation email or receipt.
                        </p>
                    </div>

                    <div className="space-y-1">
                        <label className="text-meta font-medium text-foreground block">
                            Your PayPal Account Email (Optional)
                        </label>
                        <Input
                            type="email"
                            placeholder="your.email@domain.com"
                            value={payerEmail}
                            onChange={(e) => setPayerEmail(e.target.value)}
                            className="text-body-sm h-9 bg-background"
                        />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                        <Button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 h-9 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-meta rounded-lg"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="size-3.5 mr-1.5" />
                                    Confirm & Verify Settlement
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setStep("checkout")}
                            className="h-9 text-meta"
                        >
                            Back
                        </Button>
                    </div>
                </form>
            )}

            <div className="text-center text-caption text-muted-foreground pt-1">
                Payments verified directly against Dr. Ravi Babu&apos;s PayPal account (<code className="text-primary font-semibold">razh1977@gmail.com</code>).
            </div>
        </div>
    );
}

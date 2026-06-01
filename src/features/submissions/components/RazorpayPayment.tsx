"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/actions/razorpay-actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface RazorpayPaymentProps {
    submissionId: number;
    paperId: string;
    onSuccess?: () => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayErrorResponse {
    error: {
        code: string;
        description: string;
        source: string;
        step: string;
        reason: string;
        metadata: {
            order_id: string;
            payment_id: string;
        };
    };
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    theme?: {
        color?: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => {
            on: (event: string, callback: (response: RazorpayErrorResponse) => void) => void;
            open: () => void;
        };
    }
}

export default function RazorpayPayment({ submissionId, paperId, onSuccess }: RazorpayPaymentProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setLoading(true);
        try {
            const result = await createRazorpayOrder(submissionId, paperId);

            if (!result.success) {
                toast.error("Order Creation Failed", {
                    description: result.error
                });
                setLoading(false);
                return;
            }

            const { order } = result;

            const options: RazorpayOptions = {
                key: order.key || "",
                amount: order.amount,
                currency: order.currency,
                name: "IJITEST APC Payment",
                description: `Payment for Manuscript ID: ${paperId}`,
                order_id: order.id,
                handler: async function (response: RazorpayResponse) {
                    setLoading(true);
                    const verifyData = {
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                        submissionId: submissionId,
                    };

                    const verification = await verifyRazorpayPayment(verifyData);

                    if (verification.success) {
                        toast.success("Payment Verified", {
                            description: "Your paper status has been updated successfully."
                        });
                        if (onSuccess) {
                            onSuccess();
                        }
                        router.refresh();
                    } else {
                        toast.error("Verification Refused", {
                            description: verification.error
                        });
                    }
                    setLoading(false);
                },
                prefill: {
                    name: "", // Can be passed from props if available
                    email: "",
                },
                theme: {
                    color: "#6d0202",
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: RazorpayErrorResponse) {
                toast.error("Payment Interrupted", {
                    description: response.error.description
                });
                setLoading(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment Error:", error);
            toast.error("System Malfunction", {
                description: "An unexpected error occurred while initiating protocol."
            });
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs  tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
            {loading ? (
                <>Processing <Loader2 className="w-5 h-5 animate-spin" /></>
            ) : (
                <>
                    <CreditCard className="w-5 h-5" />
                    Complete APC Payment (INR)
                </>
            )}
        </Button>
    );
}

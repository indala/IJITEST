"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/actions/razorpay-actions";
import { useRouter } from "next/navigation";

interface RazorpayPaymentProps {
    submissionId: number;
    paperId: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}

export default function RazorpayPayment({ submissionId, paperId }: RazorpayPaymentProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handlePayment = async () => {
        setLoading(true);
        try {
            const result = await createRazorpayOrder(submissionId, paperId);

            if (!result.success) {
                alert(result.error);
                setLoading(false);
                return;
            }

            const { order } = result;

            const options = {
                key: order.key,
                amount: order.amount,
                currency: order.currency,
                name: "IJITEST APC Payment",
                description: `Payment for Manuscript ID: ${paperId}`,
                order_id: order.id,
                handler: async function (response: any) {
                    setLoading(true);
                    const verifyData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        submissionId: submissionId,
                    };

                    const verification = await verifyRazorpayPayment(verifyData);

                    if (verification.success) {
                        alert("Payment Successful! Your paper status has been updated.");
                        router.refresh();
                    } else {
                        alert("Payment verification failed: " + verification.error);
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
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment Failed: " + response.error.description);
                setLoading(false);
            });
            rzp.open();
        } catch (error) {
            console.error("Payment Error:", error);
            alert("An error occurred while initiating payment.");
            setLoading(false);
        }
    };

    return (
        <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
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

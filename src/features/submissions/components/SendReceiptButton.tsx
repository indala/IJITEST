"use client";

import { Loader2, Mail } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { sendReceiptEmail } from "@/actions/payments";

interface SendReceiptButtonProps {
    paymentId: number;
    className?: string;
    children?: React.ReactNode;
}

export default function SendReceiptButton({ paymentId, className, children }: SendReceiptButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleClick = () => {
        startTransition(async () => {
            const res = await sendReceiptEmail(paymentId);
            if (res.success) {
                toast.success(res.message ?? "Receipt emailed successfully");
            } else {
                toast.error(res.error ?? "Failed to send receipt");
            }
        });
    };

    return (
        <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleClick}
            className={className}
            aria-label="Email Tax Invoice & Receipt"
        >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                children ?? (
                    <>
                        <Mail className="w-4 h-4" />
                        Email Receipt
                    </>
                )
            )}
        </Button>
    );
}

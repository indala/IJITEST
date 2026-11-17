'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Loader2, ArrowRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { verifyPaymentAccess } from '@/actions/payments';

export default function PayApcWidget() {
    const router = useRouter();
    const [paperId, setPaperId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePay = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanId = paperId.trim();
        const cleanEmail = email.trim();

        if (!cleanId || !cleanEmail) {
            setError("Both Paper ID and Email are required.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await verifyPaymentAccess(cleanId, cleanEmail);
            if (res.success && res.data) {
                router.push(`/payment/${res.data.paperId}?token=${res.data.token}&email=${encodeURIComponent(cleanEmail)}`);
            } else {
                setError(!res.success ? res.error : "Paper ID or email does not match.");
                setLoading(false);
            }
        } catch {
            setError("Verification failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <CreditCard className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </div>
                    <div>
                        <h3 className="card-title-brand m-0">Pay APC Online</h3>
                        <p className="text-caption text-muted-foreground m-0">UPI • Cards • PayPal</p>
                    </div>
                </div>
                <span className="text-caption font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Instant
                </span>
            </div>

            <form onSubmit={handlePay} className="space-y-2.5">
                <div className="space-y-1">
                    <Input
                        type="text"
                        placeholder="Manuscript ID (e.g. IJITEST-...)"
                        value={paperId}
                        onChange={(e) => {
                            setPaperId(e.target.value);
                            setError(null);
                        }}
                        className="input-standard w-full h-9 text-body-sm"
                        required
                    />
                </div>
                <div className="space-y-1">
                    <Input
                        type="email"
                        placeholder="Correspondent Email ID"
                        value={email}
                        onChange={(e) => {
                            setEmail(e.target.value);
                            setError(null);
                        }}
                        className="input-standard w-full h-9 text-body-sm"
                        required
                    />
                </div>

                {error && (
                    <p className="text-caption text-destructive font-semibold m-0">{error}</p>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-9 bg-primary hover:bg-primary/90 text-white font-bold text-label rounded-lg shadow-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider transition-all"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Verifying...</span>
                        </>
                    ) : (
                        <>
                            <span>Pay Publication Fee</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </>
                    )}
                </Button>
            </form>

            <div className="pt-1 flex items-center justify-between text-caption text-muted-foreground border-t border-border/40">
                <Link href="/payment" className="text-primary hover:underline font-medium">
                    Payment Portal &rarr;
                </Link>
                <Link href="/apc-fees" className="hover:underline">
                    Fee Structure
                </Link>
            </div>
        </div>
    );
}

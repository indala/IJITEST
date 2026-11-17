'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, ShieldCheck, Loader2, AlertCircle, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';
import { verifyPaymentAccess } from '@/actions/payments';

export default function PaymentLookupClient() {
    const router = useRouter();
    const [paperId, setPaperId] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanId = paperId.trim();
        const cleanEmail = email.trim();

        if (!cleanId) {
            setError("Please enter your Manuscript / Paper ID.");
            return;
        }
        if (!cleanEmail) {
            setError("Please enter your registered corresponding author email.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const res = await verifyPaymentAccess(cleanId, cleanEmail);
            if (res.success && res.data) {
                router.push(`/payment/${res.data.paperId}?token=${res.data.token}&email=${encodeURIComponent(cleanEmail)}`);
            } else {
                setError(!res.success ? res.error : "No matching manuscript found for this ID and registered email.");
                setLoading(false);
            }
        } catch {
            setError("Failed to verify credentials. Please check your connection and try again.");
            setLoading(false);
        }
    };

    return (
        <div className="container-responsive py-8 sm:py-16">
            <div className="max-w-3xl mx-auto space-y-8">

                {/* Main Card */}
                <Card className="p-6 sm:p-10 border border-border/70 rounded-2xl shadow-sm bg-card">
                    <div className="space-y-3 pb-6 border-b border-border/50 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <Badge className="bg-primary/5 text-primary border-primary/20 px-3 py-1 font-semibold text-meta">
                                Official Journal Settlement Portal
                            </Badge>
                            <span className="text-meta text-muted-foreground flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-secondary" />
                                256-Bit SSL Secured
                            </span>
                        </div>
                        <h2 className="text-foreground m-0 font-bold">
                            Online APC & Publication Grant Payment
                        </h2>
                        <p className="text-body-sm text-muted-foreground m-0 leading-relaxed">
                            Authors with accepted manuscripts can settle their Article Processing Charge (APC) securely. Disclose your Manuscript ID and registered corresponding email to access your official invoice.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="pt-6 space-y-5">
                        {error && (
                            <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-start gap-3 text-destructive">
                                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="space-y-1 text-body-sm">
                                    <p className="font-semibold m-0">Verification Failed</p>
                                    <p className="text-meta opacity-90 m-0">{error}</p>
                                </div>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="paperId" className="block text-label text-foreground font-semibold">
                                Manuscript ID / Paper ID <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="paperId"
                                type="text"
                                placeholder="e.g. IJITEST-2026-029"
                                value={paperId}
                                onChange={(e) => {
                                    setPaperId(e.target.value);
                                    setError(null);
                                }}
                                required
                                className="h-11 text-body-sm"
                            />
                            <p className="text-caption text-muted-foreground m-0">
                                As specified in your editorial decision or acceptance email.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-label text-foreground font-semibold">
                                Registered Correspondent Email <span className="text-destructive">*</span>
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="e.g. correspondent@university.edu"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setError(null);
                                }}
                                required
                                className="h-11 text-body-sm"
                            />
                            <p className="text-caption text-muted-foreground m-0">
                                The primary email used during paper submission.
                            </p>
                        </div>

                        <div className="pt-3">
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-bold text-label rounded-lg shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Verifying Credentials...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Verify & Access Invoice</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </Card>

                {/* Information Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-5 bg-muted/20 border border-border/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                            <CreditCard className="w-4 h-4 text-secondary" />
                            <span>Payment Channels Supported</span>
                        </div>
                        <p className="text-meta text-muted-foreground m-0 leading-relaxed">
                            Instant settlement via Razorpay (UPI, Google Pay, PhonePe, Debit/Credit Cards, NetBanking for Indian authors) and PayPal (USD for international authors).
                        </p>
                    </div>

                    <div className="p-5 bg-muted/20 border border-border/50 rounded-xl space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-body-sm">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Instant Automated Receipt</span>
                        </div>
                        <p className="text-meta text-muted-foreground m-0 leading-relaxed">
                            Upon successful payment, official tax invoices with unique registration numbers are generated and queued for Crossref DOI indexing.
                        </p>
                    </div>
                </div>

                {/* Assistance Box */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center justify-between gap-4 text-meta text-muted-foreground">
                    <span className="flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Need fee waivers or assistance? Contact editorial support.
                    </span>
                    <Link href="/contact" className="text-primary font-semibold hover:underline shrink-0">
                        Contact Support &rarr;
                    </Link>
                </div>

            </div>
        </div>
    );
}

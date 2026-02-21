'use client'

import { CreditCard, ShieldCheck, Lock, ChevronLeft, Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trackManuscript } from '@/actions/track';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function PaymentClient({ id }: { id: string }) {
    const [loading, setLoading] = useState(true);
    const [manuscript, setManuscript] = useState<any>(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false);

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            try {
                const result = await trackManuscript(id, "");
                if (result.success || result.manuscript) {
                    setManuscript(result.manuscript);
                } else {
                    setError("Manuscript not found or invalid link.");
                }
            } catch (err) {
                setError("Failed to fetch manuscript details.");
            } finally {
                setLoading(false);
            }
        }
        fetchDetails();
    }, [id]);

    const handlePayment = async () => {
        setProcessing(true);
        setTimeout(() => {
            setProcessing(false);
            setPaid(true);
        }, 3000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/5 rounded-full animate-spin border-t-secondary" />
                    <Loader2 className="w-8 h-8 text-primary animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="font-black text-primary/40 uppercase tracking-[0.4em] text-[10px] animate-pulse">Authenticating Invoice Session</p>
            </div>
        </div>
    );

    if (error || (manuscript && manuscript.status !== 'accepted' && manuscript.status !== 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
            <Card className="max-w-xl w-full border-primary/5 rounded-[3.5rem] text-center p-12 sm:p-20 shadow-vip bg-white group">
                <CardContent className="space-y-10 p-0">
                    <div className="w-24 h-24 bg-destructive/5 rounded-[2.5rem] flex items-center justify-center mx-auto group-hover:bg-destructive group-hover:text-white transition-all duration-700">
                        <AlertCircle className="w-12 h-12 text-destructive group-hover:text-white" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-primary tracking-tighter">Invalid Credential</h2>
                        <p className="text-sm text-primary/40 font-medium leading-relaxed">This payment token is either expired or the manuscript is undergoing mandatory verification. Please contact the editorial desk.</p>
                    </div>
                    <Button asChild className="h-14 px-10 bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                        <Link href="/track">Return to Tracking Portal</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    if (paid || (manuscript && manuscript.status === 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-8">
            <Card className="max-w-xl w-full border-primary/5 rounded-[3.5rem] text-center p-12 sm:p-20 shadow-vip-hover bg-white group">
                <CardContent className="space-y-10 p-0">
                    <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform duration-700 animate-float-slow">
                        <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-primary tracking-tighter">Grant Confirmed</h2>
                        <p className="text-sm text-primary/40 font-medium leading-relaxed">Transaction finalized. Your research is now officially queued for global indexing and SJIF impact evaluation.</p>
                    </div>
                    <div className="space-y-4 pt-4">
                        <Button asChild className="h-14 w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-xl shadow-primary/20">
                            <Link href="/">Back to Dashboard</Link>
                        </Button>
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/20">Redirecting in 5 seconds...</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    return (
        <div className="min-h-screen bg-background py-10 sm:py-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Invoice Details */}
                    <div className="flex-1 space-y-10">
                        <div className="space-y-6">
                            <Button asChild variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-[0.3em] text-primary/40 hover:text-primary -ml-4 group">
                                <Link href="/track" className="flex items-center">
                                    <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Exit To Tracking
                                </Link>
                            </Button>
                            <div>
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-black text-primary tracking-tighter uppercase leading-none">Manuscript Grant</h1>
                                    <p className="text-[11px] text-primary/30 font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-4 font-serif">
                                        <span className="w-6 h-[2px] bg-secondary" /> Article Processing Fee (APC)
                                    </p>
                                </div>
                            </div>

                            <Card className="border-primary/5 shadow-vip rounded-[3rem] overflow-hidden bg-white group">
                                <CardHeader className="bg-primary/5 border-b border-primary/5 p-8 px-10 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                                    <div className="flex justify-between items-center relative z-10">
                                        <Badge variant="secondary" className="font-black text-[10px] uppercase tracking-[0.3em] bg-white text-primary px-4 h-6 rounded-full shadow-sm border border-primary/5">Invoice Details</Badge>
                                        <ShieldCheck className="w-6 h-6 text-primary/20" />
                                    </div>
                                </CardHeader>
                                <CardContent className="p-10 px-12 space-y-10">
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-primary leading-tight tracking-tight line-clamp-2">{manuscript.title}</h3>
                                        <p className="inline-flex items-center gap-2 px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg">ID: {manuscript.paper_id}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-8 py-8 border-y border-primary/5">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-primary/30 uppercase tracking-[0.3em]">Principal Investigator</p>
                                            <p className="text-base font-black text-primary">{manuscript.author_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px) font-black text-primary/30 uppercase tracking-[0.3em]">Currency</p>
                                            <p className="text-base font-black text-primary">INR (₹) - Indian Rupee</p>
                                        </div>
                                    </div>

                                    <div className="space-y-5 pt-4">
                                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em] text-primary/40">
                                            <span>Journal Processing Fee</span>
                                            <span className="text-primary/60">₹ 2,100.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.2em] text-primary/40">
                                            <span>SJIF & Metadata Indexing</span>
                                            <span className="text-primary/60">₹ 400.00</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-8 mt-4 border-t-2 border-dashed border-primary/10">
                                            <span className="text-base font-black text-primary uppercase tracking-[0.1em]">Grand Total Due</span>
                                            <span className="text-3xl font-black text-secondary tracking-tighter">₹ 2,500.00</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="bg-primary/5 border border-primary/5 p-8 rounded-[2.5rem] relative overflow-hidden group/policy">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover/policy:scale-150 transition-transform duration-1000 pointer-events-none" />
                                <div className="flex gap-6 relative z-10">
                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0 shadow-sm border border-primary/5">
                                        <Info className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-primary">Financial Policy</h4>
                                        <p className="text-[11px] text-primary/40 font-medium leading-relaxed pr-8">
                                            "Submission of payment constitutes final agreement for global dissemination. Once article is processed, transactions are non-refundable according to COPE guidelines."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Action */}
                        <div className="w-full lg:w-[380px] lg:sticky lg:top-32">
                            <Card className="border-primary/5 shadow-vip-hover rounded-[3rem] p-10 bg-white space-y-10 group/checkout">
                                <div className="text-center space-y-6">
                                    <div className="relative mx-auto w-24 h-24">
                                        <div className="absolute inset-0 bg-secondary rounded-[2.5rem] rotate-6 opacity-10 group-hover/checkout:rotate-12 transition-transform duration-700" />
                                        <div className="relative w-full h-full bg-secondary rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-secondary/30 group-hover/checkout:-translate-y-2 transition-transform duration-500">
                                            <CreditCard className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-primary tracking-tighter">Secure Grant</h2>
                                        <p className="text-[11px] text-primary/40 font-black uppercase tracking-[0.3em] mt-2">Standard Gateway Encryption</p>
                                    </div>
                                </div>

                                <Button
                                    onClick={handlePayment}
                                    disabled={processing}
                                    className="w-full h-20 bg-primary hover:bg-primary/95 text-white flex flex-col items-center justify-center gap-1 rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group/paybtn"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />
                                    {processing ? (
                                        <div className="flex items-center gap-3">
                                            <span className="font-black text-xs uppercase tracking-widest">Bridging API...</span>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                        </div>
                                    ) : (
                                        <>
                                            <span className="text-xl font-black tracking-tighter">Confirm ₹ 2,500.00</span>
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Complete Transmission</span>
                                        </>
                                    )}
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

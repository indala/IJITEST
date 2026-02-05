"use client";

import { CreditCard, ShieldCheck, Lock, ChevronRight, Info, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { trackManuscript } from '@/actions/track';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [loading, setLoading] = useState(true);
    const [manuscript, setManuscript] = useState<any>(null);
    const [error, setError] = useState('');
    const [processing, setProcessing] = useState(false);
    const [paid, setPaid] = useState(false);

    useEffect(() => {
        async function fetchDetails() {
            setLoading(true);
            // Reusing trackManuscript for details, but in a real app would use a more specific fetch
            // Using a dummy email bypass for this public page if we want it accessible via link
            // OR we'd have a token-based system. For now, let's fetch based on ID and show details if status is 'accepted'

            try {
                // Fetching manuscript data
                const result = await trackManuscript(id, ""); // Modified check
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
        // Razorpay logic will go here
        // For now, simulate success after 2 seconds
        setTimeout(() => {
            setProcessing(false);
            setPaid(true);
        }, 3000);
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Validating Invoice...</p>
            </div>
        </div>
    );

    if (error || (manuscript && manuscript.status !== 'accepted' && manuscript.status !== 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-red-100 text-center shadow-2xl">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Invalid Payment Link</h2>
                <p className="text-gray-500 font-medium mb-8">This payment link is no longer valid or the manuscript has not yet reached the acceptance stage.</p>
                <Link href="/track" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20">
                    Back to Tracking
                </Link>
            </div>
        </div>
    );

    if (paid || (manuscript && manuscript.status === 'published')) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white p-12 rounded-[3rem] border border-green-100 text-center shadow-2xl">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
                <h2 className="text-2xl font-serif font-black text-gray-900 mb-4">Payment Successful!</h2>
                <p className="text-gray-500 font-medium mb-8">Thank you for your payment. Your manuscript is now queued for final publication in the upcoming issue.</p>
                <Link href="/" className="inline-block bg-primary text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/20">
                    Return Home
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 py-20 pb-32">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row gap-12 items-start">

                    {/* Invoice Details */}
                    <div className="flex-1 space-y-8">
                        <div>
                            <Link href="/track" className="text-sm font-bold text-gray-400 hover:text-primary transition-colors flex items-center gap-1 mb-6">
                                <ChevronRight className="w-4 h-4 rotate-180" /> Back to Tracking
                            </Link>
                            <h1 className="text-4xl font-serif font-black text-gray-900 mb-2 uppercase italic tracking-tight">Publication Invoice</h1>
                            <p className="text-gray-500 font-medium">Article Processing Charge (APC) for IJITEST</p>
                        </div>

                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Paper Details</p>
                                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2">{manuscript.title}</h3>
                                    <p className="text-sm font-medium text-primary mt-1">ID: {manuscript.paper_id}</p>
                                </div>
                                <div className="p-4 bg-primary/5 rounded-2xl text-primary">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t border-gray-50 pt-8">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Author</p>
                                    <p className="font-bold text-gray-700">{manuscript.author_name}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Currency</p>
                                    <p className="font-bold text-gray-700">INR (₹)</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-8 rounded-[2rem] space-y-4">
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">Processing Fee</span>
                                    <span className="text-gray-900">₹ 2,100.00</span>
                                </div>
                                <div className="flex justify-between items-center text-sm font-medium">
                                    <span className="text-gray-500">Service Charges</span>
                                    <span className="text-gray-900">₹ 400.00</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                    <span className="text-lg font-black text-gray-900">Total APC Amount</span>
                                    <span className="text-2xl font-black text-primary">₹ 2,500.00</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-4 p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-blue-700 leading-relaxed">
                                By proceeding with the payment, you agree to the journal's publication terms. Once payment is verified, your paper will be scheduled for the next available issue.
                            </p>
                        </div>
                    </div>

                    {/* Payment Action */}
                    <div className="w-full lg:w-96 sticky top-24">
                        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-2xl space-y-8">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-primary rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                                    <CreditCard className="w-10 h-10 text-white" />
                                </div>
                                <h2 className="text-2xl font-serif font-black text-gray-900">Secure Checkout</h2>
                                <p className="text-gray-500 text-sm font-medium mt-1">Processed securely via Razorpay</p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full bg-primary text-white py-6 rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-primary/20 hover:bg-primary/95 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {processing ? (
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                ) : (
                                    <>
                                        <span className="text-xl font-black">Pay ₹ 2,500.00</span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Complete Publication</span>
                                    </>
                                )}
                            </button>

                            <div className="space-y-4 pt-4">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Lock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">SSL Encrypted Transaction</span>
                                </div>
                                <div className="flex items-center gap-4 justify-center grayscale opacity-50">
                                    {/* Payment Logos Placeholders */}
                                    <div className="font-black text-xs">UPI</div>
                                    <div className="font-black text-xs">VISA</div>
                                    <div className="font-black text-xs">MASTERCARD</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}

"use client";

import { CreditCard, DollarSign, CheckCircle, Clock, Search, Plus, X, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { getPayments, getAcceptedUnpaidPapers, updatePaymentStatus, initializePayment } from '@/actions/payments';
import { useState, useEffect } from 'react';

export default function Payments() {
    const [payments, setPayments] = useState<any[]>([]);
    const [unpaidPapers, setUnpaidPapers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showInitModal, setShowInitModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const [paymentsData, unpaidData] = await Promise.all([
            getPayments(),
            getAcceptedUnpaidPapers()
        ]);
        setPayments(paymentsData);
        setUnpaidPapers(unpaidData);
        setLoading(false);
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Payments...</div>;

    const stats = [
        { label: 'Total Pending', value: payments.filter(p => p.status === 'unpaid').length, color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Verified Paid', value: payments.filter(p => p.status === 'verified').length, color: 'text-green-600', bg: 'bg-green-50' },
    ];

    return (
        <div className="space-y-12 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">APC Payments</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Track Article Processing Charges and verify transactions.</p>
                </div>
                <button
                    onClick={() => setShowInitModal(true)}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-primary/95 transition-all"
                >
                    <Plus className="w-5 h-5" /> New Payment Request
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {stats.map(stat => (
                    <div key={stat.label} className={`${stat.bg} p-8 rounded-[2.5rem] border border-transparent`}>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{stat.label}</p>
                        <h3 className={`text-3xl font-serif font-black ${stat.color}`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {showInitModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-serif font-black text-gray-900">Request APC Payment</h2>
                            <button onClick={() => setShowInitModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        <form action={async (formData) => {
                            const subId = parseInt(formData.get('submissionId') as string);
                            const amount = parseFloat(formData.get('amount') as string);
                            const currency = formData.get('currency') as string;
                            await initializePayment(subId, amount, currency);
                            setShowInitModal(false);
                            fetchData();
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-500">Accepted Paper</label>
                                <select name="submissionId" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold appearance-none">
                                    <option value="">-- Select paper --</option>
                                    {unpaidPapers.map(paper => (
                                        <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500">Amount</label>
                                    <input name="amount" type="number" step="0.01" required className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold" placeholder="2500" defaultValue="2500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-500">Currency</label>
                                    <select name="currency" className="w-full bg-gray-50 p-4 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                            <button className="w-full bg-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:shadow-xl transition-all">
                                Initialize Request
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                {payments.map((item) => (
                    <div key={item.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:shadow-lg transition-all">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.status === 'verified' ? 'bg-green-50 text-green-600' : item.status === 'paid' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                                    }`}>
                                    {item.status}
                                </span>
                                <span className="text-[10px] font-black text-gray-400 font-mono tracking-tighter bg-gray-50 px-2 py-1 rounded">ID: {item.paper_id}</span>
                            </div>
                            <h3 className="text-xl font-bold font-serif text-gray-900 mb-2">{item.title}</h3>
                            <div className="flex flex-wrap gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-500">
                                    <User className="w-4 h-4 text-gray-300" />
                                    <span className="font-medium">{item.author_name} ({item.author_email})</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-900 font-black">
                                    <DollarSign className="w-4 h-4 text-gray-300" />
                                    <span>{item.amount} {item.currency}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                            {item.status === 'unpaid' ? (
                                <button
                                    onClick={async () => {
                                        const txId = prompt("Enter Transaction ID (from bank/gateway):");
                                        if (txId) {
                                            await updatePaymentStatus(item.id, 'paid', txId);
                                            fetchData();
                                        }
                                    }}
                                    className="bg-white text-primary border border-primary/20 px-6 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-sm"
                                >
                                    Mark as Paid
                                </button>
                            ) : item.status === 'paid' ? (
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Transaction ID</p>
                                        <p className="text-xs font-mono font-bold text-gray-900">{item.transaction_id}</p>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (confirm("Verify this payment? This will finalize the publication status.")) {
                                                await updatePaymentStatus(item.id, 'verified', item.transaction_id);
                                                fetchData();
                                            }
                                        }}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 flex items-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4" /> Verify
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-green-600 font-black uppercase text-[10px] tracking-widest">
                                    <CheckCircle className="w-5 h-5" /> Confirmed & Verified
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {payments.length === 0 && !loading && (
                    <div className="bg-gray-50 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200">
                        <CreditCard className="w-16 h-16 text-gray-200 mb-6" />
                        <h3 className="text-xl font-serif font-black text-gray-400 mb-2">No Payment Records</h3>
                        <p className="text-gray-400 max-w-sm">No APC payment requests have been generated yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

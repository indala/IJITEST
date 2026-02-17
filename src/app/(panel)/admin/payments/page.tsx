"use client";

import { CreditCard, DollarSign, CheckCircle, Clock, Search, Plus, X, User, ExternalLink, ShieldCheck, Mail, ArrowRight, AlertTriangle } from 'lucide-react';
import { getPayments, getAcceptedUnpaidPapers, updatePaymentStatus, initializePayment } from '@/actions/payments';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Scanning Transactions...</div>;

    const stats = [
        { label: 'Total Pending', value: payments.filter(p => p.status === 'unpaid').length, variant: 'orange', icon: <Clock className="w-4 h-4" /> },
        { label: 'Verified Paid', value: payments.filter(p => p.status === 'verified').length, variant: 'emerald', icon: <CheckCircle className="w-4 h-4" /> },
    ];

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'verified': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'paid': return 'bg-blue-600/10 text-blue-600 border-none';
            case 'unpaid': return 'bg-orange-500/10 text-orange-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">APC Payments</h1>
                    <p className="text-xs font-medium text-muted-foreground">Track Article Processing Charges and verify submissions.</p>
                </div>
                <Dialog open={showInitModal} onOpenChange={setShowInitModal}>
                    <DialogTrigger asChild>
                        <Button className="h-10 px-4 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> New Payment Request
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md rounded-2xl p-6">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-foreground tracking-tight">Request APC Payment</DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground">
                                Initialize a payment request for an accepted manuscript.
                            </DialogDescription>
                        </DialogHeader>
                        <form action={async (formData) => {
                            const subId = parseInt(formData.get('submissionId') as string);
                            const amount = parseFloat(formData.get('amount') as string);
                            const currency = formData.get('currency') as string;
                            await initializePayment(subId, amount, currency);
                            setShowInitModal(false);
                            fetchData();
                        }} className="space-y-4 pt-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Accepted Paper</label>
                                <select name="submissionId" required className="flex h-11 w-full rounded-lg bg-muted/50 px-3 py-1 text-xs font-bold transition-colors outline-none border-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                                    <option value="">-- Select paper --</option>
                                    {unpaidPapers.map(paper => (
                                        <option key={paper.id} value={paper.id}>{paper.paper_id} - {paper.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Amount</label>
                                    <Input name="amount" type="number" step="0.01" required className="h-11 bg-muted/50 border-none focus-visible:ring-1 focus-visible:ring-primary/30 font-bold text-xs" placeholder="2500" defaultValue="2500" />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Currency</label>
                                    <select name="currency" className="flex h-11 w-full rounded-lg bg-muted/50 px-3 py-1 text-xs font-bold transition-colors outline-none border-none ring-offset-background placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50 appearance-none">
                                        <option value="INR">INR</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="submit" className="w-full h-11 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                    Initialize Request
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map(stat => (
                    <Card key={stat.label} className={`border-none shadow-sm ${stat.variant === 'orange' ? 'bg-orange-500/5 text-orange-600' : 'bg-emerald-500/5 text-emerald-600'}`}>
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">{stat.label}</p>
                                <h3 className="text-3xl font-black tracking-tighter">{stat.value}</h3>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white shadow-sm`}>
                                {stat.icon}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Payments List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                    <h2 className="text-sm font-black text-foreground uppercase tracking-widest">Transaction Records</h2>
                    <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-black">{payments.length}</Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {payments.map((item) => (
                        <Card key={item.id} className="border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                            <CardContent className="p-0">
                                <div className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-3 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <Badge className={`h-5 px-1.5 text-[9px] font-black uppercase tracking-widest ${getStatusVariant(item.status)}`}>
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-mono font-black text-muted-foreground uppercase tracking-tighter bg-muted px-2 py-0.5 rounded border border-border/50">
                                                ID: {item.paper_id}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-foreground leading-tight tracking-tight truncate group-hover:text-primary transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="flex flex-wrap gap-4 items-center">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                                                <User className="w-3.5 h-3.5 opacity-40 text-primary" />
                                                <span className="truncate max-w-[150px]">{item.author_name}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
                                                <DollarSign className="w-3.5 h-3.5 opacity-40 text-emerald-500" />
                                                <span>{item.amount} {item.currency}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-3">
                                        {item.status === 'unpaid' ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    const txId = prompt("Enter Transaction ID (from bank/gateway):");
                                                    if (txId) {
                                                        await updatePaymentStatus(item.id, 'paid', txId);
                                                        fetchData();
                                                    }
                                                }}
                                                className="h-9 px-4 text-[10px] font-black uppercase tracking-widest rounded-lg border-primary/20 text-primary hover:bg-primary hover:text-white transition-all"
                                            >
                                                Mark as Paid
                                            </Button>
                                        ) : item.status === 'paid' ? (
                                            <div className="flex items-center gap-4 bg-muted/50 p-2 pl-4 pr-2 rounded-xl border border-border/50">
                                                <div className="text-right">
                                                    <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Transaction ID</p>
                                                    <p className="text-[10px] font-mono font-black text-foreground leading-tight">{item.transaction_id}</p>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={async () => {
                                                        if (confirm("Verify this payment? This will finalize the publication status.")) {
                                                            await updatePaymentStatus(item.id, 'verified', item.transaction_id);
                                                            fetchData();
                                                        }
                                                    }}
                                                    className="h-8 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest rounded-lg"
                                                >
                                                    <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verify
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-xl text-emerald-600 border border-emerald-500/10">
                                                <CheckCircle className="w-4 h-4" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">Verified</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {payments.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                            <CreditCard className="w-10 h-10 text-muted-foreground/20 mb-4" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No payment records found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

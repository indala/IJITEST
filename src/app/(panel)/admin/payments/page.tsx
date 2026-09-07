"use client";

import { CreditCard, DollarSign, CheckCircle, Clock, Search, Plus, User, ShieldCheck, Mail, ArrowRight, AlertTriangle, History, Eye, Globe } from 'lucide-react';
import {
    usePayments,
    useUnpaidPapers,
    useInitializePayment,
    useUpdatePaymentStatus
} from '@/hooks/queries/usePayments';
import Link from 'next/link';
import React, { useState, useCallback, useMemo, useActionState, useDeferredValue } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'verified': return 'bg-emerald-50 text-emerald-600 border-none';
        case 'paid': return 'bg-blue-50 text-blue-600 border-none';
        case 'pending': return 'bg-orange-50 text-orange-600 border-none';
        case 'waived': return 'bg-purple-50 text-purple-600 border-none';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

import type { PaymentRow, ActionResponse } from '@/db/types';

const PaymentItemCard = React.memo(({ item, onUpdateStatus }: { item: PaymentRow, onUpdateStatus: (id: number, status: 'pending' | 'paid' | 'verified' | 'failed' | 'waived', txId: string) => Promise<void> }) => (
    <Card key={item.id} className="border-border/70 shadow-2xs hover:border-primary/30 transition-all group overflow-hidden bg-card relative rounded-xl">
        <div className={`absolute top-0 left-0 w-1 h-full ${item.status === 'verified' ? 'bg-emerald-500' : item.status === 'paid' ? 'bg-blue-500' : item.status === 'waived' ? 'bg-purple-500' : 'bg-orange-500'}`} />
        <CardContent className="p-4 sm:p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1 space-y-3 min-w-0 pl-1">
                    <div className="flex items-center gap-2.5">
                        <Badge className={`h-5 px-2.5 text-[10px] font-semibold rounded-md ${getStatusVariant(item.status)}`}>
                            {item.status === 'verified' ? 'Authorized' : item.status}
                        </Badge>
                        <div className="flex items-center gap-1.5 bg-muted/60 px-2.5 py-0.5 rounded text-xs font-mono border border-border/60 text-muted-foreground">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                            <span>{item.paperId}</span>
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                        {item.title}
                    </h3>
                    <div className="flex flex-wrap gap-6 sm:gap-10 items-center border-t border-border/50 pt-3 text-xs">
                        <div className="space-y-0.5">
                            <p className="text-meta">Author</p>
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                                <User className="w-3.5 h-3.5 text-primary" />
                                <span>{item.authorName}</span>
                            </div>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-meta">Remittance Amount</p>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{item.amount} {item.currency}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="shrink-0 flex flex-wrap items-center gap-2.5 border-t lg:border-t-0 pt-3 lg:pt-0 border-border/50">
                    <div className="flex items-center gap-1.5">
                        <Button asChild variant="ghost" size="icon" aria-label="View manuscript detail" className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <Link href={`/admin/submissions/${item.submissionId}`} title="View manuscript detail">
                                <Eye className="w-4 h-4" />
                                <span className="sr-only">View manuscript detail</span>
                            </Link>
                        </Button>
                        <Button asChild variant="ghost" size="icon" aria-label={`Contact ${item.authorName}`} className="w-8 h-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                            <a href={`mailto:${item.authorEmail}`} title={`Contact ${item.authorName}`}>
                                <Mail className="w-4 h-4" />
                                <span className="sr-only">Contact {item.authorName}</span>
                            </a>
                        </Button>
                    </div>
                    <Separator orientation="vertical" className="h-6 mx-1 bg-border/70 hidden lg:block" />
                    {item.status === 'pending' ? (
                        <Button
                            onClick={async () => {
                                const txId = prompt("Enter Bank/Gateway Transaction Reference:");
                                if (txId) {
                                    await onUpdateStatus(item.id, 'paid', txId);
                                }
                            }}
                            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-card border border-secondary text-secondary hover:text-secondary-foreground hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                        >
                            <CheckCircle className="w-3.5 h-3.5" /> Verify
                        </Button>
                    ) : item.status === 'paid' ? (
                        <Button
                            onClick={async () => {
                                if (confirm("Finalize archive authorization for this manuscript?")) {
                                    await onUpdateStatus(item.id, 'verified', item.transactionId || '');
                                }
                            }}
                            className="h-8 px-3 text-xs font-semibold gap-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-xs"
                        >
                            <ShieldCheck className="w-3.5 h-3.5" /> Authorize Archive
                        </Button>
                    ) : item.status === 'verified' ? (
                        <div className="flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-md text-emerald-600 text-xs font-semibold border border-emerald-200/60">
                            <Globe className="w-3.5 h-3.5" />
                            <span>Archive Active</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1 rounded-md text-purple-600 text-xs font-semibold border border-purple-200/60">
                            <ArrowRight className="w-3.5 h-3.5" />
                            <span>Fee Waived</span>
                        </div>
                    )}
                </div>
            </div>
        </CardContent>
    </Card>
));

PaymentItemCard.displayName = 'PaymentItemCard';

export default function PaymentManagement() {
    const { data: payments = [], isLoading: loading } = usePayments();
    const { data: unpaidPapers = [] } = useUnpaidPapers();
    const initMutation = useInitializePayment();
    const updateMutation = useUpdatePaymentStatus();

    const [showInitModal, setShowInitModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Defer the search query to improve typing responsiveness
    const deferredSearchQuery = useDeferredValue(searchQuery);

    const [, initPaymentAction, isInitPaymentPending] = useActionState(
        async (_prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse | null> => {
            const submissionId = parseInt(formData.get('submissionId') as string);
            const amount = parseFloat(formData.get('amount') as string);
            const currency = formData.get('currency') as string;

            try {
                const res = await initMutation.mutateAsync({ submissionId, amount, currency });
                if (res.success) {
                    setShowInitModal(false);
                    toast.success("Transaction initialized");
                } else {
                    toast.error(res.error);
                }
                return res;
            } catch {
                toast.error("Failed to initialize transaction");
                return { success: false, error: "Failed to initialize transaction" };
            }
        },
        null
    );

    const handleStatusUpdate = useCallback(async (id: number, status: 'pending' | 'paid' | 'verified' | 'failed' | 'waived', transactionId: string) => {
        try {
            const res = await updateMutation.mutateAsync({ id, status, transactionId });
            if (res.success) {
                toast.success("Status Synchronized");
            } else {
                toast.error(res.error);
            }
        } catch {
            toast.error("Failed to update status");
        }
    }, [updateMutation]);

    const filteredPayments = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch =
                p.title.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
                p.authorName.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
                p.paperId.toLowerCase().includes(deferredSearchQuery.toLowerCase()) ||
                (p.transactionId && p.transactionId.toLowerCase().includes(deferredSearchQuery.toLowerCase()));

            const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, deferredSearchQuery, statusFilter]);

    const revenueStats = useMemo(() => {
        return {
            gross: payments.filter(p => p.status === 'verified').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
            paid: payments.filter(p => p.status === 'paid' || p.status === 'verified').length,
            projected: payments.filter(p => p.status === 'pending').reduce((acc, curr) => acc + parseFloat(curr.amount), 0),
            pending: payments.filter(p => p.status === 'pending').length
        };
    }, [payments]);

    const stats = useMemo(() => [
        { label: 'Gross revenue (verified)', value: `₹${revenueStats.gross}`, variant: 'emerald', icon: <DollarSign className="w-4 h-4" /> },
        { label: 'Verified transactions', value: revenueStats.paid, variant: 'blue', icon: <CheckCircle className="w-4 h-4" /> },
        { label: 'Projected revenue', value: `₹${revenueStats.projected}`, variant: 'orange', icon: <History className="w-4 h-4" /> },
        { label: 'Pending requests', value: revenueStats.pending, variant: 'rose', icon: <Clock className="w-4 h-4" /> },
    ], [revenueStats]);

    if (loading) return (
        <div className="p-24 text-center space-y-4">
            <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted-foreground animate-pulse font-medium">Verifying Financial Records...</p>
        </div>
    );

    return (
        <section className="space-y-4">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <h1 className="panel-title text-xl xl:text-2xl font-bold text-primary">Financial Oversight</h1>
                    <p className="panel-subtitle text-body-sm text-muted-foreground">Article processing charge (APC) management and financial protocol enforcement.</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <Dialog open={showInitModal} onOpenChange={setShowInitModal}>
                        <DialogTrigger asChild>
                            <Button className="btn-primary h-9">
                                <Plus className="w-4 h-4 mr-2" /> Initialize APC Request
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md rounded-2xl p-5 sm:p-6 bg-card border-border/70 shadow-2xl">
                            <DialogHeader className="space-y-2">
                                <DialogTitle className="text-xl font-semibold text-foreground tracking-tight">Manual Request</DialogTitle>
                                <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
                                    Initialize a payment node for an accepted manuscript without automated triggers.
                                </DialogDescription>
                            </DialogHeader>
                            <form action={initPaymentAction} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-label text-foreground">Accepted Paper</Label>
                                    <Select name="submissionId" required>
                                        <SelectTrigger className="h-10 w-full rounded-lg bg-background border-border/70 text-sm">
                                            <SelectValue placeholder="Select target paper..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl border-border/70 bg-card">
                                            {unpaidPapers.map(paper => (
                                                <SelectItem key={paper.id} value={paper.id.toString()} className="text-xs sm:text-sm">
                                                    {paper.paperId} | {paper.title.slice(0, 50)}...
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-label text-foreground">Amount</Label>
                                        <Input name="amount" type="number" step="0.01" required className="h-10 bg-background border-border/70 rounded-lg text-sm" placeholder="2500" defaultValue="2500" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-label text-foreground">Currency</Label>
                                        <Select name="currency" defaultValue="INR">
                                            <SelectTrigger className="h-10 w-full rounded-lg bg-background border-border/70 text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border/70 bg-card">
                                                <SelectItem value="INR">INR</SelectItem>
                                                <SelectItem value="USD">USD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button type="submit" disabled={isInitPaymentPending} className="w-full h-10 btn-primary rounded-lg cursor-pointer">
                                        {isInitPaymentPending ? "Creating Node..." : "Create Payment Node"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {stats.map(stat => (
                    <Card key={stat.label} className="border-border/70 shadow-2xs bg-card rounded-xl">
                        <CardContent className="p-3.5 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.variant === 'emerald' ? 'bg-emerald-500/10 text-emerald-600' : stat.variant === 'blue' ? 'bg-blue-500/10 text-blue-600' : stat.variant === 'orange' ? 'bg-orange-500/10 text-orange-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                    <div className="[&>svg]:w-4 [&>svg]:h-4">
                                        {stat.icon}
                                    </div>
                                </div>
                                <Badge variant="outline" className="h-5 px-2 text-[10px] text-muted-foreground border-border/70">Live Metric</Badge>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-label text-muted-foreground">{stat.label}</p>
                                <h3 className="text-xl lg:text-2xl font-bold text-foreground">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Registry Search & Filter */}
            <div className="flex flex-col sm:flex-row items-center gap-2.5 bg-muted/20 p-2.5 sm:p-3 rounded-xl border border-border/70">
                <InputGroup className="flex-1 h-9 bg-card border-border/70 rounded-lg shadow-2xs">
                    <InputGroupAddon className="pl-3">
                        <Search className="w-4 h-4 text-muted-foreground" />
                    </InputGroupAddon>
                    <InputGroupInput
                        placeholder="Search by Title, ID, Author, or Transaction..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-full px-3 text-sm bg-transparent border-0 ring-0 focus-visible:ring-0"
                    />
                </InputGroup>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-9 px-3 bg-card border-border/70 rounded-lg shadow-2xs text-xs text-foreground min-w-[150px]">
                            <SelectValue placeholder="Global Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/70 bg-card">
                            <SelectItem value="all">Global Status</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Remitted</SelectItem>
                            <SelectItem value="verified">Verified</SelectItem>
                            <SelectItem value="waived">Waived</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Payments List */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <h2 className="text-label text-muted-foreground uppercase">Transaction Registry</h2>
                        <span className="badge-brand text-[10px] font-medium h-5 px-2 rounded-md inline-flex items-center justify-center">{filteredPayments.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                    {filteredPayments.map((item) => (
                        <PaymentItemCard key={item.id} item={item} onUpdateStatus={handleStatusUpdate} />
                    ))}

                    {filteredPayments.length === 0 && !loading && (
                        <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed border-border/70 rounded-2xl space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-muted/50 border border-border/70 flex items-center justify-center text-muted-foreground/30">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="font-semibold text-foreground text-lg">No Records Found</h3>
                                <p className="text-sm text-muted-foreground max-w-sm">No financial transactions correlate with your active query.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

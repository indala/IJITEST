'use client';

import React, { useState, useCallback, useMemo, Suspense } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, User, Building2, FileText, 
    Briefcase, Download, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { useQueryStates, parseAsString } from 'nuqs';
import dayjs from 'dayjs';
import { Drawer } from 'vaul';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { 
    useApplications, 
    useApproveApplication, 
    useRejectApplication,
    useBulkApproveApplications,
    useBulkRejectApplications
} from "@/hooks/queries/useApplications";

import { Application } from "@/db/types";

// --- Sub-components ---

const ApplicationItemCard = React.memo(({ 
    app, 
    isSelected, 
    onToggle, 
    onInspect 
}: { 
    app: Application; 
    isSelected: boolean; 
    onToggle: (id: number) => void;
    onInspect: (app: Application) => void;
}) => {
    return (
        <Card 
            className={`relative overflow-hidden border-primary/5 bg-card/50 transition-all hover:bg-card hover:border-primary/20 cursor-pointer group ${isSelected ? 'ring-2 ring-primary/50' : ''}`}
            onClick={() => onInspect(app)}
        >
            <CardContent className="p-0 flex flex-col lg:flex-row items-stretch lg:items-center">
                <div 
                    className="px-6 py-4 lg:py-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-primary/5 bg-muted/5 lg:bg-transparent"
                    onClick={(e) => { e.stopPropagation(); onToggle(app.id); }}
                >
                    <Checkbox checked={isSelected} />
                </div>

                <div className="p-4 flex justify-center shrink-0 lg:border-r border-primary/5">
                    <div className="w-16 h-16 lg:w-20 lg:h-20 bg-muted rounded-xl border border-primary/5 overflow-hidden shadow-inner relative">
                        {app.photoUrl ? (
                            <NextImage 
                                src={app.photoUrl} 
                                alt="" 
                                width={80} 
                                height={80} 
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-20"><User /></div>
                        )}
                    </div>
                </div>

                <div className="p-6 flex-1 space-y-2 lg:border-r border-primary/5 min-w-0">
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-sm lg:text-lg text-foreground truncate uppercase tracking-tight">{app.fullName}</h3>
                        <Badge className={`rounded-lg h-5 px-2.5 border-none text-[7px] lg:text-[8px] font-black uppercase tracking-widest ${
                            app.type === 'editor' ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                            {app.type}
                        </Badge>
                    </div>
                    <div className="flex flex-wrap gap-x-4 lg:gap-x-6 gap-y-1 text-muted-foreground text-[8px] lg:text-[10px] font-bold uppercase tracking-widest opacity-60">
                        <span className="flex items-center gap-2"><Building2 className="w-3 lg:w-3.5 h-3 lg:h-3.5" /> {app.institute}</span>
                        <span className="flex items-center gap-2"><Briefcase className="w-3 lg:w-3.5 h-3 lg:h-3.5" /> {app.designation}</span>
                    </div>
                </div>

                <div className="p-4 lg:p-8 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 bg-muted/5 h-full min-w-0 lg:min-w-[200px] border-t lg:border-t-0 border-primary/5">
                    <Badge className={`h-7 lg:h-8 px-4 lg:px-5 text-[8px] lg:text-[10px] font-black tracking-widest uppercase border-none rounded-xl ${
                        app.status === 'approved' ? 'bg-emerald-500 text-white' :
                        app.status === 'rejected' ? 'bg-rose-500 text-white' :
                        'bg-amber-500 text-black'
                    }`}>
                        {app.status}
                    </Badge>
                    <p className="text-[8px] lg:text-[9px] font-bold text-muted-foreground uppercase opacity-40">
                        {dayjs(app.createdAt).format('DD MMM YYYY')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
});

ApplicationItemCard.displayName = 'ApplicationItemCard';

// --- Main Registry Component ---

export function ApplicationsRegistry({ role: _panelRole }: { role: 'admin' | 'editor' }) {
    const [filters, setFilters] = useQueryStates({
        role: parseAsString.withDefault('all'),
        status: parseAsString.withDefault('all'),
        interest: parseAsString.withDefault('')
    }, { shallow: false, history: 'replace' });

    const { role, status, interest } = filters;

    const queryParams: { role?: string; status?: string; interest?: string } = {};
    if (role && role !== 'all') queryParams.role = role;
    if (status && status !== 'all') queryParams.status = status;

    const { data: applications = [], isLoading: loading } = useApplications(queryParams);

    const approveMutation = useApproveApplication();
    const rejectMutation = useRejectApplication();
    const bulkApproveMutation = useBulkApproveApplications();
    const bulkRejectMutation = useBulkRejectApplications();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [inspectApp, setInspectApp] = useState<Application | null>(null);
    const [rejectionMode, setRejectionMode] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [bulkRejectionMode, setBulkRejectionMode] = useState(false);
    const [bulkRejectionReason, setBulkRejectionReason] = useState("");
    const [approveConfirm, setApproveConfirm] = useState(false);

    const filteredApps = useMemo(() => {
        if (!interest) return applications;
        const q = interest.toLowerCase();
        return applications.filter(app => 
            app.fullName?.toLowerCase().includes(q) || 
            app.email?.toLowerCase().includes(q) ||
            app.researchInterests?.some((i: string) => i.toLowerCase().includes(q))
        );
    }, [applications, interest]);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) setSelectedIds(filteredApps.map(app => app.id));
        else setSelectedIds([]);
    }, [filteredApps]);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleApprove = async (id: number) => {
        const toastId = toast.loading("Processing approval...");
        const res = await approveMutation.mutateAsync(id);
        if (res.success) {
            toast.success("Personnel candidacy authorized", { id: toastId });
            setInspectApp(null);
            setApproveConfirm(false);
        } else {
            toast.error(res.error || "Authorization failed", { id: toastId });
        }
    };

    const handleReject = async (id: number, reason: string) => {
        if (reason.length < 20) {
            toast.error("Vetting rationale must be at least 20 characters");
            return;
        }
        const toastId = toast.loading("Processing rejection...");
        const res = await rejectMutation.mutateAsync({ id, reason });
        if (res.success) {
            toast.success("Proposal declined", { id: toastId });
            setInspectApp(null);
            setRejectionMode(false);
            setRejectionReason("");
        } else {
            toast.error(res.error || "Rejection failed", { id: toastId });
        }
    };

    const handleBulkApprove = async () => {
        if (selectedIds.length === 0) return;
        const toastId = toast.loading(`Authorizing ${selectedIds.length} candidates...`);
        const res = await bulkApproveMutation.mutateAsync(selectedIds);
        if (res.success) {
            toast.success("Collective authorization complete", { id: toastId });
            setSelectedIds([]);
        } else {
            toast.error(res.error || "Bulk processing failed", { id: toastId });
        }
    };

    const handleBulkReject = async (reason: string) => {
        if (selectedIds.length === 0) return;
        if (reason.length < 20) {
            toast.error("Vetting rationale must be at least 20 characters");
            return;
        }
        const toastId = toast.loading(`Declining ${selectedIds.length} proposals...`);
        const res = await bulkRejectMutation.mutateAsync({ ids: selectedIds, reason });
        if (res.success) {
            toast.success("Collective rejection processed", { id: toastId });
            setSelectedIds([]);
            setBulkRejectionMode(false);
            setBulkRejectionReason("");
        } else {
            toast.error(res.error || "Bulk processing failed", { id: toastId });
        }
    };

    if (loading) {
        return (
            <div className="p-32 flex flex-col items-center justify-center gap-6">
                <div className="w-14 h-14 border-[3px] border-primary/10 border-t-primary rounded-full animate-spin" />
                <p className="font-bold text-[10px] tracking-[0.3em] uppercase animate-pulse text-muted-foreground">Accessing vetting pipeline...</p>
            </div>
        );
    }

    return (
        <section className="flex-1 flex flex-col min-h-0 space-y-4 lg:space-y-6 p-4 lg:px-6 lg:pb-6">
            

            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-4xl">
                <div className="relative group flex-1 w-full">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                    <Input
                        placeholder="Search candidates by name or domain..."
                        value={interest}
                        onChange={(e) => setFilters({ interest: e.target.value })}
                        className="h-14 pl-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl focus-visible:ring-4 focus-visible:ring-primary/5"
                    />
                </div>
                <Select value={role} onValueChange={(val) => setFilters({ role: val })}>
                    <SelectTrigger className="h-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl px-6 min-w-[160px]">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/5 bg-card">
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={status} onValueChange={(val) => setFilters({ status: val })}>
                    <SelectTrigger className="h-14 bg-primary/5 border-none font-semibold text-sm rounded-2xl px-6 min-w-[160px]">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-primary/5 bg-card">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {filteredApps.length > 0 && (
                <div className="flex flex-col sm:flex-row items-center gap-4 px-4 py-3 bg-muted/30 rounded-2xl border border-primary/5 w-fit">
                    <div className="flex items-center gap-3">
                        <Checkbox 
                            checked={selectedIds.length === filteredApps.length && filteredApps.length > 0}
                            onCheckedChange={handleSelectAll}
                            id="select-all"
                        />
                        <label htmlFor="select-all" className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer">
                            {selectedIds.length === 0 ? "Select for batch action" : `${selectedIds.length} applicants selected`}
                        </label>
                    </div>

                    {selectedIds.length > 0 && (
                        <div className="flex items-center gap-2 pl-4 border-l border-primary/10">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border-emerald-500/20 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                                onClick={handleBulkApprove}
                            >
                                Bulk Approve
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 rounded-lg text-[9px] font-black uppercase tracking-widest border-rose-500/20 text-rose-600 hover:bg-rose-500 hover:text-white"
                                onClick={() => setBulkRejectionMode(true)}
                            >
                                Bulk Reject
                            </Button>
                        </div>
                    )}
                </div>
            )}

            <AnimatePresence>
                {bulkRejectionMode && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-rose-500/5 border border-rose-500/10 rounded-3xl p-6 space-y-4 overflow-hidden"
                    >
                        <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-600">Bulk Rejection Rationale</h4>
                            <span className={`text-[10px] font-black ${bulkRejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                {bulkRejectionReason.length}/20 characters
                            </span>
                        </div>
                        <textarea
                            value={bulkRejectionReason}
                            onChange={(e) => setBulkRejectionReason(e.target.value)}
                            className="w-full h-24 bg-background border-2 border-rose-500/10 rounded-2xl p-4 text-sm focus:border-rose-500 outline-none transition-all resize-none font-medium"
                            placeholder="Enter the grounds for declining these selected proposals..."
                        />
                        <div className="flex gap-3 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setBulkRejectionMode(false)} className="h-9 px-6 rounded-xl font-black uppercase text-[9px] tracking-widest">Abort</Button>
                            <Button 
                                disabled={bulkRejectionReason.length < 20}
                                onClick={() => handleBulkReject(bulkRejectionReason)}
                                className="h-9 px-6 rounded-xl bg-rose-600 text-white font-black uppercase text-[9px] tracking-widest"
                            >
                                Confirm Collective Rejection
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 gap-4">
                {filteredApps.length === 0 ? (
                    <div className="py-32 text-center bg-primary/2 border-2 border-dashed border-primary/10 rounded-2xl space-y-4">
                        <AlertCircle className="w-12 h-12 text-primary/10 mx-auto" />
                        <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">No matching dossiers found</p>
                    </div>
                ) : (
                    <div 
                        className="flex-1 min-h-0 bg-muted/5 rounded-2xl lg:rounded-3xl border border-primary/5 overflow-y-auto custom-scrollbar p-2 lg:p-4"
                        data-lenis-prevent
                    >
                        <div className="space-y-4">
                            {filteredApps.map((app) => (
                                <ApplicationItemCard 
                                    key={app.id}
                                    app={app}
                                    isSelected={selectedIds.includes(app.id)}
                                    onToggle={toggleSelect}
                                    onInspect={setInspectApp}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Drawer.Root open={!!inspectApp} onOpenChange={(o) => { if(!o) { setInspectApp(null); setRejectionMode(false); setApproveConfirm(false); } }}>
                <Drawer.Portal>
                    <Drawer.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" />
                    <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col h-[90vh] bg-card border-t border-primary/5 rounded-t-[32px] outline-none shadow-2xl">
                        <Drawer.Title className="sr-only">Application Details</Drawer.Title>
                        <Drawer.Description className="sr-only">Detailed overview of the candidate&apos;s dossier and research profile.</Drawer.Description>
                        <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-primary/10 my-4" />
                        <div 
                            className="flex-1 overflow-y-auto min-h-0 px-6 pb-12 custom-scrollbar"
                            data-lenis-prevent
                        >
                            {inspectApp && (
                                <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] min-h-full gap-8">
                                    <div className="p-8 bg-primary/2 border rounded-3xl border-primary/5 space-y-8">
                                        <div className="space-y-6 text-center lg:text-left">
                                            <div className="w-40 h-40 rounded-3xl bg-muted border border-primary/5 mx-auto lg:mx-0 overflow-hidden shadow-2xl">
                                                {inspectApp.photoUrl ? (
                                                    <NextImage src={inspectApp.photoUrl} alt="" width={300} height={300} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center opacity-20 scale-150"><User /></div>
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <h2 className="text-3xl font-black uppercase tracking-tight">{inspectApp.fullName}</h2>
                                                <p className="text-xs font-black text-primary uppercase tracking-[0.2em] opacity-60">{inspectApp.designation}</p>
                                            </div>
                                        </div>

                                        <Separator className="bg-primary/5" />

                                        <div className="space-y-6">
                                            {[
                                                { label: 'Institution', value: inspectApp.institute },
                                                { label: 'Nationality', value: inspectApp.nationality },
                                                { label: 'Role Target', value: inspectApp.type },
                                                { label: 'Status', value: inspectApp.status, color: inspectApp.status === 'approved' ? 'text-emerald-500' : inspectApp.status === 'rejected' ? 'text-rose-500' : 'text-amber-500' }
                                            ].map(item => (
                                                <div key={item.label} className="space-y-1">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">{item.label}</span>
                                                    <p className={`text-[11px] font-black uppercase tracking-widest ${item.color || 'text-foreground'}`}>{item.value}</p>
                                                </div>
                                            ))}

                                            <div className="space-y-3">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground opacity-40">Core Expertise</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {inspectApp.researchInterests?.map((tag: string) => (
                                                        <span key={tag} className="text-[9px] font-black uppercase text-primary px-3 py-1 bg-primary/5 rounded-lg border border-primary/10">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col bg-card border border-primary/5 rounded-3xl overflow-hidden shadow-inner">
                                        <div className="p-6 border-b border-primary/5 flex items-center justify-between bg-primary/2">
                                            <div className="flex items-center gap-4">
                                                <FileText className="text-primary w-5 h-5" />
                                                <span className="font-bold text-xs uppercase tracking-[0.2em]">Candidacy Dossier</span>
                                            </div>
                                            <Button variant="outline" size="sm" asChild className="h-9 px-5 rounded-xl border-primary/10 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                                <a href={inspectApp.cvUrl || undefined} download>
                                                    <Download className="w-4 h-4 mr-2" /> Download Document
                                                </a>
                                            </Button>
                                        </div>
 
                                        <div className="flex-1 min-h-[500px] bg-muted/10 relative">
                                            {inspectApp.cvUrl?.toLowerCase().endsWith('.pdf') ? (
                                                <iframe src={inspectApp.cvUrl || undefined} title="Preview" className="w-full h-full border-none dark:invert dark:hue-rotate-180" />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                                    <FileText className="w-16 h-16 opacity-20" />
                                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Document format requires local viewing.</p>
                                                    <Button asChild className="rounded-2xl h-14 px-10 bg-primary text-white font-black uppercase tracking-widest">
                                                        <a href={inspectApp.cvUrl || undefined} download>Initialize Download</a>
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {inspectApp.status === 'pending' && (
                                            <div className="p-8 border-t border-primary/5 bg-primary/2">
                                                <AnimatePresence mode="wait">
                                                    {rejectionMode ? (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-end">
                                                                    <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Rejection Rationale (Audit Log)</label>
                                                                    <span className={`text-[10px] font-black ${rejectionReason.length < 20 ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                                        {rejectionReason.length}/20 chars
                                                                    </span>
                                                                </div>
                                                                <textarea
                                                                    value={rejectionReason}
                                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                                    className="w-full h-32 bg-background border-2 border-rose-500/20 rounded-2xl p-4 text-sm focus:border-rose-500 outline-none transition-all resize-none font-medium"
                                                                    placeholder="Describe the grounds for declining this proposal..."
                                                                />
                                                            </div>
                                                            <div className="flex gap-4">
                                                                <Button variant="ghost" onClick={() => setRejectionMode(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                                <Button 
                                                                    disabled={rejectionReason.length < 20}
                                                                    onClick={() => handleReject(inspectApp.id, rejectionReason)}
                                                                    className="flex-2 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black uppercase tracking-widest"
                                                                >
                                                                    Confirm Terminal Rejection
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ) : approveConfirm ? (
                                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-center">
                                                            <h4 className="text-xl font-black uppercase">Authorize Personnel?</h4>
                                                            <div className="flex gap-4">
                                                                <Button variant="ghost" onClick={() => setApproveConfirm(false)} className="flex-1 h-14 rounded-2xl font-black uppercase">Abort</Button>
                                                                <Button 
                                                                    onClick={() => handleApprove(inspectApp.id)}
                                                                    className="flex-2 h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20"
                                                                >
                                                                    Authorize & Invite
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ) : (
                                                        <div className="flex gap-4">
                                                            <Button 
                                                                variant="outline" 
                                                                onClick={() => setRejectionMode(true)}
                                                                className="flex-1 h-16 rounded-2xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white font-black uppercase"
                                                            >
                                                                Decline Proposal
                                                            </Button>
                                                            <Button 
                                                                onClick={() => setApproveConfirm(true)}
                                                                className="flex-2 h-16 rounded-2xl bg-primary text-white font-black uppercase tracking-widest shadow-2xl shadow-primary/20 hover:scale-[1.01] transition-all"
                                                            >
                                                                Authorize Request
                                                            </Button>
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Drawer.Content>
                </Drawer.Portal>
            </Drawer.Root>
        </section>
    );
}

export default function ApplicationsRegistrySuspense(props: { role: 'admin' | 'editor' }) {
    return (
        <Suspense fallback={<div className="p-32 text-center text-[10px] font-black text-primary/20 tracking-[0.3em] animate-pulse">SYNCHRONIZING VETTING PIPELINE...</div>}>
            <ApplicationsRegistry {...props} />
        </Suspense>
    );
}

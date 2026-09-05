'use client';

import { useState, useCallback, useMemo, Suspense, useTransition } from 'react';
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryStates, parseAsString } from 'nuqs';
import { useApplications } from "@/hooks/queries/useApplications";
import { useQueryClient } from '@tanstack/react-query';
import {
    approveApplication,
    rejectApplication,
    bulkApproveApplications,
    bulkRejectApplications
} from '@/actions/applications';
import type { Application, UserRole, ApplicationType, ApplicationStatus } from "@/db/types";
import { ApplicationItemCard } from './ApplicationItemCard';
import { ApplicationFilterBar } from './ApplicationFilterBar';
import { BulkActionsBar } from './BulkActionsBar';
import { ApplicationDrawerInspector } from './ApplicationDrawerInspector';

export type ApplicationsRegistryRole = Extract<UserRole, 'admin' | 'editor'>;

export function ApplicationsRegistry({ role: _panelRole }: { role: ApplicationsRegistryRole }) {
    const [filters, setFilters] = useQueryStates({
        role: parseAsString.withDefault('all'),
        status: parseAsString.withDefault('pending'),
        interest: parseAsString.withDefault('')
    }, { shallow: false, history: 'replace' });

    const { role, status, interest } = filters;

    const queryParams: { role?: ApplicationType; status?: ApplicationStatus; interest?: string } = {};
    if (role && role !== 'all') queryParams.role = role as ApplicationType;
    if (status && status !== 'all') queryParams.status = status as ApplicationStatus;

    const { data: applications = [], isLoading: loading } = useApplications(queryParams);

    const queryClient = useQueryClient();
    const [isPendingAction, startActionTransition] = useTransition();

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

    const pendingApps = useMemo(() => filteredApps.filter(app => app.status === 'pending'), [filteredApps]);

    // Filter selected IDs during render to ensure they only contain currently pending/filtered applications
    const currentSelectedIds = useMemo(() => {
        const pendingIds = new Set(pendingApps.map(app => app.id));
        return selectedIds.filter(id => pendingIds.has(id));
    }, [selectedIds, pendingApps]);

    const handleSelectAll = useCallback((checked: boolean) => {
        if (checked) setSelectedIds(pendingApps.map(app => app.id));
        else setSelectedIds([]);
    }, [pendingApps]);

    const toggleSelect = useCallback((id: number) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const handleApprove = async (id: number) => {
        const toastId = toast.loading("Processing approval...");
        startActionTransition(async () => {
            try {
                const res = await approveApplication(id);
                if (res.success) {
                    toast.success("Personnel candidacy authorized", { id: toastId });
                    setInspectApp(null);
                    setApproveConfirm(false);
                    queryClient.invalidateQueries({ queryKey: ['applications'] });
                } else {
                    toast.error(res.error || "Authorization failed", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
    };

    const handleReject = async (id: number, reason: string) => {
        if (reason.length < 20) {
            toast.error("Vetting rationale must be at least 20 characters");
            return;
        }
        const toastId = toast.loading("Processing rejection...");
        startActionTransition(async () => {
            try {
                const res = await rejectApplication(id, reason);
                if (res.success) {
                    toast.success("Proposal declined", { id: toastId });
                    setInspectApp(null);
                    setRejectionMode(false);
                    setRejectionReason("");
                    queryClient.invalidateQueries({ queryKey: ['applications'] });
                } else {
                    toast.error(res.error || "Rejection failed", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
    };

    const handleBulkApprove = async () => {
        if (currentSelectedIds.length === 0) return;
        const toastId = toast.loading(`Authorizing ${currentSelectedIds.length} candidates...`);
        startActionTransition(async () => {
            try {
                const res = await bulkApproveApplications(currentSelectedIds);
                if (res.success) {
                    toast.success("Collective authorization complete", { id: toastId });
                    setSelectedIds([]);
                    queryClient.invalidateQueries({ queryKey: ['applications'] });
                } else {
                    toast.error(res.error || "Bulk processing failed", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
    };

    const handleBulkReject = async (reason: string) => {
        if (currentSelectedIds.length === 0) return;
        if (reason.length < 20) {
            toast.error("Vetting rationale must be at least 20 characters");
            return;
        }
        const toastId = toast.loading(`Declining ${currentSelectedIds.length} proposals...`);
        startActionTransition(async () => {
            try {
                const res = await bulkRejectApplications(currentSelectedIds, reason);
                if (res.success) {
                    toast.success("Collective rejection processed", { id: toastId });
                    setSelectedIds([]);
                    setBulkRejectionMode(false);
                    setBulkRejectionReason("");
                    queryClient.invalidateQueries({ queryKey: ['applications'] });
                } else {
                    toast.error(res.error || "Bulk processing failed", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
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
            <ApplicationFilterBar
                interest={interest}
                role={role}
                status={status}
                onFilterChange={setFilters}
            />

            <BulkActionsBar
                pendingAppsCount={pendingApps.length}
                selectedCount={currentSelectedIds.length}
                isAllSelected={currentSelectedIds.length === pendingApps.length && pendingApps.length > 0}
                onSelectAll={handleSelectAll}
                onBulkApprove={handleBulkApprove}
                bulkRejectionMode={bulkRejectionMode}
                setBulkRejectionMode={setBulkRejectionMode}
                bulkRejectionReason={bulkRejectionReason}
                setBulkRejectionReason={setBulkRejectionReason}
                onBulkReject={handleBulkReject}
                isPendingAction={isPendingAction}
            />

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
                                    isSelected={currentSelectedIds.includes(app.id)}
                                    onToggle={toggleSelect}
                                    onInspect={setInspectApp}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ApplicationDrawerInspector
                inspectApp={inspectApp}
                onClose={() => {
                    setInspectApp(null);
                    setRejectionMode(false);
                    setApproveConfirm(false);
                }}
                rejectionMode={rejectionMode}
                setRejectionMode={setRejectionMode}
                rejectionReason={rejectionReason}
                setRejectionReason={setRejectionReason}
                approveConfirm={approveConfirm}
                setApproveConfirm={setApproveConfirm}
                onApprove={handleApprove}
                onReject={handleReject}
                isPendingAction={isPendingAction}
            />
        </section>
    );
}

export default function ApplicationsRegistrySuspense(props: { role: ApplicationsRegistryRole }) {
    return (
        <Suspense fallback={<div className="p-32 text-center text-[10px] font-black text-primary/20 tracking-[0.3em] animate-pulse">SYNCHRONIZING VETTING PIPELINE...</div>}>
            <ApplicationsRegistry {...props} />
        </Suspense>
    );
}

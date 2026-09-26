'use client';

import { useState, useCallback, useMemo, Suspense, useTransition } from 'react';
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useQueryStates, parseAsString } from 'nuqs';
import { useApplications } from "@/features/applications";
import { applicationKeys } from "@/features/applications";
import { useQueryClient } from '@tanstack/react-query';
import {
    bulkApproveApplications,
    bulkRejectApplications
} from '@/actions/applications';
import type { UserRole, ApplicationType, ApplicationStatus } from "@/db/types";
import { ApplicationItemCard } from './ApplicationItemCard';
import { ApplicationFilterBar } from './ApplicationFilterBar';
import { BulkActionsBar } from './BulkActionsBar';
import { QueryState } from "@/components/shared/QueryState";

export type ApplicationsRegistryRole = Extract<UserRole, 'admin' | 'editor'>;

export function ApplicationsRegistry({ role: panelRole }: { role: ApplicationsRegistryRole }) {
    const applicationsPath = panelRole === "admin" ? "/admin/applications" : "/editor/applications";
    const [filters, setFilters] = useQueryStates({
        role: parseAsString.withDefault('all'),
        status: parseAsString.withDefault('pending'),
        interest: parseAsString.withDefault('')
    }, { shallow: false, history: 'replace' });

    const { role, status, interest } = filters;

    const queryParams: { role?: ApplicationType; status?: ApplicationStatus; interest?: string } = {};
    if (role && role !== 'all') queryParams.role = role as ApplicationType;
    if (status && status !== 'all') queryParams.status = status as ApplicationStatus;

    const {
        data: applications = [],
        isLoading: loading,
        isError,
        error,
    } = useApplications(queryParams);

    const queryClient = useQueryClient();
    const [isPendingAction, startActionTransition] = useTransition();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [bulkRejectionMode, setBulkRejectionMode] = useState(false);
    const [bulkRejectionReason, setBulkRejectionReason] = useState("");

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

    const handleBulkApprove = async () => {
        if (currentSelectedIds.length === 0) return;
        const toastId = toast.loading(`Authorizing ${currentSelectedIds.length} candidates...`);
        startActionTransition(async () => {
            try {
                const res = await bulkApproveApplications(currentSelectedIds);
                if (res.success) {
                    toast.success("Collective authorization complete", { id: toastId });
                    setSelectedIds([]);
                    queryClient.invalidateQueries({ queryKey: applicationKeys.all });
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
                    queryClient.invalidateQueries({ queryKey: applicationKeys.all });
                } else {
                    toast.error(res.error || "Bulk processing failed", { id: toastId });
                }
            } catch {
                toast.error("Internal system error", { id: toastId });
            }
        });
    };

    return (
        <QueryState
            isLoading={loading}
            isError={isError}
            error={error}
            loadingLabel="Accessing vetting pipeline..."
        >
          <section className="flex-1 flex flex-col min-h-0 space-y-3 sm:space-y-4">
            <header className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="mb-1 text-2xl font-bold text-foreground">Applications</h1>
                    <p className="m-0 text-body-sm text-muted-foreground">Review candidate profiles, supporting documents, and appointment requests.</p>
                </div>
                <p className="m-0 text-label font-semibold text-muted-foreground">
                    {filteredApps.length} {filteredApps.length === 1 ? "application" : "applications"}
                </p>
            </header>
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

            <div className="grid grid-cols-1 gap-3">
                {filteredApps.length === 0 ? (
                    <div className="flex min-h-[min(55vh,36rem)] w-full flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-card px-6 py-12 text-center">
                        <AlertCircle className="mb-3 h-10 w-10 text-muted-foreground" aria-hidden="true" />
                        <p className="m-0 text-body-sm text-muted-foreground">No matching dossiers found</p>
                    </div>
                ) : (
                    <div 
                        className="flex-1 min-h-0 bg-card rounded-xl border border-border/70 overflow-y-auto custom-scrollbar p-3 sm:p-4 shadow-2xs"
                        data-lenis-prevent
                    >
                        <div className="space-y-3">
                            {filteredApps.map((app) => (
                                <ApplicationItemCard 
                                    key={app.id}
                                    app={app}
                                    isSelected={currentSelectedIds.includes(app.id)}
                                    onToggle={toggleSelect}
                                    detailHref={`${applicationsPath}/${app.id}`}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

          </section>
        </QueryState>
    );
}

export default function ApplicationsRegistrySuspense(props: { role: ApplicationsRegistryRole }) {
    return (
        <Suspense fallback={<div className="p-32 text-center text-label font-black text-primary tracking-[0.3em] animate-pulse">SYNCHRONIZING VETTING PIPELINE...</div>}>
            <ApplicationsRegistry {...props} />
        </Suspense>
    );
}

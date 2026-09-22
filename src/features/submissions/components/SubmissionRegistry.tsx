"use client";

import { AlertTriangle, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import SubmissionContainer from '@/features/submissions/components/SubmissionContainer';
import SubmissionTabs, { type SubmissionTabValue } from '@/features/submissions/components/SubmissionTabs';
import SubmissionStats from '@/features/submissions/components/SubmissionStats';

import type { SubmissionUI, SubmissionStats as SubmissionStatsData } from '@/db/contracts';
import type { StaffRole } from '@/db/types';

interface SubmissionRegistryProps {
    submissions: SubmissionUI[];
    stats: SubmissionStatsData;
    currentStatus?: SubmissionTabValue;
    role: StaffRole;
}

export default function SubmissionRegistry({ 
    submissions, 
    stats, 
    currentStatus = 'all',
    role 
}: SubmissionRegistryProps) {
    const [selectedStatus, setSelectedStatus] = useState<SubmissionTabValue>(currentStatus);

    const filteredSubmissions = useMemo(() => {
        if (selectedStatus === 'all') return submissions;
        return submissions.filter(sub => sub.status === selectedStatus);
    }, [selectedStatus, submissions]);

    return (
        <section className="space-y-4">
            {/* Header Section */}
            <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-3 border-b border-border/70 pb-3 sm:pb-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/20 text-primary shadow-xs">
                            <Plus className="w-4 h-4" />
                        </div>
                        <h1 className="panel-title m-0 font-bold text-primary">
                            {role === 'admin' ? 'Manuscript Registry' : 'Editorial Hub'}
                        </h1>
                    </div>
                    <p className="panel-subtitle border-l-2 border-primary/20 pl-3 py-0.5 max-w-2xl leading-relaxed m-0 text-body-sm text-muted-foreground">
                        {role === 'admin' 
                            ? 'Review and manage submitted manuscripts.'
                            : 'Manage peer review and editorial decisions.'}
                    </p>
                </div>
            </header>

            {/* Performance Overviews */}
            <SubmissionStats stats={stats} />

            {/* Main Content Area */}
            <Card className="border-border/70 shadow-2xs overflow-hidden bg-card rounded-xl">
                <CardContent className="p-0">
                    <div className="p-3 sm:p-4 border-b border-border/70 bg-muted/20">
                        <SubmissionTabs
                            currentStatus={selectedStatus}
                            onStatusChange={setSelectedStatus}
                        />
                    </div>

                    <SubmissionContainer
                        submissions={filteredSubmissions}
                        role={role}
                    />

                    <div className="p-3 sm:p-4 border-t border-border/70 flex items-center justify-center bg-muted/20">
                        <p className="text-meta">
                            Registry Total: <span className="font-semibold text-foreground">{filteredSubmissions.length}</span> records in selection
                        </p>
                    </div>
                </CardContent>
            </Card>

            {filteredSubmissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 bg-card border border-dashed border-border/70 rounded-2xl space-y-4">
                    <AlertTriangle className="w-12 h-12 text-muted-foreground/30" />
                    <p className="text-body-sm text-muted-foreground">No active records in this database segment</p>
                </div>
            )}
        </section>
    );
}

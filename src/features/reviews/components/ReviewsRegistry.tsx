'use client';

import { useState, useEffect, useMemo, useCallback, Suspense, startTransition, useTransition } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Badge } from "@/components/ui/badge";
import { useActiveReviews, useUnassignedPapers } from '@/hooks/queries/useReviews';
import type { ReviewAssignment } from '@/hooks/queries/useReviews';
import { useUsers } from '@/hooks/queries/useUsers';
import { type UserRole } from "@/db/types";
import { decideSubmission, autoSyncManuscriptToPdf, requestResubmissionWithComments } from '@/actions/submissions';
import { useQueryClient } from '@tanstack/react-query';
import { assignReviewer, submitReview } from '@/actions/reviews';

import { ReviewItemCard } from './ReviewItemCard';
import { GroupedReviewCard, type GroupedReview } from './GroupedReviewCard';
import { AssignReviewerDialog } from './AssignReviewerDialog';
import { ReviewsFilterBar } from './ReviewsFilterBar';

export type ReviewsRegistryRole = Extract<UserRole, 'admin' | 'editor' | 'reviewer'>;

export function ReviewsRegistry({ role }: { role: ReviewsRegistryRole }) {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const reviewerId = role === 'reviewer' ? (session?.user as { id?: string })?.id : undefined;
    const assignIdFromUrl = searchParams.get('assign');

    const { data: reviews = [], isLoading: loadingReviews, refetch: refetchReviews } = useActiveReviews(reviewerId);
    const { data: unassigned = [], isLoading: loadingUnassigned } = useUnassignedPapers();
    const { data: staff = [], isLoading: loadingStaff } = useUsers('reviewer');
    const sortedStaff = useMemo(() => {
        return [...staff].sort((a, b) => {
            const aTime = a.lastActiveAt ? new Date(a.lastActiveAt).getTime() : 0;
            const bTime = b.lastActiveAt ? new Date(b.lastActiveAt).getTime() : 0;
            return bTime - aTime;
        });
    }, [staff]);
    const router = useRouter();
    const queryClient = useQueryClient();

    const [isAssigning, startAssign] = useTransition();

    const loading = loadingReviews || loadingUnassigned || loadingStaff;

    const [showAssignModal, setShowAssignModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>(assignIdFromUrl || "");
    const [isConverting, setIsConverting] = useState(false);

    const handleAutoConvert = async () => {
        if (!selectedSubmissionId) return;
        setIsConverting(true);
        const tid = toast.loading("Converting archive...");
        try {
            const res = await autoSyncManuscriptToPdf(parseInt(selectedSubmissionId));
            if (res.success) {
                toast.success("Manuscript synchronized", { id: tid });
                queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
                router.refresh();
            } else {
                toast.error(res.error || "Conversion failed", { id: tid });
            }
        } catch {
            toast.error("Failed to connect to conversion engine", { id: tid });
        } finally {
            setIsConverting(false);
        }
    };

    useEffect(() => {
        const assignId = searchParams.get('assign');
        if (assignId) {
            startTransition(() => {
                setShowAssignModal(true);
                setSelectedSubmissionId(assignId);
            });
        }
    }, [searchParams]);

    const handleAccept = useCallback((item: ReviewAssignment) => {
        toast('Authorize acceptance for this manuscript?', {
            action: {
                label: 'Confirm Accept',
                onClick: async () => {
                    const res = await decideSubmission(item.submissionId, 'accepted');
                    if (res.success) {
                        toast.success('Accepted');
                        queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews, queryClient]);

    const handleReject = useCallback((item: ReviewAssignment) => {
        toast('Commit final rejection?', {
            action: {
                label: 'Confirm Reject',
                onClick: async () => {
                    const res = await decideSubmission(item.submissionId, 'rejected');
                    if (res.success) {
                        toast.success('Rejected');
                        queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews, queryClient]);

    const handleFeedbackSubmit = useCallback(async (item: ReviewAssignment, formData: FormData) => {
        const toastId = toast.loading('Submitting...');
        try {
            const result = await submitReview(item.id, formData);
            if (result.success) {
                toast.success('Feedback committed', { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                await refetchReviews();
            } else {
                toast.error(result.error, { id: toastId });
            }
        } catch {
            toast.error('Failed to submit findings', { id: toastId });
        }
    }, [refetchReviews, queryClient]);

    const handleAcceptGroup = useCallback((submissionId: number) => {
        toast('Authorize acceptance for this manuscript?', {
            action: {
                label: 'Confirm Accept',
                onClick: async () => {
                    const res = await decideSubmission(submissionId, 'accepted');
                    if (res.success) {
                        toast.success('Accepted');
                        queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews, queryClient]);

    const handleRejectGroup = useCallback((submissionId: number) => {
        toast('Commit final rejection?', {
            action: {
                label: 'Confirm Reject',
                onClick: async () => {
                    const res = await decideSubmission(submissionId, 'rejected');
                    if (res.success) {
                        toast.success('Rejected');
                        queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                        refetchReviews();
                    } else toast.error(res.error);
                }
            },
            cancel: {
                label: 'Cancel',
                onClick: () => {}
            }
        });
    }, [refetchReviews, queryClient]);

    const handleRevisionGroup = useCallback(async (submissionId: number, comments: string) => {
        const toastId = toast.loading('Submitting revision request...');
        try {
            const res = await requestResubmissionWithComments(submissionId, comments);
            if (res.success) {
                toast.success('Revision request committed', { id: toastId });
                queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
                refetchReviews();
            } else {
                toast.error(res.error, { id: toastId });
            }
        } catch {
            toast.error('Failed to submit revision request', { id: toastId });
        }
    }, [refetchReviews, queryClient]);

    const handleAssign = useCallback((formData: FormData) => {
        startAssign(async () => {
            const res = await assignReviewer(formData);
            if (res.success) {
                toast.success('Reviewer assigned');
                setShowAssignModal(false);
                queryClient.invalidateQueries({ queryKey: ['reviews'] });
                queryClient.invalidateQueries({ queryKey: ['unassignedPapers'] });
                queryClient.invalidateQueries({ queryKey: ['notificationCounts'] });
            } else {
                toast.error(res.error);
            }
        });
    }, [queryClient]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r => {
            const matchesSearch =
                r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (r.reviewerName || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                r.paperId.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [reviews, searchQuery, statusFilter]);

    const isInternalStaff = role === 'admin' || role === 'editor';

    const groupedReviews = useMemo(() => {
        if (!isInternalStaff) return [];
        const groupsMap = new Map<number, GroupedReview>();
        for (const r of filteredReviews) {
            if (!groupsMap.has(r.submissionId)) {
                groupsMap.set(r.submissionId, {
                    submissionId: r.submissionId,
                    paperId: r.paperId,
                    title: r.title,
                    submissionStatus: r.submissionStatus,
                    assignments: []
                });
            }
            groupsMap.get(r.submissionId)!.assignments.push(r);
        }
        return Array.from(groupsMap.values());
    }, [filteredReviews, isInternalStaff]);

    if (loading) {
        return (
            <div className="p-32 text-center space-y-6">
                <div className="w-14 h-14 border-[3px] border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="font-semibold text-muted-foreground text-xs animate-pulse">Loading reviews...</p>
            </div>
        );
    }

    return (
        <section className="space-y-8 pb-20">
            {/* Header Section */}
            <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-8 border-b border-border/50 pb-10">
                <div className="space-y-4">
                    <h1 className="text-2xl 2xl:text-3xl font-bold text-primary tracking-tight">
                        {role === 'reviewer' ? 'Reviews' : 'Manage Reviews'}
                    </h1>
                    <p className="text-sm font-medium text-muted-foreground max-w-2xl leading-relaxed">
                        {role === 'reviewer'
                            ? 'Technical evaluation portal for manuscript review workflows.'
                            : 'Global administration of editorial integrity and peer-review lifecycle.'}
                    </p>
                </div>
                {isInternalStaff && (
                    <AssignReviewerDialog
                        open={showAssignModal}
                        onOpenChange={setShowAssignModal}
                        unassigned={unassigned}
                        sortedStaff={sortedStaff}
                        selectedSubmissionId={selectedSubmissionId}
                        onSelectedSubmissionIdChange={setSelectedSubmissionId}
                        onAutoConvert={handleAutoConvert}
                        isConverting={isConverting}
                        onAssign={handleAssign}
                        isAssigning={isAssigning}
                    />
                )}
            </header>

            {/* Filters */}
            <ReviewsFilterBar
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />

            {/* List */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 px-2">
                    <h2 className="text-[10px] font-bold text-primary tracking-[0.4em] uppercase opacity-40">Registry queue</h2>
                    <Badge variant="outline" className="text-[10px] font-bold text-primary/40 bg-primary/5 border-none">
                        {isInternalStaff ? groupedReviews.length : filteredReviews.length}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {isInternalStaff ? (
                        groupedReviews.map((group) => (
                            <GroupedReviewCard
                                key={group.submissionId}
                                group={group}
                                onAccept={handleAcceptGroup}
                                onReject={handleRejectGroup}
                                onRevision={handleRevisionGroup}
                            />
                        ))
                    ) : (
                        filteredReviews.map((item) => (
                            <ReviewItemCard
                                key={item.id}
                                item={item}
                                user={session?.user}
                                isInternalStaff={isInternalStaff}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                onFeedbackSubmit={handleFeedbackSubmit}
                            />
                        ))
                    )}

                    {((isInternalStaff && groupedReviews.length === 0) || (!isInternalStaff && filteredReviews.length === 0)) && (
                        <div className="py-32 text-center bg-primary/2 border-2 border-dashed border-primary/5 rounded-xl space-y-4">
                            <ShieldAlert className="w-12 h-12 text-primary/10 mx-auto" />
                            <p className="text-[10px] font-bold text-primary/30 uppercase tracking-widest">No matching evaluations found</p>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default function ReviewsRegistrySuspense(props: { role: 'admin' | 'editor' | 'reviewer' }) {
    return (
        <Suspense fallback={<div className="p-20 text-center text-[10px] font-bold text-primary/20 tracking-widest animate-pulse">SYNCHRONIZING INTERFACE...</div>}>
            <ReviewsRegistry {...props} />
        </Suspense>
    );
}

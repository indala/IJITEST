import { useQuery } from '@tanstack/react-query';
import { getActiveReviews, getUnassignedAcceptedPapers } from '@/actions/reviews';
import type { ActiveReview, UnassignedPaper } from '@/db/types';

export type ReviewAssignment = ActiveReview;
export type { UnassignedPaper };

export function useActiveReviews(reviewerId?: string) {
    return useQuery<ActiveReview[]>({
        queryKey: ['reviews', reviewerId],
        queryFn: async () => {
            const res = await getActiveReviews(reviewerId);
            return res.success ? (res.data as ActiveReview[]) ?? [] : [];
        }
    });
}

export function useUnassignedPapers() {
    return useQuery<UnassignedPaper[]>({
        queryKey: ['unassignedPapers'],
        queryFn: async () => {
            const res = await getUnassignedAcceptedPapers();
            return res.success ? (res.data as UnassignedPaper[]) ?? [] : [];
        }
    });
}


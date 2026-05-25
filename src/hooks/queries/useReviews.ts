import { useQuery } from '@tanstack/react-query';
import { getActiveReviews, getUnassignedAcceptedPapers } from '@/actions/reviews';

export interface ReviewAssignment {
    id: number;
    status: 'assigned' | 'completed' | 'withdrawn';
    assignedAt: string | Date | null;
    deadline: string | Date;
    reviewRound: number;
    submissionId: number;
    paperId: string;
    title: string;
    reviewerName: string;
    decision?: string | null;
    commentsToAuthor?: string | null;
    submittedAt?: string | null;
    submissionStatus: string;
    manuscriptPath?: string;
    feedbackFilePath?: string;
}

export interface UnassignedPaper {
    id: number;
    paperId: string;
    title: string;
    pdfUrl?: string;
}

export function useActiveReviews(reviewerId?: string) {
    return useQuery<ReviewAssignment[]>({
        queryKey: ['reviews', reviewerId],
        queryFn: async () => {
            const res = await getActiveReviews(reviewerId);
            return res.success ? (res.data as ReviewAssignment[]) ?? [] : [];
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


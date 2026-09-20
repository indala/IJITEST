"use client";

import { useQuery } from "@tanstack/react-query";
import { reviewQueryOptions } from "@/features/reviews/queries/review.options";

export function useActiveReviews(reviewerId?: string) {
    return useQuery(reviewQueryOptions.active(reviewerId));
}

export function useUnassignedPapers() {
    return useQuery(reviewQueryOptions.unassignedPapers());
}

import { queryOptions } from "@tanstack/react-query";
import {
    getActiveReviews,
    getUnassignedAcceptedPapers,
} from "@/actions/reviews";
import { unwrapAction } from "@/lib/query/action-query";
import { reviewKeys } from "./review.keys";
import type {
    ActiveReview,
    UnassignedPaper,
} from "../types/review.types";

export const reviewQueryOptions = {
    active: (reviewerId?: string) => queryOptions({
        queryKey: reviewKeys.active(reviewerId),
        queryFn: () => unwrapAction<ActiveReview[]>(() => getActiveReviews(reviewerId)),
    }),

    unassignedPapers: () => queryOptions({
        queryKey: reviewKeys.unassignedPapers(),
        queryFn: () => unwrapAction<UnassignedPaper[]>(getUnassignedAcceptedPapers),
    }),
};

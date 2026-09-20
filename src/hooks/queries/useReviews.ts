/**
 * Compatibility exports. New code should import from @/features/reviews.
 */
export {
    useActiveReviews,
    useUnassignedPapers,
} from "@/features/reviews";
export type {
    ActiveReview,
    ReviewAssignment,
    UnassignedPaper,
} from "@/features/reviews";

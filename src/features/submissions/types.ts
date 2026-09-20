/**
 * Submission feature types.
 *
 * Runtime validation belongs in schemas/submission.schema.ts.
 * Database row models belong in @/db/models.
 * These aliases describe values and projections used by this feature.
 */
import type {
    AuthorSubmissionDetail,
    SubmissionDetail,
    SubmissionStats,
    SubmissionUI,
} from "@/db/contracts";
import type {
    CoAuthorValues,
    FormValues,
    ReviewerSuggestionValues,
} from "./schemas/submission.schema";

export type SubmissionFormValues = FormValues;
export type SubmissionCoAuthorInput = CoAuthorValues;
export type SubmissionReviewerSuggestionInput = ReviewerSuggestionValues;

export type {
    AuthorSubmissionDetail,
    SubmissionDetail,
    SubmissionStats,
    SubmissionUI,
};

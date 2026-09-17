/**
 * Application-facing projections, action responses, and route contracts.
 *
 * These types describe data crossing server-action, page, and component
 * boundaries rather than raw database rows.
 */
export type {
    ActionResponse,
    SuccessResponse,
    ErrorResponse,
    SafeUser,
    SafeUserWithProfile,
    UserWithProfile,
    ProfileData,
    SubmissionDetail,
    SubmissionUI,
    SubmissionStats,
    PaymentRow,
    UnpaidPaperRow,
    PaperWithPublication,
    AuthorDashboardSubmission,
    AuthorSubmissionDetail,
    ContactMessageRow,
    PublishedPaperUI,
    RelatedArticle,
    PaperDetailParams,
    SubmissionIdParam,
    TrackedManuscript,
    ReviewerPerformanceMetrics,
    ActiveReview,
    UnassignedPaper,
    SubmissionEventWithActor,
} from './types';

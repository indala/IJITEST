import type { SubmissionStatus } from "@/db/types";

/**
 * Valid state transitions for manuscripts across the editorial review lifecycle.
 * Adheres strictly to COPE guidelines and OJS parity.
 */
export const ALLOWED_SUBMISSION_TRANSITIONS: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
    submitted: ['editorAssigned', 'underReview', 'rejected'],
    editorAssigned: ['underReview', 'revisionRequested', 'rejected'],
    underReview: ['revisionRequested', 'accepted', 'rejected'],
    revisionRequested: ['underReview', 'accepted', 'rejected'],
    accepted: ['paymentPending', 'published'],
    paymentPending: ['published', 'accepted'],
    published: ['retracted', 'corrigendum'],
    retracted: [], // Terminal state
    rejected: [],  // Terminal state
    corrigendum: ['retracted'], // Retraction can still occur post-corrigendum if major flaw found
};

/**
 * Checks if a status transition is permitted from the current manuscript state.
 */
export function canTransitionSubmission(
    current: SubmissionStatus,
    target: SubmissionStatus
): boolean {
    if (current === target) return true;
    const allowed = ALLOWED_SUBMISSION_TRANSITIONS[current];
    return allowed.includes(target);
}

/**
 * Returns human-readable label for a submission status.
 */
export function getSubmissionStatusLabel(status: SubmissionStatus): string {
    switch (status) {
        case 'submitted':
            return 'Manuscript Submitted';
        case 'editorAssigned':
            return 'Editor Assigned';
        case 'underReview':
            return 'Under Peer Review';
        case 'revisionRequested':
            return 'Revision Requested';
        case 'accepted':
            return 'Accepted for Publication';
        case 'rejected':
            return 'Declined / Rejected';
        case 'paymentPending':
            return 'Payment Pending';
        case 'published':
            return 'Published';
        case 'retracted':
            return 'Retracted';
        case 'corrigendum':
            return 'Corrigendum / Errata';
        default:
            return status;
    }
}

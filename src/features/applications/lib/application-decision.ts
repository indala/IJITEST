export const MIN_REJECTION_REASON_LENGTH = 20;

export function getRejectionReasonError(reason: string): string | null {
    if (reason.trim().length < MIN_REJECTION_REASON_LENGTH) {
        return `Rejection reason must be at least ${MIN_REJECTION_REASON_LENGTH} characters long.`;
    }

    return null;
}

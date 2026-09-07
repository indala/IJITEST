import "server-only";

export const CACHE_TAGS = {
    // Global Configs & Settings
    SETTINGS: "settings",
    
    // Public Facing Pages & Data
    PUBLIC_DATA: "public-data",
    PUBLICATIONS: "publications",
    LATEST_ISSUE: "latest-issue",
    ARCHIVES: "archives",
    SUBMISSIONS: "submissions",
    EDITORIAL_BOARD: "editorial-board",
    
    // Entity-Specific Tag Builders (Parameterized)
    SUBMISSION: (id: number | string) => `submission-${id}`,
    PAPER: (paperId: string) => `paper-${paperId}`,
    
    // User-Specific Badge Count Tag Builders (Parameterized)
    REVIEWER_ASSIGNMENTS_COUNT: (userId: string) => `reviewer-assignments-count-${userId}`,
    AUTHOR_ACTIONS_COUNT: (userId: string) => `author-actions-count-${userId}`,
    USER_NOTIFICATIONS: (userId: string) => `user-notifications-${userId}`,
    USER_NOTIFICATIONS_UNREAD_COUNT: (userId: string) => `user-notifications-unread-count-${userId}`,
    
    // Global Admin/Editor Badge Count Tags
    MESSAGES_PENDING_COUNT: "messages-pending-count",
    SUBMISSIONS_SUBMITTED_COUNT: "submissions-submitted-count"
} as const;

export type CacheTagType = typeof CACHE_TAGS[keyof Omit<typeof CACHE_TAGS, 'SUBMISSION' | 'PAPER' | 'REVIEWER_ASSIGNMENTS_COUNT' | 'AUTHOR_ACTIONS_COUNT' | 'USER_NOTIFICATIONS' | 'USER_NOTIFICATIONS_UNREAD_COUNT'>];

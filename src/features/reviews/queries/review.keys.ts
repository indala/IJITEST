import { notificationKeys } from "@/features/notifications";

export const reviewKeys = {
    all: ["reviews"] as const,
    active: (reviewerId?: string) =>
        [...reviewKeys.all, "active", reviewerId ?? "current-user"] as const,
    unassignedPapers: () => [...reviewKeys.all, "unassigned-papers"] as const,
    metrics: () => [...reviewKeys.all, "metrics"] as const,
    notifications: notificationKeys.counts,
};

import { notificationKeys } from "@/features/notifications";
import { submissionKeys } from "@/features/submissions";

export const paymentKeys = {
    all: ["payments"] as const,
    list: () => [...paymentKeys.all, "list"] as const,
    unpaidPapers: () => [...paymentKeys.all, "unpaid-papers"] as const,
    notifications: notificationKeys.counts,
    submissions: () => submissionKeys.all,
};

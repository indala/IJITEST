import { notificationKeys } from "@/features/notifications";
import type { MessageFilters } from "@/features/messages/types/message.types";

export const messageKeys = {
    all: ["messages"] as const,
    lists: () => [...messageKeys.all, "list"] as const,
    list: (filters?: MessageFilters) =>
        [...messageKeys.lists(), filters ?? {}] as const,
    counts: notificationKeys.counts,
};

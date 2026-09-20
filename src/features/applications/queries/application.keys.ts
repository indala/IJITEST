import type { ApplicationFilters } from "@/features/applications/types/application.types";

export const applicationKeys = {
    all: ["applications"] as const,
    lists: () => [...applicationKeys.all, "list"] as const,
    list: (filters?: ApplicationFilters) =>
        [...applicationKeys.lists(), filters ?? {}] as const,
};

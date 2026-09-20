"use client";

import { useQuery } from "@tanstack/react-query";
import { applicationQueryOptions } from "@/features/applications/queries/application.options";
import type { ApplicationFilters } from "@/features/applications/types/application.types";

export function useApplications(filters?: ApplicationFilters) {
    return useQuery(applicationQueryOptions.list(filters));
}

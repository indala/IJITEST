import { queryOptions } from "@tanstack/react-query";
import { getApplications } from "@/actions/applications";
import type { Application } from "@/db/models";
import { unwrapAction } from "@/lib/query/action-query";
import { applicationKeys } from "./application.keys";
import type { ApplicationFilters } from "../types/application.types";

export const applicationQueryOptions = {
    list: (filters?: ApplicationFilters) => queryOptions({
        queryKey: applicationKeys.list(filters),
        queryFn: () => unwrapAction<Application[]>(() => getApplications(filters)),
    }),
};

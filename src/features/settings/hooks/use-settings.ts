"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { settingsQueryOptions } from "@/features/settings/queries/settings.options";
import { settingsMutationOptions } from "@/features/settings/queries/settings.mutations";

export function useSettings() {
    return useQuery(settingsQueryOptions);
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation(settingsMutationOptions.update(queryClient));
}

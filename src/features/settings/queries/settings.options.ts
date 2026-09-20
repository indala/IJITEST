import { queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/settings";
import { unwrapAction } from "@/lib/query/action-query";
import { settingsKeys } from "./settings.keys";

export const settingsQueryOptions = queryOptions({
    queryKey: settingsKeys.all,
    queryFn: () => unwrapAction<Record<string, string>>(getSettings),
});

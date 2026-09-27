import { queryOptions } from "@tanstack/react-query";
import { getSettings } from "@/actions/settings";
import { unwrapAction } from "@/lib/query/action-query";
import type { JournalSettings } from "@/db/protocols";
import { settingsKeys } from "./settings.keys";

export const settingsQueryOptions = queryOptions({
    queryKey: settingsKeys.all,
    queryFn: () => unwrapAction<JournalSettings>(getSettings),
});

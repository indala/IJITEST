import { queryOptions } from "@tanstack/react-query";
import {
    getArchivePapers,
    getLatestIssuePapers,
    getPublishedPapers,
} from "@/actions/archives";
import { getLatestPublishedIssue } from "@/actions/publications";
import { getEditorialBoard } from "@/actions/users";
import { trackManuscript } from "@/actions/track";
import type { Issue } from "@/db/models";
import type { PublishedPaperUI, SafeUserWithProfile } from "@/db/contracts";
import { unwrapAction } from "@/lib/query/action-query";
import {
    QUERY_GC_TIMES,
    QUERY_STALE_TIMES,
} from "@/lib/query/query-client";
import { publicKeys } from "./public.keys";

export const publicQueryOptions = {
    editorialBoard: () => queryOptions({
        queryKey: publicKeys.editorialBoard(),
        queryFn: () => unwrapAction<SafeUserWithProfile[]>(getEditorialBoard),
        staleTime: QUERY_STALE_TIMES.publicContent * 3,
        gcTime: QUERY_GC_TIMES.publicContent,
    }),

    archives: () => queryOptions({
        queryKey: publicKeys.archives(),
        queryFn: () => unwrapAction<PublishedPaperUI[]>(getPublishedPapers),
        staleTime: QUERY_STALE_TIMES.publicContent,
        gcTime: QUERY_GC_TIMES.default,
    }),

    latestIssuePapers: (enabled = true) => queryOptions({
        queryKey: publicKeys.currentIssue(),
        queryFn: () => unwrapAction<PublishedPaperUI[]>(getLatestIssuePapers),
        staleTime: QUERY_STALE_TIMES.publicContent,
        gcTime: QUERY_GC_TIMES.default,
        enabled,
    }),

    archivePapers: (enabled = true) => queryOptions({
        queryKey: publicKeys.archivePapers(),
        queryFn: () => unwrapAction<PublishedPaperUI[]>(getArchivePapers),
        staleTime: QUERY_STALE_TIMES.publicContent,
        gcTime: QUERY_GC_TIMES.default,
        enabled,
    }),

    latestIssue: () => queryOptions({
        queryKey: publicKeys.latestIssue(),
        queryFn: () => unwrapAction<Issue>(getLatestPublishedIssue),
        staleTime: QUERY_STALE_TIMES.default,
        gcTime: QUERY_GC_TIMES.short,
    }),

    track: (paperId: string, email?: string, enabled = false) => queryOptions({
        queryKey: publicKeys.track(paperId, email ?? ""),
        queryFn: () => unwrapAction(() => trackManuscript(paperId, email)),
        enabled: enabled && Boolean(paperId),
        staleTime: 0,
        retry: false,
    }),
};

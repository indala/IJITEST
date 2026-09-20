"use client";

import { useQuery } from "@tanstack/react-query";
import { publicQueryOptions } from "@/features/public/queries/public.options";

export function useEditorialBoard() {
    return useQuery(publicQueryOptions.editorialBoard());
}

export function usePublicArchives() {
    return useQuery(publicQueryOptions.archives());
}

export function useLatestIssuePapers(options?: { enabled?: boolean }) {
    return useQuery(publicQueryOptions.latestIssuePapers(options?.enabled ?? true));
}

export function useArchivePapers(options?: { enabled?: boolean }) {
    return useQuery(publicQueryOptions.archivePapers(options?.enabled ?? true));
}

export function useLatestIssue() {
    return useQuery(publicQueryOptions.latestIssue());
}

export function useTrackManuscript(
    paperId: string,
    email?: string,
    enabled = false,
) {
    return useQuery(publicQueryOptions.track(paperId, email, enabled));
}

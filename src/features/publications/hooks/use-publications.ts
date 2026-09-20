"use client";

import { useQuery } from "@tanstack/react-query";
import { publicationQueryOptions } from "@/features/publications/queries/publication.options";

export function useVolumesIssues() {
    return useQuery(publicationQueryOptions.issues());
}

export function usePapersByIssue(issueId: number | null) {
    return useQuery(publicationQueryOptions.issuePapers(issueId));
}

import { queryOptions } from "@tanstack/react-query";
import { getPapersByIssueId, getVolumesIssues } from "@/actions/publications";
import type { PaperWithPublication } from "@/db/contracts";
import type { Issue } from "@/db/models";
import { unwrapAction } from "@/lib/query/action-query";
import { publicationKeys } from "./publication.keys";

export const publicationQueryOptions = {
    issues: () => queryOptions({
        queryKey: publicationKeys.issues(),
        queryFn: () => unwrapAction<(Issue & { paperCount: number })[]>(getVolumesIssues),
    }),

    issuePapers: (issueId: number | null) => queryOptions({
        queryKey: publicationKeys.issuePapers(issueId),
        queryFn: () => unwrapAction<PaperWithPublication[]>(
            () => getPapersByIssueId(issueId as number),
        ),
        enabled: issueId !== null,
    }),
};

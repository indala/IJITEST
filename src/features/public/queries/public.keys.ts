export const publicKeys = {
    all: ["public"] as const,
    archives: () => [...publicKeys.all, "archives"] as const,
    currentIssue: () => [...publicKeys.all, "current-issue-papers"] as const,
    archivePapers: () => [...publicKeys.all, "archive-papers"] as const,
    latestIssue: () => [...publicKeys.all, "latest-issue"] as const,
    editorialBoard: () => [...publicKeys.all, "editorial-board"] as const,
    track: (paperId: string, email: string) =>
        [...publicKeys.all, "track", paperId, email] as const,
};

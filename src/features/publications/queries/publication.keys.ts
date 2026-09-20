export const publicationKeys = {
    all: ["publications"] as const,
    issues: () => [...publicationKeys.all, "issues"] as const,
    issuePapers: (issueId: number | null) =>
        [...publicationKeys.all, "issue-papers", issueId] as const,
};

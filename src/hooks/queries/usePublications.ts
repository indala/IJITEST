import { useQuery } from '@tanstack/react-query';
import type { Issue, PaperWithPublication } from '@/db/types';
import {
    getVolumesIssues,
    getPapersByIssueId,
} from '@/actions/publications';

export function useVolumesIssues() {
    return useQuery<(Issue & { paperCount: number })[]>({
        queryKey: ['volumes-issues'],
        queryFn: async () => {
            const res = await getVolumesIssues();
            return res.success ? res.data ?? [] : [];
        },
    });
}

export function usePapersByIssue(issueId: number | null) {
    return useQuery<PaperWithPublication[]>({
        queryKey: ['issue-papers', issueId],
        queryFn: async () => {
            if (!issueId) return [];
            const res = await getPapersByIssueId(issueId);
            return res.success ? res.data ?? [] : [];
        },
        enabled: !!issueId,
    });
}

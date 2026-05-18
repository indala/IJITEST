import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplications, approveApplication, rejectApplication, bulkApproveApplications, bulkRejectApplications } from '@/actions/applications';
import type { Application } from '@/db/types';

export function useApplications(filters?: { role?: string, status?: string, interest?: string }) {
    return useQuery<Application[]>({
        queryKey: ['applications', filters],
        queryFn: async () => {
            const res = await getApplications(filters || {});
            return res.success ? res.data || [] : [];
        }
    });
}

export function useApproveApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => approveApplication(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}

export function useRejectApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: number, reason: string }) => rejectApplication(id, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}

export function useBulkApproveApplications() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (ids: number[]) => bulkApproveApplications(ids),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}

export function useBulkRejectApplications() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, reason }: { ids: number[], reason: string }) => bulkRejectApplications(ids, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['applications'] });
        }
    });
}

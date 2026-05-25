import { useQuery } from '@tanstack/react-query';
import { getApplications } from '@/actions/applications';
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

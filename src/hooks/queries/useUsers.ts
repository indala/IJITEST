import { useQuery } from '@tanstack/react-query';
import { getUsers } from '@/actions/users';
import type { SafeUserWithProfile } from '@/db/types';

export function useUsers(role?: string) {
    return useQuery<SafeUserWithProfile[]>({
        queryKey: ['users', role],
        queryFn: async () => {
            const res = await getUsers();
            if (!res.success) return [];
            const data = (res.data || []) as SafeUserWithProfile[];
            if (role) return data.filter((u: { role: string }) => u.role === role);
            return data;
        },
    });
}

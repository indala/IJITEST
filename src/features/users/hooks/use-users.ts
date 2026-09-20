"use client";

import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/actions/users";
import { unwrapAction } from "@/lib/query/action-query";
import { userKeys } from "@/features/users/queries/user.keys";
import type { SafeUserWithProfile } from "@/db/types";

export function useUsers(role?: string) {
    return useQuery({
        queryKey: userKeys.list(role),
        queryFn: async () => {
            const users = await unwrapAction<SafeUserWithProfile[]>(getUsers);
            return role ? users.filter((user) => user.role === role) : users;
        },
    });
}

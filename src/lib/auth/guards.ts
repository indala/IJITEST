import { getServerSession } from "next-auth/next";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { UserRole } from "@/db/types";

export async function getAuthorizedSession(
    roles?: readonly UserRole[],
): Promise<Session | null> {
    const session = await getServerSession(authOptions);

    if (!session?.user) return null;
    if (roles && !roles.includes(session.user.role)) return null;

    return session;
}

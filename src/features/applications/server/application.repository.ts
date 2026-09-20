import { and, desc, eq, inArray, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    applications,
    applicationInterests,
    masterInterests,
} from "@/db/schema";
import type { Application } from "@/db/types";
import type { ApplicationFilters } from "@/features/applications/types/application.types";

export async function listApplications(
    filters?: ApplicationFilters,
): Promise<Application[]> {
    const whereClauses: SQL[] = [];

    if (filters?.role && filters.role !== "all") {
        whereClauses.push(eq(applications.type, filters.role));
    }
    if (filters?.status && filters.status !== "all") {
        whereClauses.push(eq(applications.status, filters.status));
    }

    const apps = await db
        .select()
        .from(applications)
        .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
        .orderBy(desc(applications.createdAt))
        .limit(200);

    if (apps.length === 0) return [];

    const interests = await db
        .select({
            id: applicationInterests.id,
            applicationId: applicationInterests.applicationId,
            interestId: applicationInterests.interestId,
            interestIdNullable: masterInterests.id,
            interestName: masterInterests.name,
            interestCreatedAt: masterInterests.createdAt,
        })
        .from(applicationInterests)
        .leftJoin(masterInterests, eq(applicationInterests.interestId, masterInterests.id))
        .where(inArray(applicationInterests.applicationId, apps.map((app) => app.id)));

    const interestsByApplication = new Map<number, string[]>();

    for (const interest of interests) {
        if (interest.interestName === null) continue;
        const values = interestsByApplication.get(interest.applicationId) ?? [];
        values.push(interest.interestName);
        interestsByApplication.set(interest.applicationId, values);
    }

    const mapped = apps.map((app) => ({
        ...app,
        researchInterests: interestsByApplication.get(app.id) ?? [],
    }));

    if (!filters?.interest) return mapped;

    const search = filters.interest.toLowerCase();
    return mapped.filter((app) =>
        app.researchInterests?.some((interest) =>
            interest.toLowerCase().includes(search),
        ),
    );
}

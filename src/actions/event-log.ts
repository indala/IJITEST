"use server";
import "server-only";

import { db } from "@/lib/db";
import { submissionEventLog, users, userProfiles } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import {
    type SubmissionEventWithActor,
    type SubmissionEventType
} from "@/db/types";
import {
    type ActionResponse,
    actionSuccess,
    serverError
} from "@/lib/action-response";

/**
 * Robust, safe submission event logger.
 * Never throws — catches internal errors to protect caller transactions.
 */
export async function logSubmissionEvent(data: {
    submissionId: number;
    eventType: SubmissionEventType;
    userId?: string | null;
    description: string;
    metadata?: Record<string, unknown> | null;
}): Promise<boolean> {
    try {
        await db.insert(submissionEventLog).values({
            submissionId: data.submissionId,
            eventType: data.eventType,
            userId: data.userId || null,
            description: data.description,
            metadata: data.metadata || null,
        });
        return true;
    } catch (error) {
        console.error("Failed to log submission event:", error);
        return false;
    }
}

/**
 * Fetch chronological submission event history with actor profiles.
 */
export async function getSubmissionEvents(submissionId: number): Promise<ActionResponse<SubmissionEventWithActor[]>> {
    try {
        const rows = await db.select({
            event: submissionEventLog,
            user: users,
            profile: userProfiles,
        })
        .from(submissionEventLog)
        .where(eq(submissionEventLog.submissionId, submissionId))
        .leftJoin(users, eq(submissionEventLog.userId, users.id))
        .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
        .orderBy(asc(submissionEventLog.createdAt));

        const result: SubmissionEventWithActor[] = rows.map(({ event, user, profile }) => ({
            ...event,
            actor: user ? {
                id: user.id,
                fullName: profile?.fullName || user.email,
                role: user.role,
                photoUrl: profile?.photoUrl || null,
            } : null,
        }));

        return actionSuccess(result);
    } catch (error) {
        console.error("Get submission events error:", error);
        return serverError(error, "fetch submission event history");
    }
}

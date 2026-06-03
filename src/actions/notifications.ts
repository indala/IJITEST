"use server";
import "server-only"

import { db } from "@/lib/db";
import { contactMessages, submissions, reviewAssignments } from "@/db/schema";
import { eq, count, and, inArray } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { type ActionResponse } from "@/db/types";

export async function getNotificationCounts(): Promise<ActionResponse<{ messages: number, submissions: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const { role, id: userId } = session.user;
        const isAdminOrEditor = role === 'admin' || role === 'editor';

        // Run all applicable queries in parallel
        const [msgResult, subResult, revResult, actionResult] = await Promise.all([
            // Messages: Admins and Editors only
            isAdminOrEditor
                ? db.select({ count: count() }).from(contactMessages).where(eq(contactMessages.status, 'pending'))
                : Promise.resolve([]),
            // Submissions (Desk Screening): Admins and Editors only
            isAdminOrEditor
                ? db.select({ count: count() }).from(submissions).where(eq(submissions.status, 'submitted'))
                : Promise.resolve([]),
            // Review Assignments: all roles
            db.select({ count: count() })
                .from(reviewAssignments)
                .where(and(
                    eq(reviewAssignments.reviewerId, userId),
                    inArray(reviewAssignments.status, ['assigned', 'accepted'])
                )),
            // Submissions Requiring Action: Authors only
            role === 'author'
                ? db.select({ count: count() })
                    .from(submissions)
                    .where(and(
                        eq(submissions.correspondingAuthorId, userId),
                        inArray(submissions.status, ['revisionRequested', 'paymentPending'])
                    ))
                : Promise.resolve([]),
        ]);

        const data = {
            messages: msgResult?.[0]?.count ?? 0,
            submissions: (subResult?.[0]?.count ?? 0) + (revResult?.[0]?.count ?? 0) + (actionResult?.[0]?.count ?? 0)
        };
        return { success: true, data };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Notification Counts Error:", error);
        return { success: false, error: message };
    }
}

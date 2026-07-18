"use server";
import "server-only"

import { db } from "@/lib/db";
import { contactMessages, submissions, reviewAssignments, notifications, pushSubscriptions } from "@/db/schema";
import { eq, count, and, inArray, desc } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { type ActionResponse, type Notification, type NotificationType, type PushSubscriptionRow, serverError } from "@/db/types";
import { updateTag, cacheLife, cacheTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { cacheLogger } from "@/lib/cache-logger";
import webpush from "web-push";

const vapidPublicKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'];
const vapidPrivateKey = process.env['VAPID_PRIVATE_KEY'];

if (vapidPublicKey && vapidPrivateKey) {
    webpush.setVapidDetails(
        "mailto:support@ijitest.org",
        vapidPublicKey,
        vapidPrivateKey
    );
}

async function getPendingMessagesCountCached(): Promise<number> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.MESSAGES_PENDING_COUNT);

    try {
        cacheLogger.miss(CACHE_TAGS.MESSAGES_PENDING_COUNT);
        const result = await db.select({ count: count() })
            .from(contactMessages)
            .where(eq(contactMessages.status, 'pending'));
        return result[0]?.count ?? 0;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.MESSAGES_PENDING_COUNT, error);
        return 0;
    }
}

async function getSubmittedSubmissionsCountCached(): Promise<number> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT);

    try {
        cacheLogger.miss(CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT);
        const result = await db.select({ count: count() })
            .from(submissions)
            .where(eq(submissions.status, 'submitted'));
        return result[0]?.count ?? 0;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT, error);
        return 0;
    }
}

async function getReviewerAssignmentsCountCached(userId: string): Promise<number> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.REVIEWER_ASSIGNMENTS_COUNT(userId));

    try {
        cacheLogger.miss(CACHE_TAGS.REVIEWER_ASSIGNMENTS_COUNT(userId));
        const result = await db.select({ count: count() })
            .from(reviewAssignments)
            .where(and(
                eq(reviewAssignments.reviewerId, userId),
                inArray(reviewAssignments.status, ['assigned', 'accepted'])
            ));
        return result[0]?.count ?? 0;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.REVIEWER_ASSIGNMENTS_COUNT(userId), error);
        return 0;
    }
}

async function getAuthorActionsCountCached(userId: string): Promise<number> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.AUTHOR_ACTIONS_COUNT(userId));

    try {
        cacheLogger.miss(CACHE_TAGS.AUTHOR_ACTIONS_COUNT(userId));
        const result = await db.select({ count: count() })
            .from(submissions)
            .where(and(
                eq(submissions.correspondingAuthorId, userId),
                inArray(submissions.status, ['revisionRequested', 'paymentPending'])
            ));
        return result[0]?.count ?? 0;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.AUTHOR_ACTIONS_COUNT(userId), error);
        return 0;
    }
}

// Invalidation Helpers
export async function invalidateMessagesCount(): Promise<void> {
    cacheLogger.invalidation(CACHE_TAGS.MESSAGES_PENDING_COUNT);
    updateTag(CACHE_TAGS.MESSAGES_PENDING_COUNT);
}

export async function invalidateSubmittedSubmissionsCount(): Promise<void> {
    cacheLogger.invalidation(CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT);
    updateTag(CACHE_TAGS.SUBMISSIONS_SUBMITTED_COUNT);
}

export async function invalidateReviewerAssignmentsCount(userId: string): Promise<void> {
    const tag = CACHE_TAGS.REVIEWER_ASSIGNMENTS_COUNT(userId);
    cacheLogger.invalidation(tag);
    updateTag(tag);
}

export async function invalidateAuthorActionsCount(userId: string): Promise<void> {
    const tag = CACHE_TAGS.AUTHOR_ACTIONS_COUNT(userId);
    cacheLogger.invalidation(tag);
    updateTag(tag);
}

export async function getNotificationCounts(): Promise<ActionResponse<{ messages: number, submissions: number }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };

        const { role, id: userId } = session.user;
        const isAdminOrEditor = role === 'admin' || role === 'editor';

        // Run all applicable queries in parallel using cached functions
        const [messagesCount, submittedCount, reviewerCount, authorCount] = await Promise.all([
            isAdminOrEditor ? getPendingMessagesCountCached() : Promise.resolve(0),
            isAdminOrEditor ? getSubmittedSubmissionsCountCached() : Promise.resolve(0),
            getReviewerAssignmentsCountCached(userId),
            role === 'author' ? getAuthorActionsCountCached(userId) : Promise.resolve(0)
        ]);

        const data = {
            messages: messagesCount,
            submissions: submittedCount + reviewerCount + authorCount
        };
        return { success: true, data };
    } catch (error) {
        console.error("Get Notification Counts Error:", error);
        return serverError(error, "fetch notification counts");
    }
}

// ============================================================================
// 🔔 EVENT-DRIVEN NOTIFICATION SERVICES
// ============================================================================

export async function createNotification({
    userId,
    createdByUserId,
    type,
    message,
    actionLink,
    priority = "medium",
    metadata,
}: {
    userId: string;
    createdByUserId?: string;
    type: NotificationType;
    message: string;
    actionLink?: string;
    priority?: "low" | "medium" | "high";
    metadata?: { submissionId?: number; paperId?: string; reviewAssignmentId?: number; paymentId?: number };
}): Promise<ActionResponse<void>> {
    try {
        await db.insert(notifications).values({
            userId,
            createdByUserId,
            type,
            priority,
            message,
            actionLink,
            metadata,
        });

        // Invalidate both feed cache and unread count cache
        updateTag(CACHE_TAGS.USER_NOTIFICATIONS(userId));
        updateTag(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId));

        // 🚀 Background Web Push trigger
        if (vapidPublicKey && vapidPrivateKey) {
            const subs = await db.select()
                .from(pushSubscriptions)
                .where(eq(pushSubscriptions.userId, userId));

            if (subs.length > 0) {
                const title = type.split("_").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
                const payload = JSON.stringify({
                    title,
                    body: message,
                    url: actionLink || "/"
                });

                Promise.all(
                    subs.map((sub: PushSubscriptionRow) => {
                        const pushSub = {
                            endpoint: sub.endpoint,
                            keys: {
                                p256dh: sub.p256dh,
                                auth: sub.auth
                            }
                        };
                        return webpush.sendNotification(pushSub, payload)
                            .catch((err: unknown) => {
                                const pushErr = err as { statusCode?: number; message?: string };
                                if (pushErr?.statusCode === 410 || pushErr?.statusCode === 404) {
                                    console.log(`Deleting expired push subscription for user ${userId}:`, sub.endpoint);
                                    db.delete(pushSubscriptions)
                                        .where(eq(pushSubscriptions.id, sub.id))
                                        .catch((dbErr: unknown) => console.error("Failed to delete expired push subscription:", dbErr));
                                } else {
                                    console.error("Web Push notification delivery failed:", err);
                                }
                            });
                    })
                ).catch(err => console.error("Unhandled error in push notifications parallel delivery:", err));
            }
        }

        return { success: true };
    } catch (error) {
        console.error("Failed to create notification:", error);
        return serverError(error, "create notification");
    }
}

async function getRecentNotificationsCached(userId: string, limit: number, unreadOnly: boolean): Promise<Notification[]> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.USER_NOTIFICATIONS(userId));

    try {
        cacheLogger.miss(CACHE_TAGS.USER_NOTIFICATIONS(userId));
        const conditions = [eq(notifications.userId, userId)];
        if (unreadOnly) {
            conditions.push(eq(notifications.isRead, false));
        }

        const result = await db.select()
            .from(notifications)
            .where(and(...conditions))
            .orderBy(desc(notifications.createdAt))
            .limit(limit);

        return result;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.USER_NOTIFICATIONS(userId), error);
        return [];
    }
}

export async function getRecentNotifications({
    limit = 20,
    unreadOnly = false,
}: {
    limit?: number;
    unreadOnly?: boolean;
} = {}): Promise<ActionResponse<Notification[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        const data = await getRecentNotificationsCached(userId, limit, unreadOnly);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to get recent notifications:", error);
        return serverError(error, "fetch recent notifications");
    }
}

async function getUnreadNotificationsCountCached(userId: string): Promise<number> {
    "use cache";
    cacheLife("hours");
    cacheTag(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId));

    try {
        cacheLogger.miss(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId));
        const result = await db.select({ count: count() })
            .from(notifications)
            .where(and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false)
            ));
        return result[0]?.count ?? 0;
    } catch (error) {
        cacheLogger.error(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId), error);
        return 0;
    }
}

export async function getUnreadNotificationsCount(): Promise<ActionResponse<number>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        const data = await getUnreadNotificationsCountCached(userId);
        return { success: true, data };
    } catch (error) {
        console.error("Failed to get unread notification count:", error);
        return serverError(error, "fetch unread notification count");
    }
}

export async function markNotificationAsRead(notificationId: number): Promise<ActionResponse<void>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        await db.update(notifications)
            .set({ isRead: true })
            .where(and(
                eq(notifications.id, notificationId),
                eq(notifications.userId, userId)
            ));

        updateTag(CACHE_TAGS.USER_NOTIFICATIONS(userId));
        updateTag(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId));

        return { success: true };
    } catch (error) {
        console.error("Failed to mark notification as read:", error);
        return serverError(error, "mark notification as read");
    }
}

export async function markAllNotificationsAsRead(): Promise<ActionResponse<void>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return { success: false, error: "Unauthorized" };
        const userId = session.user.id;

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, userId));

        updateTag(CACHE_TAGS.USER_NOTIFICATIONS(userId));
        updateTag(CACHE_TAGS.USER_NOTIFICATIONS_UNREAD_COUNT(userId));

        return { success: true };
    } catch (error) {
        console.error("Failed to mark all notifications as read:", error);
        return serverError(error, "mark all notifications as read");
    }
}

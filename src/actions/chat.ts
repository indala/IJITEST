"use server";

import { db } from "@/lib/db";
import { chatMessages, users, userProfiles, reviewAssignments } from "@/db/schema";
import { eq, and, or, asc, like, not } from "drizzle-orm";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import crypto from "crypto";
import { type ActionResponse, type ChatMessageRow, type ChatUser } from "@/db/types";

/**
 * Signs a short-lived HS256 socket token using Node's built-in crypto module.
 */
function signSocketToken(payload: Record<string, unknown>, secret: string): string {
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const signature = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    return `${header}.${body}.${signature}`;
}

/**
 * Action: Get a short-lived token to authenticate the WebSocket connection in NestJS.
 */
export async function getSocketToken(): Promise<ActionResponse<{ token: string; socketUrl: string }>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }

        const secret = process.env['STORAGE_SERVICE_SECRET'];
        if (!secret) {
            return { success: false, error: "Storage service secret is not configured" };
        }

        const socketUrl = process.env['STORAGE_SERVICE_URL'] || 'http://localhost:4000';

        // Generate token valid for 2 minutes
        const token = signSocketToken({
            userId: session.user.id,
            role: session.user.role,
            exp: Math.floor(Date.now() / 1000) + 120
        }, secret);

        return { success: true, data: { token, socketUrl } };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Action: Send a message (saves it in the database).
 */
export async function sendChatMessage(
    receiverId: string, 
    messageText: string, 
    submissionId?: number
): Promise<ActionResponse<ChatMessageRow>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }

        const senderId = session.user.id;

        // Perform authorization check
        const isAuthorized = await checkChatPermission(senderId, session.user.role, receiverId, submissionId);
        if (!isAuthorized) {
            return { success: false, error: "You do not have permission to chat with this user." };
        }

        const [insertResult] = await db.insert(chatMessages).values({
            senderId,
            receiverId,
            submissionId: submissionId || null,
            messageText,
            isRead: false
        });

        const [savedMessage] = await db.select()
            .from(chatMessages)
            .where(eq(chatMessages.id, insertResult.insertId))
            .limit(1);

        if (!savedMessage) {
            return { success: false, error: "Failed to retrieve saved message." };
        }

        return { success: true, data: savedMessage };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Action: Get conversation history between current user and partner.
 */
export async function getChatHistory(
    partnerId: string, 
    submissionId?: number
): Promise<ActionResponse<ChatMessageRow[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }

        const userId = session.user.id;

        // Query messages in both directions
        const conditions = [
            or(
                and(eq(chatMessages.senderId, userId), eq(chatMessages.receiverId, partnerId)),
                and(eq(chatMessages.senderId, partnerId), eq(chatMessages.receiverId, userId))
            )
        ];

        if (submissionId) {
            conditions.push(eq(chatMessages.submissionId, submissionId));
        }

        const messagesList = await db.select({
            id: chatMessages.id,
            senderId: chatMessages.senderId,
            receiverId: chatMessages.receiverId,
            submissionId: chatMessages.submissionId,
            messageText: chatMessages.messageText,
            isRead: chatMessages.isRead,
            createdAt: chatMessages.createdAt,
            senderName: userProfiles.fullName
        })
        .from(chatMessages)
        .leftJoin(userProfiles, eq(chatMessages.senderId, userProfiles.userId))
        .where(and(...conditions))
        .orderBy(asc(chatMessages.createdAt));

        // Mark incoming messages as read
        const unreadIds = messagesList
            .filter(m => m.receiverId === userId && !m.isRead)
            .map(m => m.id);

        if (unreadIds.length > 0) {
            // Update db async
            db.update(chatMessages)
                .set({ isRead: true })
                .where(inArray(chatMessages.id, unreadIds))
                .catch(e => console.error("Failed to mark messages as read:", e));
        }

        return { success: true, data: messagesList };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

// Helper to handle inArray type-safety
import { inArray } from "drizzle-orm";

/**
 * Action: Search for users that the current user is allowed to chat with.
 */
export async function searchChatUsers(query: string): Promise<ActionResponse<ChatUser[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required" };
        }

        const userId = session.user.id;
        const role = session.user.role;
        const searchPattern = `%${query}%`;

        if (['admin', 'editor'].includes(role)) {
            // Staff can search other staff or reviewers
            const rows = await db.select({
                id: users.id,
                email: users.email,
                fullName: userProfiles.fullName,
                role: users.role
            })
            .from(users)
            .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(and(
                not(eq(users.id, userId)),
                not(eq(users.role, 'author')),
                or(
                    like(userProfiles.fullName, searchPattern),
                    like(users.email, searchPattern)
                )
            ))
            .limit(15);

            return { success: true, data: rows };
        } else if (role === 'reviewer') {
            // Reviewers can only search editors who assigned them reviews
            const assignersSubquery = db.select({ id: reviewAssignments.assignedBy })
                .from(reviewAssignments)
                .where(eq(reviewAssignments.reviewerId, userId));

            const rows = await db.select({
                id: users.id,
                email: users.email,
                fullName: userProfiles.fullName,
                role: users.role
            })
            .from(users)
            .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(and(
                inArray(users.id, assignersSubquery),
                or(
                    like(userProfiles.fullName, searchPattern),
                    like(users.email, searchPattern)
                )
            ))
            .limit(15);

            return { success: true, data: rows };
        }

        return { success: true, data: [] };
    } catch (error) {
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
}

/**
 * Helper: Authorize whether two users are allowed to chat.
 */
async function checkChatPermission(
    senderId: string, 
    senderRole: string, 
    receiverId: string, 
    _submissionId?: number
): Promise<boolean> {
    // 1. Staff (Admin/Editor) can chat with each other or anyone except authors (unless managing author paper, but chat is restricted to internal staff for now)
    const [receiver] = await db.select({ id: users.id, role: users.role })
        .from(users)
        .where(eq(users.id, receiverId))
        .limit(1);
    
    if (!receiver) return false;
    if (receiver.role === 'author') return false; // Safety: strictly prevent author chats

    if (['admin', 'editor'].includes(senderRole)) {
        return true;
    }

    if (senderRole === 'reviewer') {
        // Reviewer can only chat with editors/admins who assigned them reviews
        const assignments = await db.select()
            .from(reviewAssignments)
            .where(and(
                eq(reviewAssignments.reviewerId, senderId),
                eq(reviewAssignments.assignedBy, receiverId)
            ))
            .limit(1);
        
        return assignments.length > 0;
    }

    return false;
}

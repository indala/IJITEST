import { and, desc, eq, inArray, like, or, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { contactMessages } from "@/db/schema";
import type {
    ContactMessageRow,
    ContactStatus,
} from "@/db/types";
import type { MessageFilters, MessageStatus } from "@/features/messages/types/message.types";

export async function listMessages(
    filters?: MessageFilters,
): Promise<ContactMessageRow[]> {
    const whereConditions: SQL[] = [];

    if (filters?.status) {
        whereConditions.push(eq(contactMessages.status, filters.status));
    }

    if (filters?.search) {
        const pattern = `%${filters.search}%`;
        const searchClause = or(
            like(contactMessages.name, pattern),
            like(contactMessages.email, pattern),
            like(contactMessages.subject, pattern),
        );

        if (searchClause) whereConditions.push(searchClause);
    }

    return db
        .select({
            id: contactMessages.id,
            name: contactMessages.name,
            email: contactMessages.email,
            subject: contactMessages.subject,
            message: contactMessages.message,
            status: contactMessages.status,
            createdAt: contactMessages.createdAt,
        })
        .from(contactMessages)
        .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
        .orderBy(desc(contactMessages.createdAt))
        .limit(200);
}

export async function setMessageStatus(
    id: number,
    status: MessageStatus,
): Promise<void> {
    await db
        .update(contactMessages)
        .set({ status })
        .where(eq(contactMessages.id, id));
}

export async function setMessagesStatus(
    ids: number[],
    status: MessageStatus,
): Promise<void> {
    if (ids.length === 0) return;

    await db
        .update(contactMessages)
        .set({ status })
        .where(inArray(contactMessages.id, ids));
}

export async function removeMessage(id: number): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
}

export async function findMessage(id: number) {
    const [message] = await db
        .select()
        .from(contactMessages)
        .where(eq(contactMessages.id, id))
        .limit(1);

    return message;
}

export type { ContactStatus };

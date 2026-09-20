import type { ContactMessageRow, ContactStatus } from "@/db/types";

export type MessageStatus = Extract<ContactStatus, "pending" | "resolved" | "archived">;

export interface MessageFilters {
    status?: MessageStatus;
    search?: string;
}

export type { ContactMessageRow };

import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import {
    bulkUpdateMessageStatus,
    deleteMessage,
    replyToMessage,
    revertMessageStatus,
    updateMessageStatus,
} from "@/actions/messages";
import type { ActionResponse } from "@/db/contracts";
import { messageKeys } from "./message.keys";
import type { MessageStatus } from "../types/message.types";

type MessageStatusInput = {
    id: number;
    status: MessageStatus;
};

type BulkMessageStatusInput = {
    ids: number[];
    status: MessageStatus;
};

type ReplyMessageInput = {
    id: number;
    content: string;
};

function invalidateMessages(queryClient: QueryClient) {
    void queryClient.invalidateQueries({ queryKey: messageKeys.lists() });
    void queryClient.invalidateQueries({ queryKey: messageKeys.counts() });
}

export const messageMutationOptions = {
    updateStatus: (queryClient: QueryClient) => mutationOptions({
        mutationFn: ({ id, status }: MessageStatusInput) =>
            updateMessageStatus(id, status),
        onSuccess: (result: ActionResponse) => {
            if (result.success) invalidateMessages(queryClient);
        },
    }),

    bulkUpdateStatus: (queryClient: QueryClient) => mutationOptions({
        mutationFn: ({ ids, status }: BulkMessageStatusInput) =>
            bulkUpdateMessageStatus(ids, status),
        onSuccess: (result: ActionResponse<{ count: number }>) => {
            if (result.success) invalidateMessages(queryClient);
        },
    }),

    revert: (queryClient: QueryClient) => mutationOptions({
        mutationFn: (id: number) => revertMessageStatus(id),
        onSuccess: (result: ActionResponse) => {
            if (result.success) invalidateMessages(queryClient);
        },
    }),

    remove: (queryClient: QueryClient) => mutationOptions({
        mutationFn: (id: number) => deleteMessage(id),
        onSuccess: (result: ActionResponse) => {
            if (result.success) invalidateMessages(queryClient);
        },
    }),

    reply: (queryClient: QueryClient) => mutationOptions({
        mutationFn: ({ id, content }: ReplyMessageInput) =>
            replyToMessage(id, content),
        onSuccess: (result: ActionResponse) => {
            if (result.success) invalidateMessages(queryClient);
        },
    }),
};

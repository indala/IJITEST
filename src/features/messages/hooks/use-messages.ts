"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageQueryOptions } from "@/features/messages/queries/message.options";
import { messageMutationOptions } from "@/features/messages/queries/message.mutations";
import type { MessageFilters } from "@/features/messages/types/message.types";

export function useMessages(filters?: MessageFilters) {
    return useQuery(messageQueryOptions.list(filters));
}

export function useUpdateMessageStatus() {
    const queryClient = useQueryClient();

    return useMutation(messageMutationOptions.updateStatus(queryClient));
}

export function useBulkUpdateMessages() {
    const queryClient = useQueryClient();

    return useMutation(messageMutationOptions.bulkUpdateStatus(queryClient));
}

export function useRevertMessage() {
    const queryClient = useQueryClient();

    return useMutation(messageMutationOptions.revert(queryClient));
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation(messageMutationOptions.remove(queryClient));
}

export function useReplyToMessage() {
    const queryClient = useQueryClient();

    return useMutation(messageMutationOptions.reply(queryClient));
}

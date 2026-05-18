import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, updateMessageStatus, bulkUpdateMessageStatus, revertMessageStatus, deleteMessage, replyToMessage } from '@/actions/messages';
import type { ActionResponse, ContactMessageRow } from '@/db/types';

export function useMessages(filters?: { status?: 'pending' | 'resolved' | 'archived', search?: string }) {
    return useQuery<ContactMessageRow[]>({
        queryKey: ['messages', filters],
        queryFn: async () => {
            const res = await getMessages(filters);
            return res.success ? res.data ?? [] : [];
        }
    });
}

export function useUpdateMessageStatus() {
    const queryClient = useQueryClient();

    return useMutation<ActionResponse, Error, { id: number, status: 'resolved' | 'archived' | 'pending' }>({
        mutationFn: ({ id, status }) => 
            updateMessageStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useBulkUpdateMessages() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ ids, status }: { ids: number[], status: 'resolved' | 'archived' | 'pending' }) => 
            bulkUpdateMessageStatus(ids, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useRevertMessage() {
    const queryClient = useQueryClient();

    return useMutation<ActionResponse, Error, number>({
        mutationFn: (id: number) => revertMessageStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useDeleteMessage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => deleteMessage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

export function useReplyToMessage() {
    const queryClient = useQueryClient();

    return useMutation<ActionResponse, Error, { id: number, content: string }>({
        mutationFn: ({ id, content }) => 
            replyToMessage(id, content),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        }
    });
}

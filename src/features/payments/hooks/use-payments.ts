"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentQueryOptions } from "@/features/payments/queries/payment.options";
import { paymentMutationOptions } from "@/features/payments/queries/payment.mutations";

export function usePayments() {
    return useQuery(paymentQueryOptions.list());
}

export function useUnpaidPapers() {
    return useQuery(paymentQueryOptions.unpaidPapers());
}

export function useInitializePayment() {
    const queryClient = useQueryClient();

    return useMutation(paymentMutationOptions.initialize(queryClient));
}

export function useUpdatePaymentStatus() {
    const queryClient = useQueryClient();

    return useMutation(paymentMutationOptions.updateStatus(queryClient));
}

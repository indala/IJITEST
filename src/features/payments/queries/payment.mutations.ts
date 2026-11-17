import { mutationOptions, type QueryClient } from "@tanstack/react-query";
import {
    initializePayment,
    updatePaymentStatus,
    resendPaymentRequest,
} from "@/actions/payments";
import { paymentKeys } from "./payment.keys";
import type {
    InitializePaymentInput,
    UpdatePaymentStatusInput,
} from "../types/payment.types";

function invalidatePayments(queryClient: QueryClient) {
    void queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    void queryClient.invalidateQueries({ queryKey: paymentKeys.notifications() });
}

export const paymentMutationOptions = {
    initialize: (queryClient: QueryClient) => mutationOptions({
        mutationFn: ({ submissionId, amount, currency }: InitializePaymentInput) =>
            initializePayment(submissionId, amount, currency),
        onSuccess: (result) => {
            if (result.success) invalidatePayments(queryClient);
        },
    }),

    updateStatus: (queryClient: QueryClient) => mutationOptions({
        mutationFn: ({ id, status, transactionId }: UpdatePaymentStatusInput) =>
            updatePaymentStatus(id, status, transactionId),
        onSuccess: (result) => {
            if (result.success) {
                invalidatePayments(queryClient);
                void queryClient.invalidateQueries({ queryKey: paymentKeys.submissions() });
            }
        },
    }),

    resend: (queryClient: QueryClient) => mutationOptions({
        mutationFn: (paymentId: number) =>
            resendPaymentRequest(paymentId),
        onSuccess: (result) => {
            if (result.success) {
                invalidatePayments(queryClient);
            }
        },
    }),
};

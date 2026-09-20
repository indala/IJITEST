import type { PaymentRow, UnpaidPaperRow } from "@/db/contracts";
import type { PaymentStatus } from "@/db/models";

export interface InitializePaymentInput {
    submissionId: number;
    amount: number;
    currency: string;
}

export interface UpdatePaymentStatusInput {
    id: number;
    status: PaymentStatus;
    transactionId?: string;
}

export type { PaymentRow, PaymentStatus, UnpaidPaperRow };

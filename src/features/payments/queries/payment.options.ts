import { queryOptions } from "@tanstack/react-query";
import {
    getAcceptedUnpaidPapers,
    getPayments,
} from "@/actions/payments";
import type { PaymentRow, UnpaidPaperRow } from "@/db/contracts";
import { unwrapAction } from "@/lib/query/action-query";
import { paymentKeys } from "./payment.keys";

export const paymentQueryOptions = {
    list: () => queryOptions({
        queryKey: paymentKeys.list(),
        queryFn: () => unwrapAction<PaymentRow[]>(getPayments),
    }),

    unpaidPapers: () => queryOptions({
        queryKey: paymentKeys.unpaidPapers(),
        queryFn: () => unwrapAction<UnpaidPaperRow[]>(getAcceptedUnpaidPapers),
    }),
};

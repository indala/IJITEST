import { queryOptions } from "@tanstack/react-query";
import { getMessages } from "@/actions/messages";
import type { ContactMessageRow } from "@/db/contracts";
import { unwrapAction } from "@/lib/query/action-query";
import { messageKeys } from "./message.keys";
import type { MessageFilters } from "../types/message.types";

export const messageQueryOptions = {
    list: (filters?: MessageFilters) => queryOptions({
        queryKey: messageKeys.list(filters),
        queryFn: () => unwrapAction<ContactMessageRow[]>(() => getMessages(filters)),
    }),
};

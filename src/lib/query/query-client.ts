import { QueryClient } from "@tanstack/react-query";

export const QUERY_STALE_TIMES = {
    default: 5 * 60 * 1000,
    frequentlyChanging: 60 * 1000,
    publicContent: 10 * 60 * 1000,
    settings: 30 * 60 * 1000,
} as const;

export const QUERY_GC_TIMES = {
    default: 30 * 60 * 1000,
    short: 15 * 60 * 1000,
    publicContent: 60 * 60 * 1000,
} as const;

/**
 * Creates the browser QueryClient.
 *
 * Keep this in a client-safe module: it must not import server actions,
 * database code, or Next.js cache APIs.
 */
export function createQueryClient(): QueryClient {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: QUERY_STALE_TIMES.default,
                gcTime: QUERY_GC_TIMES.default,
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                retry: 1,
            },
        },
    });
}

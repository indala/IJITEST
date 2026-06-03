"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";

const ReactQueryDevtools =
    process.env.NODE_ENV === "production"
        ? () => null
        : dynamic(
              () =>
                  import("@tanstack/react-query-devtools").then(
                      (m) => m.ReactQueryDevtools
                  ),
              { ssr: false }
          );

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000 * 5, // 5 minutes cache before background refetch
                        refetchOnWindowFocus: false, // Prevents aggressive reloading
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

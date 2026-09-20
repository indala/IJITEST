"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import { useState } from "react";
import { createQueryClient } from "@/lib/query/query-client";

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
        createQueryClient
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}

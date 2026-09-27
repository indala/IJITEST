"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EditorError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Editor dashboard error:", error);
    }, [error]);

    return (
        <main className="flex min-h-[50vh] items-center justify-center p-6">
            <div className="flex max-w-md flex-col items-center gap-3 text-center">
                <AlertTriangle className="h-10 w-10 text-amber-600" aria-hidden="true" />
                <h1 className="text-xl font-semibold text-foreground">Editor dashboard unavailable</h1>
                <p className="m-0 text-body-sm text-muted-foreground">
                    The editor portal could not load right now. Please try again.
                </p>
                <Button type="button" onClick={reset} className="gap-2">
                    <RefreshCw className="h-4 w-4" aria-hidden="true" />
                    Try again
                </Button>
            </div>
        </main>
    );
}

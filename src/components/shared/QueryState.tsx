import type { ReactNode } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

type QueryStateProps = {
    isLoading: boolean;
    isError?: boolean;
    error?: Error | null;
    children: ReactNode;
    loadingLabel?: string;
    errorLabel?: string;
};

export function QueryState({
    isLoading,
    isError = false,
    error,
    children,
    loadingLabel = "Loading...",
    errorLabel = "Unable to load this content.",
}: QueryStateProps) {
    if (isLoading) {
        return (
            <div
                className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center"
                role="status"
                aria-live="polite"
            >
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <p className="text-body-sm text-muted-foreground">{loadingLabel}</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                className="flex min-h-40 flex-col items-center justify-center gap-3 p-8 text-center"
                role="alert"
            >
                <AlertCircle className="size-8 text-destructive/70" aria-hidden="true" />
                <p className="text-body-sm text-muted-foreground">
                    {error?.message || errorLabel}
                </p>
            </div>
        );
    }

    return children;
}

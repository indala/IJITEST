import type { ActionResponse } from "@/lib/action-response";

/**
 * Converts a server-action result into the contract expected by TanStack Query.
 * Failed actions must reject so components can render an error state instead
 * of treating authorization or server failures as empty data.
 */
export async function unwrapAction<T>(
    action: () => Promise<ActionResponse<T>>,
): Promise<T> {
    const result = await action();

    if (!result.success) {
        throw new Error(result.error);
    }

    if (result.data === undefined) {
        throw new Error("The server action completed without returning data.");
    }

    return result.data;
}

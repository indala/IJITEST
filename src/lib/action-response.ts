// 🧪 Common Return Types (Discriminated Union)
// 🛡️ Elite: Discriminated union with conditional requirement for 'data'
export type ActionResponse<T = void> =
    | (T extends void
        ? { success: true; data?: T; message?: string }
        : { success: true; data: T; message?: string })
    | { success: false; error: string; data?: never; message?: string };

// 🛠️ Utility Helpers
export type SuccessResponse<T> = Extract<ActionResponse<T>, { success: true }>;
export type ErrorResponse = Extract<ActionResponse, { success: false }>;

/**
 * 🛡️ Elite: Helper to create a successful ActionResponse
 */
export function actionSuccess<T = void>(data: T, message?: string): ActionResponse<T>;
export function actionSuccess(data?: undefined, message?: string): ActionResponse<void>;
export function actionSuccess<T>(data?: T, message?: string): ActionResponse<T> {
    return { success: true, data: data as T, message } as ActionResponse<T>;
}

/**
 * 🛡️ Elite: Helper to create a failed ActionResponse
 */
export function actionError<T = void>(error: string): ActionResponse<T> {
    return { success: false, error } as ActionResponse<T>;
}

/**
 * 🛡️ Elite: Server-safe error helper — logs the real error server-side,
 * returns a sanitized user-safe message to the client.
 */
export function serverError<T = void>(
    error: unknown,
    context?: string
): ActionResponse<T> {
    const realMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Server Error]${context ? ` [${context}]` : ''}:`, realMessage,
        error instanceof Error ? '\n' + error.stack : '');

    // Provide a generic user-safe message based on context
    const userMessage = context
        ? `Failed to ${context.toLowerCase()}. Please try again.`
        : "An unexpected error occurred. Please try again.";

    return { success: false, error: userMessage, data: undefined } as unknown as ActionResponse<T>;
}

export function isCrossrefWorkForDoi(response: unknown, doi: string): boolean {
    if (typeof response !== "object" || response === null) return false;

    const message = (response as Record<string, unknown>)["message"];
    if (typeof message !== "object" || message === null) return false;

    const returnedDoi = (message as Record<string, unknown>)["DOI"];
    return typeof returnedDoi === "string" && returnedDoi.toLowerCase() === doi.toLowerCase();
}

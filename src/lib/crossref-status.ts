function normalizeTitle(title: string): string {
    return title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isCrossrefWorkForDoi(response: unknown, doi: string, expectedTitle?: string): boolean {
    if (typeof response !== "object" || response === null) return false;

    const message = (response as Record<string, unknown>)["message"];
    if (typeof message !== "object" || message === null) return false;

    const record = message as Record<string, unknown>;
    const returnedDoi = record["DOI"];
    if (typeof returnedDoi !== "string" || returnedDoi.toLowerCase() !== doi.toLowerCase()) return false;
    if (!expectedTitle) return true;

    const titles = record["title"];
    const normalizedExpectedTitle = normalizeTitle(expectedTitle);
    return Array.isArray(titles) && titles.some(
        title => typeof title === "string" && normalizeTitle(title) === normalizedExpectedTitle
    );
}

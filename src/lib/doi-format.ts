export function normalizeDoi(value: string): string {
    return value
        .trim()
        .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
        .replace(/^doi:\s*/i, "");
}

export function isValidDoi(value: string): boolean {
    return /^10\.\d{4,9}\/\S+$/i.test(value);
}

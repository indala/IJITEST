import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a file URL is routed through the secure API endpoint.
 * @param url The stored file URL (e.g., /uploads/submissions/file.pdf or /api/files/...)
 */
export function getSecureUrl(url: string | null | undefined) {
    if (!url) return "";
    if (url.startsWith('/api/files/')) return url;
    if (url.startsWith('/uploads/')) {
        return `/api/files${url}`;
    }
    return url;
}

/**
 * Deterministic date formatter to prevent Next.js SSR hydration mismatches.
 * Formats dates in UTC (DD/MM/YYYY) to remain consistent across timezone scopes.
 */
export function formatDate(dateInput: Date | string | number | null | undefined): string {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

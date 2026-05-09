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

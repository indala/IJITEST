import fs from "fs/promises";
import path from "path";

function resolvePathWithinBase(baseDir: string, inputPath: string): string {
    const normalizedInput = inputPath.replace(/^\/+/, "");
    const resolvedBase = path.resolve(baseDir);
    const resolvedTarget = path.resolve(resolvedBase, normalizedInput);
    const isInsideBase =
        resolvedTarget === resolvedBase ||
        resolvedTarget.startsWith(resolvedBase + path.sep);

    if (!isInsideBase) {
        throw new Error("Unsafe path: traversal outside allowed directory.");
    }

    return resolvedTarget;
}

/**
 * Gets the absolute path for a file in the private storage directory.
 * @param relativePath The path relative to the storage folder (e.g., "submissions/file.pdf")
 */
export function getStoragePath(relativePath: string) {
    return resolvePathWithinBase(path.join(process.cwd(), "storage"), relativePath);
}

/**
 * Gets the absolute path for a file in the legacy public uploads directory.
 * @param relativePath The path relative to the uploads folder (e.g., "published/file.pdf")
 */
export function getPublicUploadsPath(relativePath: string) {
    return resolvePathWithinBase(path.join(process.cwd(), "public", "uploads"), relativePath);
}

/**
 * Resolves a file URL or relative path to its absolute location on disk.
 * Handles /api/files/, /uploads/, and raw paths.
 */
export function resolveAbsolutePath(filePath: string): string {
    const cleanPath = filePath.replace(/^\/+/, '');
    
    if (cleanPath.startsWith('api/files/')) {
        const pathWithoutPrefix = cleanPath.replace('api/files/', '');
        return getStoragePath(pathWithoutPrefix);
    }
    
    if (cleanPath.startsWith('uploads/')) {
        const pathWithoutPrefix = cleanPath.replace('uploads/', '');
        return getPublicUploadsPath(pathWithoutPrefix);
    }

    // Default to storage for other raw paths, but check public as fallback if needed
    return getStoragePath(cleanPath);
}

/**
 * Safely deletes a file from the storage or public directory.
 * @param relativePath The path relative to the root (starts with /uploads/ or /submissions/)
 */
export async function safeDeleteFile(relativePath: string | null | undefined) {
    if (!relativePath) return;

    try {
        const absolutePath = resolveAbsolutePath(relativePath);

        // Check if file exists before trying to delete
        try {
            await fs.access(absolutePath);
            await fs.unlink(absolutePath);
            console.log(`Successfully deleted file: ${absolutePath}`);
        } catch (accessError) {
            if (accessError instanceof Error && 'code' in accessError && accessError.code === 'ENOENT') {
                // File already doesn't exist, which is fine
                return;
            }
            throw accessError;
        }
    } catch (error) {
        console.error(`Error deleting file ${relativePath}:`, error);
    }
}

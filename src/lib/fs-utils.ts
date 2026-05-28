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

export function getStoragePath(relativePath: string): string {
    return resolvePathWithinBase(path.join(process.cwd(), "storage"), relativePath);
}

export function getPublicUploadsPath(relativePath: string): string {
    return resolvePathWithinBase(path.join(process.cwd(), "public", "uploads"), relativePath);
}

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

    return getStoragePath(cleanPath);
}

/**
 * Extracts a clean relative storage path from a file URL or path.
 */
export function getRelativePath(filePath: string): string {
    const cleanPath = filePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('api/files/')) {
        return cleanPath.replace('api/files/', '');
    }
    if (cleanPath.startsWith('uploads/')) {
        return cleanPath.replace('uploads/', '');
    }
    return cleanPath;
}

/**
 * Proxies file deletion to the NestJS helper storage service.
 */
export async function safeDeleteFile(fileUrl: string | null | undefined): Promise<void> {
    if (!fileUrl) return;

    try {
        const serviceUrl = process.env['STORAGE_SERVICE_URL'];
        const secret = process.env['STORAGE_SERVICE_SECRET'];
        if (!serviceUrl || !secret) {
            console.warn("Storage service not configured. Falling back to local filesystem deletion.");
            const absolutePath = resolveAbsolutePath(fileUrl);
            try {
                await fs.access(absolutePath);
                await fs.unlink(absolutePath);
            } catch { /* ignore */ }
            return;
        }

        const relativePath = getRelativePath(fileUrl);
        const response = await fetch(`${serviceUrl}/storage/delete?path=${encodeURIComponent(relativePath)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${secret}`
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`Failed to delete file from storage service: ${errText}`);
        }
    } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error);
    }
}

/**
 * Uploads a file stream/buffer to the NestJS storage service.
 */
export async function uploadFileToStorage(relativePath: string, file: File | Buffer, originalName?: string): Promise<void> {
    const cleanRelativePath = getRelativePath(relativePath);
    const serviceUrl = process.env['STORAGE_SERVICE_URL'];
    const secret = process.env['STORAGE_SERVICE_SECRET'];
    if (!serviceUrl || !secret) {
        throw new Error("Storage service is not configured.");
    }

    const formData = new FormData();
    if (file instanceof Buffer) {
        const uint8Array = new Uint8Array(
            file.buffer as ArrayBuffer,
            file.byteOffset,
            file.byteLength
        );
        const blob = new Blob([uint8Array]);
        formData.append('file', blob, originalName || path.basename(relativePath));
    } else {
        formData.append('file', file as Blob);
    }

    const response = await fetch(`${serviceUrl}/storage/upload?path=${encodeURIComponent(cleanRelativePath)}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${secret}`
        },
        body: formData
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Storage service upload failed: ${errText}`);
    }
}

/**
 * Downloads a file buffer from the NestJS storage service.
 */
export async function downloadFileFromStorage(fileUrl: string): Promise<Buffer> {
    const serviceUrl = process.env['STORAGE_SERVICE_URL'];
    const secret = process.env['STORAGE_SERVICE_SECRET'];
    if (!serviceUrl || !secret) {
        throw new Error("Storage service is not configured.");
    }

    const relPath = getRelativePath(fileUrl);
    const response = await fetch(`${serviceUrl}/storage/download?path=${encodeURIComponent(relPath)}`, {
        headers: {
            'Authorization': `Bearer ${secret}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to download file from storage service: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Triggers a docx-to-pdf conversion on the NestJS helper service.
 */
export async function triggerDocxToPdfConversion(inputUrl: string, outputUrl: string): Promise<number> {
    const serviceUrl = process.env['STORAGE_SERVICE_URL'];
    const secret = process.env['STORAGE_SERVICE_SECRET'];
    if (!serviceUrl || !secret) {
        throw new Error("Storage service is not configured.");
    }

    const inputPath = getRelativePath(inputUrl);
    const outputPath = getRelativePath(outputUrl);

    const response = await fetch(
        `${serviceUrl}/process/docx-to-pdf?inputPath=${encodeURIComponent(inputPath)}&outputPath=${encodeURIComponent(outputPath)}`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${secret}`
            }
        }
    );

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Failed to convert document: ${errText}`);
    }

    const data = await response.json() as { success: boolean; pdfPath: string; fileSize: number };
    return data.fileSize;
}


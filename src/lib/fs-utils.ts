import 'server-only';
import {
    getStorageServiceClient,
    getStorageServiceRequestConfig,
    type BrandingMetadata,
} from './storage-service-client';

export { getStorageServiceRequestConfig, type BrandingMetadata };

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

export async function safeDeleteFile(fileUrl: string | null | undefined): Promise<void> {
    if (!fileUrl) return;

    try {
        await getStorageServiceClient().deleteFile(fileUrl);
    } catch (error) {
        console.error(`Error deleting file ${fileUrl}:`, error);
    }
}

export async function uploadFileToStorage(
    relativePath: string,
    file: File | Buffer,
    originalName?: string,
): Promise<void> {
    await getStorageServiceClient().uploadFile(relativePath, file, originalName);
}

export async function downloadFileFromStorage(fileUrl: string): Promise<Buffer> {
    return getStorageServiceClient().downloadFile(fileUrl);
}

export async function triggerDocxToPdfConversion(
    inputUrl: string,
    outputUrl: string,
): Promise<number> {
    const result = await getStorageServiceClient().convertDocxToPdf(inputUrl, outputUrl);
    return result.fileSize;
}

export async function getStorageSizeFromService(): Promise<number> {
    try {
        return await getStorageServiceClient().getStorageSize();
    } catch (error) {
        console.error('Error fetching storage size:', error);
        return 0;
    }
}

export async function triggerPdfBranding(
    inputUrl: string,
    outputUrl: string,
    metadata: BrandingMetadata,
): Promise<void> {
    await getStorageServiceClient().brandPdf(inputUrl, outputUrl, metadata);
}

export async function getStorageStats(): Promise<{
    success: boolean;
    sizeBytes: number;
    sizeMB: number;
    fileCount: number;
} | null> {
    try {
        return await getStorageServiceClient().getStorageStats();
    } catch (error) {
        console.warn('Failed to fetch storage stats from storage-service:', error);
        return null;
    }
}

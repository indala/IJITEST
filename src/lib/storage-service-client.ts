import 'server-only';
import path from 'path';

export interface BrandingMetadata {
    journalName: string;
    journalShortName: string;
    volume: number;
    issue: number;
    year: number;
    monthRange?: string;
    issn: string;
    website: string;
    paperId: string;
    startPage?: number | null;
    endPage?: number | null;
    doi?: string | null;
    license?: string | null;
}

export interface IssueBookArticle {
    paperId: string;
    title: string;
    authors: string[];
    pdfPath: string;
    startPage?: number;
    endPage?: number;
    doi?: string;
}

export interface IssueBookMetadata {
    journalName: string;
    journalShortName: string;
    volume: number;
    issue: number;
    year: number;
    monthRange?: string;
    issn: string;
    website?: string;
    articles: IssueBookArticle[];
}

export interface DocxToPdfResponse {
    success: boolean;
    pdfPath: string;
    fileSize: number;
}

export interface StorageStats {
    success: boolean;
    sizeBytes: number;
    sizeMB: number;
    fileCount: number;
}

export interface IssueBookResponse {
    success: boolean;
    outputPath: string;
    totalPages: number;
    articleCount: number;
    fileSize: number;
}

export function getStorageServiceRequestConfig(): {
    serviceUrl: string;
    headers: Record<string, string>;
} {
    const serviceUrl = process.env['STORAGE_SERVICE_URL'];
    const secret = process.env['STORAGE_SERVICE_SECRET'];

    if (!serviceUrl || !secret) {
        throw new Error('Storage service is not configured.');
    }

    return {
        serviceUrl: serviceUrl.replace(/\/+$/, ''),
        headers: {
            Authorization: `Bearer ${secret}`,
        },
    };
}

function getRelativePath(filePath: string): string {
    const cleanPath = filePath.replace(/^\/+/, '');
    if (cleanPath.startsWith('api/files/')) {
        return cleanPath.replace('api/files/', '');
    }
    if (cleanPath.startsWith('uploads/')) {
        return cleanPath.replace('uploads/', '');
    }
    return cleanPath;
}

async function getErrorMessage(response: Response): Promise<string> {
    const body = await response.text();
    return body || `${response.status} ${response.statusText}`;
}

export class StorageServiceClient {
    private get connection(): {
        serviceUrl: string;
        headers: Record<string, string>;
    } {
        return getStorageServiceRequestConfig();
    }

    private buildUrl(endpoint: string, query?: Record<string, string>): string {
        const { serviceUrl } = this.connection;
        const url = new URL(endpoint, `${serviceUrl}/`);
        if (query) {
            for (const [key, value] of Object.entries(query)) {
                url.searchParams.set(key, value);
            }
        }
        return url.toString();
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const relativePath = getRelativePath(fileUrl);
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('storage/delete', { path: relativePath }), {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Storage service deletion failed: ${await getErrorMessage(response)}`);
        }
    }

    async uploadFile(relativePath: string, file: File | Buffer, originalName?: string): Promise<void> {
        const cleanRelativePath = getRelativePath(relativePath);
        const { headers } = this.connection;
        const formData = new FormData();

        if (file instanceof Buffer) {
            const bytes = new Uint8Array(file.byteLength);
            bytes.set(file);
            formData.append(
                'file',
                new Blob([bytes.buffer as ArrayBuffer]),
                originalName || path.basename(relativePath),
            );
        } else {
            formData.append('file', file as Blob);
        }

        const response = await fetch(this.buildUrl('storage/upload', { path: cleanRelativePath }), {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Storage service upload failed: ${await getErrorMessage(response)}`);
        }
    }

    async downloadFile(fileUrl: string): Promise<Buffer> {
        const relativePath = getRelativePath(fileUrl);
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('storage/download', { path: relativePath }), {
            headers,
        });

        if (!response.ok) {
            throw new Error(`Storage service download failed: ${await getErrorMessage(response)}`);
        }

        return Buffer.from(await response.arrayBuffer());
    }

    async convertDocxToPdf(inputUrl: string, outputUrl: string): Promise<DocxToPdfResponse> {
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('process/docx-to-pdf', {
            inputPath: getRelativePath(inputUrl),
            outputPath: getRelativePath(outputUrl),
        }), {
            method: 'POST',
            headers,
        });

        if (!response.ok) {
            throw new Error(`Storage service conversion failed: ${await getErrorMessage(response)}`);
        }

        return await response.json() as DocxToPdfResponse;
    }

    async brandPdf(inputUrl: string, outputUrl: string, metadata: BrandingMetadata): Promise<void> {
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('process/brand-pdf', {
            inputPath: getRelativePath(inputUrl),
            outputPath: getRelativePath(outputUrl),
        }), {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        });

        if (!response.ok) {
            throw new Error(`Storage service branding failed: ${await getErrorMessage(response)}`);
        }
    }

    async generateIssueBook(outputPath: string, metadata: IssueBookMetadata): Promise<IssueBookResponse> {
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('process/issue-book', {
            outputPath,
        }), {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(metadata),
        });

        if (!response.ok) {
            throw new Error(`Storage service issue-book generation failed: ${await getErrorMessage(response)}`);
        }

        return await response.json() as IssueBookResponse;
    }

    async getStorageSize(): Promise<number> {
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('storage/size'), { headers });

        if (!response.ok) {
            throw new Error(`Storage service size request failed: ${await getErrorMessage(response)}`);
        }

        const data = await response.json() as { sizeBytes: number };
        return data.sizeBytes;
    }

    async getStorageStats(): Promise<StorageStats> {
        const { headers } = this.connection;
        const response = await fetch(this.buildUrl('storage/stats'), {
            headers,
            next: { revalidate: 300 },
        });

        if (!response.ok) {
            throw new Error(`Storage service stats request failed: ${await getErrorMessage(response)}`);
        }

        return await response.json() as StorageStats;
    }
}

export function getStorageServiceClient(): StorageServiceClient {
    return new StorageServiceClient();
}

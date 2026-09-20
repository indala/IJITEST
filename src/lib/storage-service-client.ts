import 'server-only';
import path from 'path';
import { z } from 'zod';

const DEFAULT_REQUEST_TIMEOUT_MS = 30_000;

const successResponseSchema = z.object({
    success: z.literal(true),
});

const docxToPdfResponseSchema = successResponseSchema.extend({
    pdfPath: z.string().min(1),
    fileSize: z.number().int().nonnegative(),
});

const storageStatsSchema = successResponseSchema.extend({
    sizeBytes: z.number().int().nonnegative(),
    sizeMB: z.number().nonnegative(),
    fileCount: z.number().int().nonnegative(),
});

const issueBookResponseSchema = successResponseSchema.extend({
    outputPath: z.string().min(1),
    totalPages: z.number().int().nonnegative(),
    articleCount: z.number().int().nonnegative(),
    fileSize: z.number().int().nonnegative(),
});

const storageSizeSchema = z.object({
    sizeBytes: z.number().int().nonnegative(),
});

const uploadResponseSchema = successResponseSchema.extend({
    filePath: z.string().min(1),
});

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
    receivedDate?: string | null;
    acceptedDate?: string | null;
    runningTitle?: string | null;
    firstAuthor?: string | null;
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

export class StorageServiceError extends Error {
    readonly status?: number;
    readonly code: 'configuration' | 'timeout' | 'http' | 'response' | 'network';

    constructor(
        message: string,
        code: StorageServiceError['code'],
        options?: { status?: number; cause?: unknown },
    ) {
        super(message, options?.cause === undefined ? undefined : { cause: options.cause });
        this.name = 'StorageServiceError';
        this.code = code;
        if (options?.status !== undefined) {
            this.status = options.status;
        }
    }
}

export function getStorageServiceRequestConfig(): {
    serviceUrl: string;
    headers: Record<string, string>;
    timeoutMs: number;
} {
    const serviceUrl = process.env['STORAGE_SERVICE_URL'];
    const secret = process.env['STORAGE_SERVICE_SECRET'];

    if (!serviceUrl || !secret) {
        throw new StorageServiceError(
            'Storage service is not configured.',
            'configuration',
        );
    }

    const configuredTimeout = Number(process.env['STORAGE_SERVICE_TIMEOUT_MS']);
    const timeoutMs =
        Number.isSafeInteger(configuredTimeout) && configuredTimeout > 0
            ? configuredTimeout
            : DEFAULT_REQUEST_TIMEOUT_MS;

    return {
        serviceUrl: serviceUrl.replace(/\/+$/, ''),
        timeoutMs,
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

function parseResponse<T>(
    response: unknown,
    schema: z.ZodType<T>,
    operation: string,
): T {
    const result = schema.safeParse(response);
    if (!result.success) {
        throw new StorageServiceError(
            `Storage service returned an invalid ${operation} response.`,
            'response',
            { cause: result.error },
        );
    }
    return result.data;
}

async function parseJsonResponse<T>(
    response: Response,
    schema: z.ZodType<T>,
    operation: string,
): Promise<T> {
    try {
        return parseResponse(await response.json(), schema, operation);
    } catch (error: unknown) {
        if (error instanceof StorageServiceError) {
            throw error;
        }
        throw new StorageServiceError(
            `Storage service returned unreadable ${operation} JSON.`,
            'response',
            { cause: error },
        );
    }
}

export class StorageServiceClient {
    private get connection(): {
        serviceUrl: string;
        headers: Record<string, string>;
        timeoutMs: number;
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

    private async request(
        endpoint: string,
        init: RequestInit = {},
        query?: Record<string, string>,
    ): Promise<Response> {
        const { headers, timeoutMs } = this.connection;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(this.buildUrl(endpoint, query), {
                ...init,
                headers: {
                    ...headers,
                    ...init.headers,
                },
                signal: controller.signal,
            });
        } catch (error: unknown) {
            if (error instanceof DOMException && error.name === 'AbortError') {
                throw new StorageServiceError(
                    `Storage service request timed out after ${timeoutMs}ms.`,
                    'timeout',
                    { cause: error },
                );
            }
            throw new StorageServiceError(
                'Storage service request failed.',
                'network',
                { cause: error },
            );
        } finally {
            clearTimeout(timeout);
        }
    }

    private async ensureSuccess(
        response: Response,
        operation: string,
    ): Promise<void> {
        if (!response.ok) {
            throw new StorageServiceError(
                `Storage service ${operation} failed: ${await getErrorMessage(response)}`,
                'http',
                { status: response.status },
            );
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        const relativePath = getRelativePath(fileUrl);
        const response = await this.request(
            'storage/delete',
            { method: 'DELETE' },
            { path: relativePath },
        );

        await this.ensureSuccess(response, 'deletion');
        await parseJsonResponse(response, successResponseSchema, 'deletion');
    }

    async uploadFile(
        relativePath: string,
        file: File | Buffer,
        originalName?: string,
    ): Promise<void> {
        const cleanRelativePath = getRelativePath(relativePath);
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
            formData.append('file', file as Blob, originalName || (file as File).name || path.basename(relativePath));
        }

        const response = await this.request(
            'storage/upload',
            {
                method: 'POST',
                body: formData,
            },
            { path: cleanRelativePath },
        );

        await this.ensureSuccess(response, 'upload');
        await parseJsonResponse(response, uploadResponseSchema, 'upload');
    }

    async downloadFile(fileUrl: string): Promise<Buffer> {
        const relativePath = getRelativePath(fileUrl);
        const response = await this.request(
            'storage/download',
            {},
            { path: relativePath },
        );

        await this.ensureSuccess(response, 'download');
        return Buffer.from(await response.arrayBuffer());
    }

    async convertDocxToPdf(
        inputUrl: string,
        outputUrl: string,
    ): Promise<DocxToPdfResponse> {
        const response = await this.request(
            'process/docx-to-pdf',
            { method: 'POST' },
            {
                inputPath: getRelativePath(inputUrl),
                outputPath: getRelativePath(outputUrl),
            },
        );

        await this.ensureSuccess(response, 'conversion');
        return parseJsonResponse(
            response,
            docxToPdfResponseSchema,
            'conversion',
        );
    }

    async brandPdf(
        inputUrl: string,
        outputUrl: string,
        metadata: BrandingMetadata,
    ): Promise<void> {
        const response = await this.request(
            'process/brand-pdf',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata),
            },
            {
                inputPath: getRelativePath(inputUrl),
                outputPath: getRelativePath(outputUrl),
            },
        );

        await this.ensureSuccess(response, 'branding');
        await parseJsonResponse(response, successResponseSchema, 'branding');
    }

    async generateIssueBook(
        outputPath: string,
        metadata: IssueBookMetadata,
    ): Promise<IssueBookResponse> {
        const response = await this.request(
            'process/issue-book',
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(metadata),
            },
            { outputPath },
        );

        await this.ensureSuccess(response, 'issue-book generation');
        return parseJsonResponse(
            response,
            issueBookResponseSchema,
            'issue-book generation',
        );
    }

    async getStorageSize(): Promise<number> {
        const response = await this.request('storage/size');
        await this.ensureSuccess(response, 'size request');

        const data = await parseJsonResponse(
            response,
            storageSizeSchema,
            'size',
        );
        return data.sizeBytes;
    }

    async getStorageStats(): Promise<StorageStats> {
        const response = await this.request('storage/stats', {
            next: { revalidate: 300 },
        });

        await this.ensureSuccess(response, 'stats request');
        return parseJsonResponse(
            response,
            storageStatsSchema,
            'stats',
        );
    }
}

export function getStorageServiceClient(): StorageServiceClient {
    return new StorageServiceClient();
}

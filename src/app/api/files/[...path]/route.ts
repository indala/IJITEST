import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import {
    submissionFiles,
    submissionVersions, 
    submissions, 
    reviewAssignments
} from '@/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { getStorageServiceRequestConfig } from '@/lib/storage-service-client';
import { type FileType } from '@/db/types';
import path from 'path';

/**
 * Secure file serving route.
 * Handles authorization based on user role and file relationship.
 */
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const { path: pathSegments } = await params;

    // Path traversal check
    if (pathSegments.some(segment => segment === '..' || segment === '.' || segment === '')) {
        return new NextResponse("Forbidden", { status: 403 });
    }

    const category = pathSegments[0]; // e.g., "submissions", "reviewer-apps", "issues"
    const filename = pathSegments.slice(1).join('/');

    // Handle case-insensitive redirects for published files starting with "ijitest-"
    if (category === 'published') {
        const canonicalFilename = filename.replace(/^ijitest-/i, 'IJITEST-');
        if (canonicalFilename !== filename) {
            const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org';
            return NextResponse.redirect(`${baseUrl}/api/files/published/${canonicalFilename}`, 308);
        }
    }

    const relativePath = `${category}/${filename}`;

    // 0. Published, docs, profiles, announcements, and compiled issue books are public open-access
    if (category && ['published', 'docs', 'profiles', 'announcements', 'issues'].includes(category)) {
        return serveFile(relativePath);
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 1. Admin & Editor have full access
    if (['admin', 'editor'].includes(session.user.role)) {
        return serveFile(relativePath);
    }

    // 2. Role-specific Authorization
    try {
        if (category === 'submissions') {
            const isAuthorized = await checkSubmissionAccess(session.user.id, session.user.role, relativePath);
            if (isAuthorized) return serveFile(relativePath);
        } 
        
        if (category === 'reviewer-apps') {
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (category === 'reviews') {
            const isAuthorized = await checkReviewAccess(session.user.id, relativePath);
            if (isAuthorized) return serveFile(relativePath);
        }

    } catch (error) {
        console.error("File proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

async function serveFile(relativePath: string) {
    const cleanRelativePath = relativePath.replace(/^\/+/, '');
    const ext = path.extname(relativePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
        '.gif': 'image/gif',
    };

    let safeFilename = path.basename(relativePath).replace(/["\r\n]/g, '');
    const lowerName = safeFilename.toLowerCase();
    if (lowerName.includes('template')) {
        safeFilename = 'IJITEST-Manuscript-Template.docx';
    } else if (lowerName.includes('copyright') || lowerName.includes('license') || lowerName.includes('agreement')) {
        safeFilename = 'IJITEST-Publication-License-Agreement.docx';
    }

    // Attempt zero-buffer direct stream piping from storage-service
    try {
        const { serviceUrl, headers } = getStorageServiceRequestConfig();
        const downloadUrl = new URL('storage/download', `${serviceUrl}/`);
        downloadUrl.searchParams.set('path', cleanRelativePath);

        const storageRes = await fetch(downloadUrl.toString(), {
            headers,
            cache: 'no-store',
        });

        if (storageRes.ok && storageRes.body) {
            const responseHeaders: Record<string, string> = {
                'Content-Type': mimeTypes[ext] || storageRes.headers.get('content-type') || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${safeFilename}"`,
            };

            const contentLength = storageRes.headers.get('content-length');
            if (contentLength) {
                responseHeaders['Content-Length'] = contentLength;
            }

            if (cleanRelativePath.startsWith('published/') || cleanRelativePath.startsWith('issues/')) {
                responseHeaders['Cache-Control'] = 'public, max-age=86400, stale-while-revalidate=604800';
            }

            return new NextResponse(storageRes.body, {
                status: 200,
                headers: responseHeaders,
            });
        }
    } catch (storageErr) {
        console.warn(`Storage service stream unavailable for ${relativePath}, attempting local fallback:`, storageErr);
    }

    // Fallback for public static assets stored locally in public/
    try {
        const localPublicPath = path.resolve(process.cwd(), 'public', cleanRelativePath);
        const fs = await import('fs/promises');
        const fileBuffer = await fs.readFile(localPublicPath);

        return new NextResponse(new Uint8Array(fileBuffer), {
            headers: {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${safeFilename}"`,
            },
        });
    } catch (err) {
        console.error("Storage download failed:", err);
        return new NextResponse("File Not Found", { status: 404 });
    }
}

async function checkSubmissionAccess(userId: string, role: string, fileUrl: string) {
    const cleanPath = fileUrl.replace(/^\/+/, '');
    const apiFileUrl = `/api/files/${cleanPath}`;
    const legacyUrl = `/uploads/${cleanPath}`;
    const directUrl = `/${cleanPath}`;

    const files = await db.select({
        submissionId: submissionVersions.submissionId,
        authorId: submissions.correspondingAuthorId,
        fileType: submissionFiles.fileType,
    })
    .from(submissionFiles)
    .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
    .innerJoin(submissions, eq(submissionVersions.submissionId, submissions.id))
    .where(or(
        eq(submissionFiles.fileUrl, apiFileUrl),
        eq(submissionFiles.fileUrl, legacyUrl),
        eq(submissionFiles.fileUrl, directUrl),
        eq(submissionFiles.fileUrl, cleanPath)
    ))
    .limit(1);

    const fileData = files[0];
    if (!fileData) return false;
    const { submissionId, authorId, fileType } = fileData;

    if (role === 'author') {
        return authorId === userId;
    }

    if (role === 'reviewer') {
        // Strict double-blind confidentiality:
        // Reviewers can ONLY access anonymized blinded manuscripts or system review PDFs
        const allowedReviewerFileTypes: FileType[] = ['blindedManuscript', 'pdfVersion', 'supplementary'];
        if (!allowedReviewerFileTypes.includes(fileType)) {
            return false;
        }

        const assignments = await db.select()
            .from(reviewAssignments)
            .where(and(
                eq(reviewAssignments.submissionId, submissionId),
                eq(reviewAssignments.reviewerId, userId)
            ))
            .limit(1);
        return assignments.length > 0;
    }

    return false;
}

async function checkReviewAccess(userId: string, fileUrl: string) {
    return checkSubmissionAccess(userId, 'reviewer', fileUrl);
}

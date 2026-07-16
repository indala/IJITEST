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
import { downloadFileFromStorage } from '@/lib/fs-utils';
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

    const category = pathSegments[0]; // e.g., "submissions", "reviewer-apps"
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

    // 0. Published, docs, and profile files are public to all
    if (category && ['published', 'docs', 'profiles'].includes(category)) {
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
            // Only admin can see CVs (checked above), or the user themselves?
            // Usually, applicants don't have accounts yet, so just admin.
            return new NextResponse("Forbidden", { status: 403 });
        }

        if (category === 'reviews') {
            // Handled similarly to submissions or specific logic for review docs
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
    try {
        const fileBuffer = await downloadFileFromStorage(relativePath);
        
        const ext = path.extname(relativePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        };

        const safeFilename = path.basename(relativePath).replace(/["\r\n]/g, '');
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
    const { submissionId, authorId } = fileData;

    if (role === 'author') {
        return authorId === userId;
    }

    if (role === 'reviewer') {
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
    // Reviews usually follow the same logic as submissions for now
    return checkSubmissionAccess(userId, 'reviewer', fileUrl);
}

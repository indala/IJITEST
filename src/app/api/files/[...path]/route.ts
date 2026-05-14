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
import { eq, and } from 'drizzle-orm';
import fs from 'fs/promises';
import { getStoragePath, getPublicUploadsPath } from '@/lib/fs-utils';
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
    const category = pathSegments[0]; // e.g., "submissions", "reviewer-apps"
    const filename = pathSegments.slice(1).join('/');
    const relativePath = `${category}/${filename}`;

    // 0. Published files are public to all
    if (category === 'published') {
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

    } catch { /* ignore */
        return new NextResponse("Internal Server Error", { status: 500 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

async function serveFile(relativePath: string) {
    try {
        const absolutePath = getStoragePath(relativePath);
        await fs.access(absolutePath);
        const fileBuffer = await fs.readFile(absolutePath);
        
        const ext = path.extname(absolutePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.pdf': 'application/pdf',
            '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
        };

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Content-Disposition': `inline; filename="${path.basename(absolutePath)}"`,
            },
        });
    } catch { // Fallback to legacy public path for migration period
        try {
            const legacyPath = getPublicUploadsPath(relativePath);
            await fs.access(legacyPath);
            const fileBuffer = await fs.readFile(legacyPath);
            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': 'application/octet-stream', // Simple fallback
                    'Content-Disposition': `inline; filename="${path.basename(legacyPath)}"`,
                },
            });
        } catch {
            return new NextResponse("File Not Found", { status: 404 });
        }
    }
}

async function checkSubmissionAccess(userId: string, role: string, fileUrl: string) {
    // We need to find which submission this file belongs to
    // fileUrl in DB is stored as "/uploads/submissions/..." or we might have updated it
    const searchUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    const legacyUrl = fileUrl.startsWith('/uploads/') ? fileUrl : `/uploads/${fileUrl}`;

    const files = await db.select({
        submissionId: submissionVersions.submissionId,
        authorId: submissions.correspondingAuthorId,
    })
    .from(submissionFiles)
    .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
    .innerJoin(submissions, eq(submissionVersions.submissionId, submissions.id))
    .where(and(
        // Check both new and old URL formats
        eq(submissionFiles.fileUrl, searchUrl)
    ))
    .limit(1);

    if (files.length === 0) {
        // Try fallback with /uploads prefix if not found
        const fallbackFiles = await db.select({
            submissionId: submissionVersions.submissionId,
            authorId: submissions.correspondingAuthorId,
        })
        .from(submissionFiles)
        .innerJoin(submissionVersions, eq(submissionFiles.versionId, submissionVersions.id))
        .innerJoin(submissions, eq(submissionVersions.submissionId, submissions.id))
        .where(eq(submissionFiles.fileUrl, legacyUrl))
        .limit(1);
        
        if (fallbackFiles.length === 0) return false;
        files.push(...fallbackFiles);
    }

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

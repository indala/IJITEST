import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, publications, volumesIssues } from "@/db/schema";
import { eq, or, sql } from "drizzle-orm";
import { type PaperDetailParams } from "@/db/types";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<Pick<PaperDetailParams, 'paperId'>> }
) {
    try {
        const { paperId } = await context.params;
        if (!paperId) {
            return new NextResponse("Paper ID is required", { status: 400 });
        }

        const trimmed = paperId.trim();
        const canonicalPaperId = trimmed.toUpperCase();
        const numericId = /^\d+$/.test(trimmed) ? parseInt(trimmed, 10) : null;

        // 1. Fetch the publication and volume/issue details for this paper ID or numeric ID
        const whereClause = numericId !== null
            ? or(
                eq(submissions.paperId, canonicalPaperId),
                eq(submissions.id, numericId)
            )
            : or(
                eq(submissions.paperId, canonicalPaperId),
                sql`LOWER(${submissions.paperId}) = ${trimmed.toLowerCase()}`
            );

        const pubRows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            volumeNumber: volumesIssues.volumeNumber,
            issueNumber: volumesIssues.issueNumber,
        })
            .from(submissions)
            .innerJoin(publications, eq(submissions.id, publications.submissionId))
            .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
            .where(whereClause)
            .limit(1);

        const row = pubRows[0];
        if (!row) {
            return new NextResponse("Article Not Found", { status: 404 });
        }

        const { volumeNumber, issueNumber, paperId: resolvedPaperId } = row;

        // 2. Canonical redirect to permanent archive repository URL
        const redirectUrl = `/archives/volume${volumeNumber}/issue${issueNumber}/${resolvedPaperId}`;
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || process.env['APP_URL'] || 'https://ijitest.org';
        return NextResponse.redirect(`${baseUrl.replace(/\/$/, '')}${redirectUrl}`, 308);
    } catch (error) {
        console.error("Paper redirect error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

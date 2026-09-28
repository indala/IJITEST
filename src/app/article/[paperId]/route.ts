import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, publications, volumesIssues } from "@/db/schema";
import { eq, and } from "drizzle-orm";
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

        const canonicalPaperId = paperId.toUpperCase();

        // 1. Fetch the publication and volume/issue details for this paper ID
        const pubRows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            volumeNumber: volumesIssues.volumeNumber,
            issueNumber: volumesIssues.issueNumber,
        })
            .from(submissions)
            .innerJoin(publications, eq(submissions.id, publications.submissionId))
            .innerJoin(volumesIssues, and(
                eq(publications.issueId, volumesIssues.id),
                eq(volumesIssues.status, 'published')
            ))
            .where(and(
                eq(submissions.paperId, canonicalPaperId),
                eq(submissions.status, 'published')
            ))
            .limit(1);

        const row = pubRows[0];
        if (!row) {
            // Paper not published or doesn't exist
            return new NextResponse("Article Not Found", { status: 404 });
        }

        const { volumeNumber, issueNumber } = row;

        // 2. Canonical redirect to permanent archive repository URL
        const redirectUrl = `/archives/volume${volumeNumber}/issue${issueNumber}/${canonicalPaperId}`;
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org';
        return NextResponse.redirect(`${baseUrl}${redirectUrl}`, 308);
    } catch (error) {
        console.error("Paper redirect error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

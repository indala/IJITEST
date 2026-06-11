import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { submissions, publications, volumesIssues } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getLatestIssuePapers } from "@/actions/archives";
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

        // 1. Fetch the publication and volume/issue details for this paper ID
        const pubRows = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            volumeNumber: volumesIssues.volumeNumber,
            issueNumber: volumesIssues.issueNumber,
        })
        .from(submissions)
        .innerJoin(publications, eq(submissions.id, publications.submissionId))
        .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .where(eq(submissions.paperId, paperId))
        .limit(1);

        const row = pubRows[0];
        if (!row) {
            // Paper not published or doesn't exist
            return new NextResponse("Article Not Found", { status: 404 });
        }

        const { id, volumeNumber, issueNumber } = row;

        // 2. Fetch latest issue papers to check if this paper is in the current/latest issue
        const latestRes = await getLatestIssuePapers();
        const latestPapers = latestRes.success ? latestRes.data ?? [] : [];
        const isCurrent = latestPapers.some((p) => p.id === id);

        const basePath = isCurrent ? "current-issue" : "archives";
        const redirectUrl = `/${basePath}/volume${volumeNumber}/issue${issueNumber}/${paperId}`;

        // 3. Perform redirect
        const baseUrl = process.env['NEXT_PUBLIC_APP_URL'] || 'https://www.ijitest.org';
        return NextResponse.redirect(`${baseUrl}${redirectUrl}`, 302);
    } catch (error) {
        console.error("Paper redirect error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

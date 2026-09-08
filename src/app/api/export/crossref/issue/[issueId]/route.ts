import { NextRequest, NextResponse } from "next/server";
import { getIssuePapersByIssueId } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generateCrossRefXml } from "@/lib/crossref-generator";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ issueId: string }> }
) {
    try {
        const { issueId } = await params;
        const numericIssueId = Number(issueId);
        if (!issueId || isNaN(numericIssueId)) {
            return new NextResponse("Valid numeric issue ID is required", { status: 400 });
        }

        const [issueRes, settings] = await Promise.all([
            getIssuePapersByIssueId(numericIssueId),
            getSettingsData()
        ]);

        if (!issueRes.success || !issueRes.data) {
            return new NextResponse(issueRes.error || "Issue not found", { status: 404 });
        }

        const { issue, papers } = issueRes.data;
        const papersWithDoi = papers.filter(p => Boolean(p.doi));

        if (papersWithDoi.length === 0) {
            return new NextResponse("No published papers in this issue have an assigned DOI", { status: 400 });
        }

        const xml = generateCrossRefXml({
            settings,
            papers: papersWithDoi,
            issue: {
                volumeNumber: issue.volumeNumber,
                issueNumber: issue.issueNumber,
                year: issue.year,
                monthRange: issue.monthRange,
            },
        });

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Content-Disposition": `attachment; filename="crossref-issue-vol${issue.volumeNumber}-iss${issue.issueNumber}.xml"`,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("CrossRef issue export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

import { NextRequest, NextResponse } from "next/server";
import { getPaperById } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generatePublicationCertificate } from "@/lib/certificate-generator";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ paperId: string }> }
) {
    try {
        const { paperId } = await params;
        if (!paperId) {
            return new NextResponse("Paper ID is required", { status: 400 });
        }

        const [paperRes, settings] = await Promise.all([
            getPaperById(paperId.toUpperCase()),
            getSettingsData()
        ]);

        if (!paperRes.success || !paperRes.data) {
            return new NextResponse("Paper not found", { status: 404 });
        }

        const paper = paperRes.data;
        const authors = Array.isArray(paper.authorsList) && paper.authorsList.length > 0
            ? paper.authorsList
            : [paper.authorName];

        const pdfBytes = await generatePublicationCertificate({
            paperId: paper.paperId,
            title: paper.title,
            authors,
            volume: paper.volumeNumber || 1,
            issue: paper.issueNumber || 1,
            year: paper.publicationYear || new Date().getFullYear(),
            monthRange: paper.monthRange,
            doi: paper.doi || null,
            publishedDate: paper.publishedAt || paper.updatedAt,
            issn: settings['issnNumber'] || "2584-XXXX",
            journalTitle: settings['journalName'] || "International Journal of Innovative Trends in Engineering Science and Technology",
            baseUrl: process.env['NEXT_PUBLIC_APP_URL'] || "https://ijitest.org",
        });

        const safeFilename = `Certificate-${paper.paperId}.pdf`;

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
                "Cache-Control": "public, max-age=86400",
            },
        });
    } catch (error) {
        console.error("Certificate generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

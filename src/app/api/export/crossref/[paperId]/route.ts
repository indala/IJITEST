import { NextRequest, NextResponse } from "next/server";
import { getPaperById } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generateCrossRefXml } from "@/lib/crossref-generator";

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
        if (!paper.doi) {
            return new NextResponse("Paper does not have an assigned DOI", { status: 400 });
        }

        const xml = generateCrossRefXml({
            settings,
            papers: [paper],
        });

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/xml; charset=utf-8",
                "Content-Disposition": `attachment; filename="crossref-${paper.paperId}.xml"`,
                "Cache-Control": "public, max-age=3600",
            },
        });
    } catch (error) {
        console.error("CrossRef export error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

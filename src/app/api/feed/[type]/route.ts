import { NextResponse } from "next/server";
import { getPublishedPapers } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generateRssFeed, generateAtomFeed } from "@/lib/feed-generator";


export function generateStaticParams() {
    return [
        { type: "rss" },
        { type: "atom" },
    ];
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ type: string }> }
) {
    try {
        const { type } = await params;
        const normalizedType = (type || "rss").toLowerCase();

        const [papersRes, settings] = await Promise.all([
            getPublishedPapers(),
            getSettingsData()
        ]);

        const allPapers = papersRes.success ? papersRes.data : [];
        const papers = allPapers.slice(0, 30);
        const baseUrl = (settings['journalWebsite'] || process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');
        const feedUrl = `${baseUrl}/api/feed/${normalizedType}`;

        if (normalizedType === "atom") {
            const xml = generateAtomFeed({
                settings,
                papers,
                feedUrl,
            });
            return new NextResponse(xml, {
                status: 200,
                headers: {
                    "Content-Type": "application/atom+xml; charset=utf-8",
                    "Cache-Control": "public, max-age=3600, s-maxage=3600",
                },
            });
        }

        // Default to RSS 2.0 (rss or rss2)
        const xml = generateRssFeed({
            settings,
            papers,
            feedUrl,
        });

        return new NextResponse(xml, {
            status: 200,
            headers: {
                "Content-Type": "application/rss+xml; charset=utf-8",
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Feed generation error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


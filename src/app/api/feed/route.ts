import { NextResponse } from "next/server";
import { getPublishedPapers } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generateRssFeed } from "@/lib/feed-generator";


export async function GET() {
    try {
        const [papersRes, settings] = await Promise.all([
            getPublishedPapers(),
            getSettingsData()
        ]);

        const allPapers = papersRes.success ? papersRes.data : [];
        const papers = allPapers.slice(0, 30);
        const baseUrl = (settings['journalWebsite'] || process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org').replace(/\/$/, '');
        const feedUrl = `${baseUrl}/api/feed`;

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
        console.error("Default feed error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}


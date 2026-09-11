import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getStaticPageBySlug, getNavStaticPages } from "@/actions/static-pages";
import { getSettingsData } from "@/actions/settings";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowLeft } from "lucide-react";
import Link from "next/link";

export async function generateStaticParams() {
    try {
        const res = await getNavStaticPages();
        if (res.success && res.data && res.data.length > 0) {
            return res.data.map(p => ({ slug: p.slug }));
        }
        return [
            { slug: "open-access-policy" },
            { slug: "ethics-and-malpractice" },
            { slug: "peer-review-process" },
            { slug: "author-guidelines" }
        ];
    } catch {
        return [
            { slug: "open-access-policy" },
            { slug: "ethics-and-malpractice" },
            { slug: "peer-review-process" },
            { slug: "author-guidelines" }
        ];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const res = await getStaticPageBySlug(slug);
    if (!res.success || !res.data) return { title: "Page Not Found" };

    const settings = await getSettingsData();
    const journalShort = settings["journalShortName"] || "IJITEST";

    return {
        title: `${res.data.title} | ${journalShort}`,
        description: res.data.content.replace(/[#*`_]/g, "").slice(0, 160),
        alternates: {
            canonical: `/pages/${slug}`,
        },
    };
}

export default async function DynamicStaticPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const res = await getStaticPageBySlug(slug);

    if (!res.success || !res.data) {
        notFound();
    }

    const page = res.data;

    return (
        <div className="min-h-screen pb-16">
            <PageHeader
                title={page.title}
                description="Official Scholarly Policy and Journal Documentation"
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: page.title, href: `/pages/${slug}` },
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>

                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Last updated: {new Date(page.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    </div>
                </div>

                <Card className="shadow-sm">
                    <CardContent className="p-6 sm:p-10">
                        <article className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap font-sans text-sm sm:text-base">
                            {page.content}
                        </article>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

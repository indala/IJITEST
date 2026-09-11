import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnnouncementById, getAnnouncements } from "@/actions/announcements";
import { getSettingsData } from "@/actions/settings";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowLeft, Send, FileText } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateStaticParams() {
    try {
        const res = await getAnnouncements();
        if (res.success && res.data && res.data.length > 0) {
            return res.data.map(a => ({ id: String(a.id) }));
        }
        return [{ id: "1" }, { id: "2" }, { id: "3" }];
    } catch {
        return [{ id: "1" }, { id: "2" }, { id: "3" }];
    }
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ id: string }>;
}): Promise<Metadata> {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) return { title: "Announcement Not Found" };

    const res = await getAnnouncementById(numId);
    if (!res.success || !res.data) return { title: "Announcement Not Found" };

    const settings = await getSettingsData();
    const journalShort = settings["journalShortName"] || "IJITEST";

    return {
        title: `${res.data.title} | ${journalShort}`,
        description: res.data.descriptionShort || res.data.description.slice(0, 160),
        openGraph: {
            title: res.data.title,
            description: res.data.descriptionShort || res.data.description.slice(0, 160),
            images: res.data.imageUrl ? [res.data.imageUrl] : [],
        },
    };
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    call_for_papers: { label: "Call for Papers", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300" },
    news: { label: "Journal News", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
    editorial_update: { label: "Editorial Update", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
    event: { label: "Scholarly Event", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default async function AnnouncementDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) notFound();

    const res = await getAnnouncementById(numId);
    if (!res.success || !res.data) notFound();

    const item = res.data;
    const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG["news"]!;

    return (
        <div className="min-h-screen pb-16">
            <PageHeader
                title={item.title}
                description={`Published on ${new Date(item.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Announcements", href: "/announcements" },
                    { name: item.title, href: `/announcements/${item.id}` },
                ]}
            />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
                {/* Back button & Action bar */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                        <Link href="/announcements">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to All Announcements
                        </Link>
                    </Button>

                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={typeInfo.color}>
                            {typeInfo.label}
                        </Badge>
                        {item.priority > 0 && (
                            <Badge variant="secondary">Featured Notice</Badge>
                        )}
                    </div>
                </div>

                {/* Banner image if available */}
                {item.imageUrl && (
                    <div className="relative w-full h-64 sm:h-80 md:h-96 rounded-xl overflow-hidden border shadow-sm bg-muted">
                        <Image
                            src={item.imageUrl}
                            alt={item.imageAltText || item.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    </div>
                )}

                {/* Main Content Card */}
                <Card className="shadow-sm">
                    <CardContent className="p-6 sm:p-10 space-y-6">
                        {/* Dates metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pb-6 border-b">
                            <div className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4 text-primary" />
                                <span>Published: {new Date(item.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                            </div>
                            {item.dateExpire && (
                                <div className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-amber-600" />
                                    <span>Expiration: {new Date(item.dateExpire).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                                </div>
                            )}
                        </div>

                        {/* Short Summary Lead */}
                        {item.descriptionShort && (
                            <p className="text-lg text-foreground font-medium leading-relaxed bg-muted/30 p-4 rounded-lg border-l-4 border-primary">
                                {item.descriptionShort}
                            </p>
                        )}

                        {/* Markdown / Formatted Text Body */}
                        <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
                            {item.description}
                        </div>

                        {/* Contextual Action Buttons */}
                        {item.type === "call_for_papers" && (
                            <div className="mt-8 p-6 bg-primary/5 rounded-xl border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="space-y-1 text-center sm:text-left">
                                    <h4 className="font-semibold text-foreground">Ready to submit your manuscript?</h4>
                                    <p className="text-xs text-muted-foreground">
                                        Submissions undergo double-blind peer review with fast-track editorial feedback.
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <Button asChild size="sm">
                                        <Link href="/author/submissions/submit">
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Paper
                                        </Link>
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href="/guidelines">
                                            <FileText className="mr-2 h-4 w-4" />
                                            Guidelines
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

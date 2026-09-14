import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAnnouncementById, getAnnouncements } from "@/actions/announcements";
import { getSettingsData } from "@/actions/settings";
import PageHeader from "@/components/layout/PageHeader";
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
        alternates: {
            canonical: `/announcements/${res.data.id}`,
        },
        openGraph: {
            title: res.data.title,
            description: res.data.descriptionShort || res.data.description.slice(0, 160),
            images: res.data.imageUrl ? [res.data.imageUrl] : [],
            type: "article",
        },
    };
}

const TYPE_CONFIG: Record<string, { label: string; badgeClass: string }> = {
    call_for_papers: {
        label: "Call for Papers",
        badgeClass: "bg-secondary/10 text-secondary border-secondary/25",
    },
    news: {
        label: "Journal News",
        badgeClass: "bg-primary/10 text-primary border-primary/20",
    },
    editorial_update: {
        label: "Editorial Notice",
        badgeClass: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    },
    event: {
        label: "Scholarly Event",
        badgeClass: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    },
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
    const publishedDate = new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title={item.title}
                description={`Official announcement published on ${publishedDate}`}
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Announcements", href: "/announcements" },
                    { name: item.title, href: `/announcements/${item.id}` },
                ]}
            />

            <main className="container-narrow max-w-4xl 2xl:max-w-5xl section-vertical space-y-6 2xl:space-y-8">
                {/* Navigation Bar & Tags */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                    <Link
                        href="/announcements"
                        className="inline-flex items-center gap-2 text-body-sm font-semibold text-primary hover:text-secondary transition-colors group no-underline"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>All Announcements</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-label font-semibold uppercase tracking-wider border ${typeInfo.badgeClass} `}>
                            {typeInfo.label}
                        </span>
                        {item.priority > 0 && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-label font-bold uppercase tracking-wider bg-secondary/10 text-secondary border border-secondary/25">
                                Featured Notice
                            </span>
                        )}
                    </div>
                </div>

                {/* Banner image if available */}
                {item.imageUrl && (
                    <div className="relative w-full h-64 sm:h-80 md:h-96 2xl:h-[420px] rounded-xl overflow-hidden border border-border/70 shadow-2xs bg-muted/30">
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

                {/* Main Content Article */}
                <article className="bg-card rounded-xl border border-border/70 shadow-2xs p-5 sm:p-8 lg:p-10 2xl:p-12 space-y-6 2xl:space-y-8">
                    {/* Metadata Header Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-5 sm:pb-6 border-b border-border/60">
                        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                            <div className="flex items-center gap-2 text-meta">
                                <Calendar className="w-4 h-4 text-primary shrink-0" />
                                <span className="text-muted-foreground">
                                    Published: <strong className="text-foreground font-semibold">{publishedDate}</strong>
                                </span>
                            </div>
                            {item.dateExpire && (
                                <div className="flex items-center gap-2 text-meta">
                                    <Clock className="w-4 h-4 text-secondary shrink-0" />
                                    <span className="text-muted-foreground">
                                        Valid Until: <strong className="text-foreground font-semibold">{new Date(item.dateExpire).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</strong>
                                    </span>
                                </div>
                            )}
                        </div>

                        <span className="text-meta font-mono uppercase tracking-wider text-muted-foreground bg-muted/40 px-2.5 py-1 rounded border border-border/40">
                            Notice #{item.id}
                        </span>
                    </div>

                    {/* Short Summary Lead Box */}
                    {item.descriptionShort && (
                        <div className="bg-primary/5 p-4 sm:p-5 rounded-xl border-l-4 border-primary space-y-1">
                            <span className="text-label text-primary block text-body-sm">Overview</span>
                            <p className="text-lead m-0 text-foreground/90 font-medium">
                                {item.descriptionShort}
                            </p>
                        </div>
                    )}

                    {/* Body Content */}
                    <div className="whitespace-pre-wrap font-sans text-foreground/85 leading-relaxed text-body-sm space-y-4">
                        {item.description}
                    </div>

                    {/* Contextual Action Banner for Call for Papers */}
                    {item.type === "call_for_papers" && (
                        <div className="mt-8 p-5 sm:p-6 rounded-xl bg-gradient-to-br from-primary/5 via-secondary/5 to-transparent border border-primary/15 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
                            <div className="space-y-1 text-center sm:text-left">
                                <h4 className="font-sans font-bold text-primary m-0">
                                    Ready to submit your research?
                                </h4>
                                <p className="text-caption text-muted-foreground m-0">
                                    Submissions undergo double-blind peer review with fast-track editorial feedback.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center justify-center gap-2.5 shrink-0">
                                <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-lg shadow-xs h-9 px-4">
                                    <Link href="/submit" className="flex items-center gap-1.5 no-underline">
                                        <Send className="w-3.5 h-3.5" />
                                        <span>Submit Manuscript</span>
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5 font-semibold rounded-lg h-9 px-4">
                                    <Link href="/guidelines" className="flex items-center gap-1.5 no-underline">
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Guidelines</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </article>
            </main>
        </div>
    );
}

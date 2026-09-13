import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from "next";
import { getAnnouncements } from "@/actions/announcements";
import { getSettingsData } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    const journalName = settings["journalName"] || "IJITEST";
    return {
        title: `Announcements & Notices | ${journalName}`,
        description: `Official announcements, calls for papers, editorial decisions, and scholarly updates from ${journalName}.`,
        alternates: {
            canonical: "/announcements",
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

export default async function AnnouncementsPage() {
    const res = await getAnnouncements();
    const announcements = res.success ? (res.data || []) : [];

    return (
        <div className="bg-background min-h-screen">
            <PageHeader
                title="Announcements & Notices"
                description="Scholarly alerts, calls for papers, indexing milestones, and editorial board notices."
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Announcements", href: "/announcements" },
                ]}
            />

            <div className="container-responsive section-vertical">
                {announcements.length === 0 ? (
                    <div className="max-w-xl mx-auto text-center py-12 px-6 bg-card rounded-xl border border-border/70 shadow-2xs space-y-3">
                        <Bell className="h-12 w-12 mx-auto text-muted-foreground/40" />
                        <h3 className="text-primary text-lg font-bold m-0">No active announcements</h3>
                        <p className="text-sm text-muted-foreground m-0">
                            There are currently no active public announcements or alerts. Please check back soon.
                        </p>
                        <div className="pt-2">
                            <Button asChild variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5 font-semibold">
                                <Link href="/">Return to Homepage</Link>
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 2xl:gap-6">
                        {announcements.map((item) => {
                            const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG["news"]!;
                            return (
                                <article
                                    key={item.id}
                                    className="bg-card flex flex-col h-full overflow-hidden rounded-xl border border-border/70 hover:border-primary/20 shadow-2xs hover:shadow-xs transition-all duration-200 group"
                                >
                                    {item.imageUrl && (
                                        <div className="relative w-full h-48 2xl:h-52 bg-muted/40 overflow-hidden border-b border-border/50">
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.imageAltText || item.title}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                unoptimized
                                            />
                                        </div>
                                    )}

                                    <div className="flex-1 p-5 2xl:p-6 flex flex-col justify-between space-y-4">
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-semibold uppercase tracking-wider border ${typeInfo.badgeClass}`}>
                                                    {typeInfo.label}
                                                </span>
                                                {item.priority > 0 && (
                                                    <span className="text-3xs font-bold tracking-wider uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 m-0 leading-snug">
                                                <Link href={`/announcements/${item.id}`} className="no-underline">
                                                    {item.title}
                                                </Link>
                                            </h2>

                                            <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 leading-relaxed m-0">
                                                {item.descriptionShort || item.description.replace(/[#*`_]/g, "").slice(0, 160)}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-3.5 border-t border-border/50">
                                            <div className="flex items-center justify-between text-meta text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                                                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                {item.dateExpire && (
                                                    <span className="flex items-center gap-1 text-secondary">
                                                        <Clock className="h-3.5 w-3.5 shrink-0" />
                                                        Valid until {new Date(item.dateExpire).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            <Link
                                                href={`/announcements/${item.id}`}
                                                className="w-full flex items-center justify-between text-xs font-bold text-primary group-hover:text-secondary transition-colors no-underline pt-1"
                                            >
                                                <span>Read full notice</span>
                                                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

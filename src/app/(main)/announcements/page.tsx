import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from "next";
import { getAnnouncements } from "@/actions/announcements";
import { getSettingsData } from "@/actions/settings";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
    call_for_papers: { label: "Call for Papers", color: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300" },
    news: { label: "Journal News", color: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300" },
    editorial_update: { label: "Editorial Update", color: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300" },
    event: { label: "Scholarly Event", color: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300" },
};

export default async function AnnouncementsPage() {
    const res = await getAnnouncements();
    const announcements = res.success ? (res.data || []) : [];

    return (
        <div className="min-h-screen pb-16">
            <PageHeader
                title="Announcements & Notices"
                description="Scholarly alerts, calls for papers, indexing milestones, and editorial board notices."
                breadcrumbs={[
                    { name: "Home", href: "/" },
                    { name: "Announcements", href: "/announcements" },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {announcements.length === 0 ? (
                    <Card className="max-w-xl mx-auto text-center py-12">
                        <CardContent className="space-y-3">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/40" />
                            <h3 className="text-lg font-semibold">No active announcements</h3>
                            <p className="text-sm text-muted-foreground">
                                There are currently no active public announcements or alerts. Please check back soon.
                            </p>
                            <Button asChild variant="outline" size="sm" className="mt-2">
                                <Link href="/">Return to Homepage</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {announcements.map((item) => {
                            const typeInfo = TYPE_CONFIG[item.type] || TYPE_CONFIG["news"]!;
                            return (
                                <Card
                                    key={item.id}
                                    className="flex flex-col h-full overflow-hidden hover:shadow-md transition-all duration-200 border group"
                                >
                                    {item.imageUrl && (
                                        <div className="relative w-full h-48 bg-muted overflow-hidden">
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

                                    <CardContent className="flex-1 p-6 flex flex-col justify-between space-y-4">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <Badge variant="outline" className={typeInfo.color}>
                                                    {typeInfo.label}
                                                </Badge>
                                                {item.priority > 0 && (
                                                    <span className="text-[11px] font-semibold tracking-wider uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>

                                            <h2 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-2">
                                                <Link href={`/announcements/${item.id}`}>
                                                    {item.title}
                                                </Link>
                                            </h2>

                                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                {item.descriptionShort || item.description.replace(/[#*`_]/g, "").slice(0, 160)}
                                            </p>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-border/60">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    {new Date(item.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                                {item.dateExpire && (
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        Valid until {new Date(item.dateExpire).toLocaleDateString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                        })}
                                                    </span>
                                                )}
                                            </div>

                                            <Button asChild variant="ghost" className="w-full justify-between group/btn text-xs font-semibold px-0 hover:bg-transparent hover:text-primary">
                                                <Link href={`/announcements/${item.id}`}>
                                                    Read full announcement
                                                    <ArrowRight className="h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

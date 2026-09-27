import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import { getPublishedPapers } from '@/actions/archives';
import { getSettingsData } from '@/actions/settings';
import { JsonLd } from "@/components/shared/JsonLd";
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, ChevronRight, FileText } from "lucide-react";
import TrackManuscriptWidget from '@/features/tracking/components/TrackManuscriptWidget';
import { Section } from '@/components/layout/Section';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) {
            return [{ volume: 'volume1' }];
        }
        
        const vols = new Set(res.data.map(p => p.volumeNumber).filter(Boolean));
        const params = Array.from(vols).map(v => ({
            volume: `volume${v}`,
        }));

        return params.length > 0 ? params : [{ volume: 'volume1' }];
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [{ volume: 'volume1' }];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ volume: string }> }): Promise<Metadata> {
    const { volume } = await params;
    const volNumber = parseInt(volume.replace("volume", ""), 10);
    const settings = await getSettingsData();
    const baseUrl = settings['journalWebsite'] || 'https://ijitest.org';
    
    if (isNaN(volNumber)) {
        return { title: "Volume Not Found | IJITEST Archives" };
    }
    return {
        title: `Volume ${volNumber} | ${settings['journalName'] || 'IJITEST'} Archives`,
        description: `Browse issues and research articles published in Volume ${volNumber} of the ${settings['journalName'] || 'IJITEST'}.`,
        alternates: {
            canonical: `/archives/${volume}`,
        },
        openGraph: {
            title: `Volume ${volNumber} - ${settings['journalShortName'] || 'IJITEST'} Archives`,
            description: `Browse issues and research articles published in Volume ${volNumber}.`,
            url: `${baseUrl}/archives/${volume}`,
            type: 'website',
        }
    };
}

export default async function VolumePage({ params }: { params: Promise<{ volume: string }> }) {
    const { volume } = await params;
    const volNumber = parseInt(volume.replace("volume", ""), 10);

    if (isNaN(volNumber)) notFound();

    const [papersRes, settings] = await Promise.all([
        getPublishedPapers(),
        getSettingsData()
    ]);
    const papers = papersRes.success && papersRes.data ? papersRes.data : [];

    // Filter papers for this volume
    const volumePapers = papers.filter(p => p.volumeNumber === volNumber);

    if (volumePapers.length === 0) notFound();

    // Group papers by issue number
    const issueMap = new Map<number, {
        issueNumber: number;
        year: number;
        monthRange: string;
        papersCount: number;
    }>();

    volumePapers.forEach(paper => {
        const issueNum = paper.issueNumber || 0;
        const year = paper.publicationYear || 0;
        const monthRange = paper.monthRange || "";

        if (issueNum === 0) return;

        if (!issueMap.has(issueNum)) {
            issueMap.set(issueNum, {
                issueNumber: issueNum,
                year,
                monthRange,
                papersCount: 0,
            });
        }
        issueMap.get(issueNum)!.papersCount++;
    });

    const issues = Array.from(issueMap.values())
        .sort((a, b) => b.issueNumber - a.issueNumber);

    const volumeYear = volumePapers[0]?.publicationYear || "";

    return (
        <div className="bg-background min-h-screen pb-8">
            <PageHeader
                title={`Volume ${volNumber}`}
                description={`Issues published in Volume ${volNumber} (${volumeYear})`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: `Volume ${volNumber}`, href: `/archives/${volume}` },
                ]}
                scrollOnComplete={true}
            />

            <Section>
                <SidebarLayout
                    sidebarClassName="space-y-4 lg:sticky lg:top-24 h-fit"
                    sidebar={
                        <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                            <TrackManuscriptWidget />
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-secondary pl-3">
                            <h2 className="m-0">Published Issues</h2>
                        </div>

                        {issues.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {issues.map((iss) => (
                                    <Link 
                                        key={iss.issueNumber} 
                                        href={`/archives/${volume}/issue${iss.issueNumber}`}
                                        className="group block"
                                    >
                                        <Card className="h-full border-border/70 bg-card shadow-2xs hover:border-primary/30 transition-all duration-200 rounded-xl relative overflow-hidden">
                                            <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full relative z-10">
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="w-9 h-9 rounded-lg bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                                            <FileText className="size-4" />
                                                        </div>
                                                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/15 text-badge font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                                                            <Calendar className="size-3" />
                                                            {iss.monthRange}
                                                        </Badge>
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <h3 className="group-hover:text-secondary transition-colors m-0">
                                                            Issue {iss.issueNumber}
                                                        </h3>
                                                        <p className="text-muted-foreground m-0">
                                                            Published in {iss.monthRange} {iss.year}.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-body-sm">
                                                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                                                        <BookOpen className="size-3.5 text-primary/40" />
                                                        {iss.papersCount} {iss.papersCount === 1 ? 'Paper' : 'Papers'}
                                                    </span>
                                                    <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform text-body-sm">
                                                        View Papers <ChevronRight className="size-3.5" />
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <Card className="border-dashed border py-10 text-center rounded-2xl border-border bg-muted/20">
                                <div className="max-w-md mx-auto space-y-2">
                                    <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center mx-auto text-muted-foreground/40 shadow-xs">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-foreground m-0">No Issues Found</h3>
                                        <p className="text-muted-foreground px-4 m-0">
                                            There are no published issues available in Volume {volNumber} at this time.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </SidebarLayout>
            </Section>

            <JsonLd
                id="volume-schema"
                data={{
                    "@context": "https://schema.org",
                    "@type": "PublicationVolume",
                    "volumeNumber": volNumber.toString(),
                    "isPartOf": {
                        "@type": "Periodical",
                        "name": settings['journalName'] || "IJITEST",
                        "issn": settings['issnNumber'] || "",
                        "url": settings['journalWebsite'] || "https://ijitest.org"
                    },
                    "url": `${settings['journalWebsite'] || "https://ijitest.org"}/archives/${volume}`
                }}
            />
        </div>
    );
}

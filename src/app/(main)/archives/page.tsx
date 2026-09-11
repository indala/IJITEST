import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { getPublishedPapers } from '@/actions/archives';
import ArchivesSearch from '@/features/archives/components/ArchivesSearch';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import type { Issue } from '@/db/types';
import { Rss, Radio } from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getSettingsData();
    return {
        title: `Journal Archives | ${settings['journalName']}`,
        description: `Browse the digital repository of ${settings['journalShortName']}. Explore peer-reviewed research, technical reports, and innovative trends in engineering and science since ${settings['journalName']}'s inception.`,
        alternates: {
            canonical: '/archives',
        },
        openGraph: {
            title: `Research repository - ${settings['journalShortName']}`,
            description: `Global access to peer-reviewed technical manuscripts.`,
            url: '/archives',
            type: 'website',
        }
    };
}

export default async function Archives() {
    const papersRes = await getPublishedPapers();
    const papers = papersRes.success ? papersRes.data : [];

    // Group papers by volumeNumber
    const volumeMap = new Map<Issue['volumeNumber'], {
        volumeNumber: Issue['volumeNumber'];
        year: Issue['year'];
        issuesCount: Set<Issue['issueNumber']>;
        papersCount: number;
    }>();

    papers.forEach(paper => {
        const volNum = paper.volumeNumber || 0;
        const year = paper.publicationYear || 0;
        const issueNum = paper.issueNumber || 0;

        if (volNum === 0) return;

        if (!volumeMap.has(volNum)) {
            volumeMap.set(volNum, {
                volumeNumber: volNum,
                year,
                issuesCount: new Set<number>(),
                papersCount: 0,
            });
        }
        const volData = volumeMap.get(volNum)!;
        volData.issuesCount.add(issueNum);
        volData.papersCount++;
    });

    const volumes = Array.from(volumeMap.values())
        .sort((a, b) => b.volumeNumber - a.volumeNumber)
        .map(v => ({
            ...v,
            issuesCount: v.issuesCount.size
        }));

    return (
        <div className="bg-background min-h-screen pb-8">
            <PageHeader
                title="Journal Archives"
                description="Digital repository of peer-reviewed research and technical reports."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication', href: '#' },
                    { name: 'Archives', href: '/archives' },
                ]}
                scrollOnComplete={true}
            />

            <section className="px-4 sm:px-6 mx-auto py-6 sm:py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Main Content: Autocomplete search + Volumes Grid */}
                    <div className="lg:col-span-8">
                        <ArchivesSearch papers={papers} volumes={volumes} />
                    </div>

                    {/* Sidebar widgets */}
                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                            <TrackManuscriptWidget />
                        </div>

                        {/* Scholarly Web Feeds */}
                        <div className="bg-card p-5 rounded-2xl border border-border/70 shadow-2xs space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-600 shrink-0">
                                    <Rss className="w-4 h-4" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-foreground m-0">Scholarly Web Feeds</h4>
                                    <p className="text-[11px] text-muted-foreground m-0">Syndicate latest research</p>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed m-0">
                                Real-time RSS &amp; Atom feeds of all published open-access articles for reference managers and feed readers.
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1">
                                <a
                                    href="/api/feed/rss"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 dark:text-orange-400 font-bold text-xs border border-orange-500/20 transition-all cursor-pointer"
                                >
                                    <Rss className="w-3.5 h-3.5" /> RSS 2.0
                                </a>
                                <a
                                    href="/api/feed/atom"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-bold text-xs border border-blue-500/20 transition-all cursor-pointer"
                                >
                                    <Radio className="w-3.5 h-3.5" /> Atom 1.0
                                </a>
                            </div>
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}

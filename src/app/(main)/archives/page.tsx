import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import { getSettingsData } from '@/actions/settings';
import { getPublishedPapers } from '@/actions/archives';
import ArchivesSearch from '@/features/archives/components/ArchivesSearch';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

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
    const volumeMap = new Map<number, {
        volumeNumber: number;
        year: number;
        issuesCount: Set<number>;
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
        <main className="bg-background min-h-screen pb-8">
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
                    </aside>
                </div>
            </section>
        </main>
    );
}

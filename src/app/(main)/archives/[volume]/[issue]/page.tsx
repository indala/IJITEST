import PageHeader from "@/components/layout/PageHeader";
import type { Metadata } from 'next';
import { getPublishedPapers } from '@/actions/archives';
import { notFound } from 'next/navigation';
import PaperCard from '@/features/archives/components/PaperCard';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) return [];
        
        return res.data
            .filter(paper => paper.volumeNumber && paper.issueNumber)
            .map(paper => ({
                volume: `volume${paper.volumeNumber}`,
                issue: `issue${paper.issueNumber}`,
            }));
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [];
    }
}

export async function generateMetadata({ params }: { params: Promise<{ volume: string, issue: string }> }): Promise<Metadata> {
    const { volume, issue } = await params;
    const volNumber = parseInt(volume.replace("volume", ""), 10);
    const issueNumber = parseInt(issue.replace("issue", ""), 10);
    
    if (isNaN(volNumber) || isNaN(issueNumber)) {
        return { title: "Issue Not Found | IJITEST Archives" };
    }
    return {
        title: `Volume ${volNumber}, Issue ${issueNumber} | IJITEST Archives`,
        description: `Browse all peer-reviewed research papers published in Volume ${volNumber}, Issue ${issueNumber} of the International Journal of Innovative Trends in Engineering, Science and Technology.`
    };
}

export default async function IssuePage({ params }: { params: Promise<{ volume: string, issue: string }> }) {
    const { volume, issue } = await params;
    const volNumber = parseInt(volume.replace("volume", ""), 10);
    const issueNumber = parseInt(issue.replace("issue", ""), 10);

    if (isNaN(volNumber) || isNaN(issueNumber)) notFound();

    const papersRes = await getPublishedPapers();
    const papers = papersRes.success ? papersRes.data : [];

    // Filter papers for this volume and issue
    const issuePapers = papers.filter(p => p.volumeNumber === volNumber && p.issueNumber === issueNumber);

    const activeIssue = issuePapers[0];
    if (!activeIssue) notFound();
    const monthRange = activeIssue.monthRange || "";
    const year = activeIssue.publicationYear || "";

    return (
        <div className="bg-background min-h-screen pb-8">
            <PageHeader
                title={`Volume ${volNumber}, Issue ${issueNumber}`}
                description={`Research articles published in ${monthRange} ${year}`}
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                    { name: `Volume ${volNumber}`, href: `/archives/${volume}` },
                    { name: `Issue ${issueNumber}`, href: `/archives/${volume}/${issue}` },
                ]}
                scrollOnComplete={true}
            />

            <section className="px-4 sm:px-6 mx-auto py-6 sm:py-8 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                    {/* Main Content: Papers List */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-2 border-l-4 border-secondary pl-3">
                            <h2 className="m-0">Table of Contents</h2>
                        </div>

                        <div className="grid grid-cols-1 gap-3.5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {issuePapers.map((paper) => (
                                <PaperCard key={paper.paperId} paper={paper} basePath="/archives" />
                            ))}
                        </div>
                    </div>

                    {/* Sidebar widgets */}
                    <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                        <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                            <TrackManuscriptWidget />
                        </div>
                    </aside>
                </div>
            </section>
        </div>
    );
}

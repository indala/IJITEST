import { Calendar, FileText, ChevronRight, Download } from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';
import PaperCard from '@/features/archives/components/PaperCard';
import type { Metadata } from 'next';
import PageHeader from "@/components/layout/PageHeader";
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
    const [rows]: any = await pool.execute(
        "SELECT COUNT(*) as count FROM submissions WHERE status = 'published'"
    );
    const count = rows[0].count;

    return {
        title: `Digital Archives (${count} Papers) | IJITEST`,
        description: `Browse the complete collection of ${count} peer-reviewed research papers published in the International Journal of Innovative Trends in Engineering Science and Technology.`,
    };
}

export default async function Archives() {
    const [rows]: any = await pool.execute(
        "SELECT * FROM submissions WHERE status = 'published' ORDER BY submitted_at DESC"
    );

    const papers = rows;
    const hasPapers = papers.length > 0;

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Journal Archives"
                description="Explore our digital repository of peer-reviewed research, technical reports, and scientific breakthroughs."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Archives', href: '/archives' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {hasPapers ? (
                            <section className="space-y-12">
                                <div className="flex items-center justify-between bg-gray-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative">
                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-serif font-black italic">Inaugural Volume 2026</h2>
                                        <p className="text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Current Issue: Vol. 1 No. 1</p>
                                    </div>
                                    <FileText className="w-16 h-16 text-white/10 absolute right-8 top-1/2 -translate-y-1/2" />
                                </div>

                                <div className="space-y-8">
                                    {papers.map((paper: any) => (
                                        <PaperCard key={paper.paper_id} paper={paper} />
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <div className="bg-gray-50 p-20 rounded-[3.5rem] border border-gray-100 text-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-12 text-primary/5">
                                    <Calendar className="w-32 h-32" />
                                </div>
                                <div className="bg-white w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm border border-gray-100 relative z-10">
                                    <FileText className="w-8 h-8 text-gray-300" />
                                </div>
                                <h2 className="text-2xl font-serif font-black text-gray-400 mb-4 italic relative z-10">No Published Issues Yet</h2>
                                <p className="text-gray-400 max-w-sm mx-auto italic font-medium relative z-10 mb-10">
                                    IJITEST is currently in its inaugural submission phase. We are processing high-quality research from across the globe.
                                </p>
                                <Link href="/submit" className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all relative z-10">
                                    Submit Your Research <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Status Check */}
                        <TrackManuscriptWidget />

                        {/* Call for Papers */}
                        <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
                            <h3 className="text-xl font-serif font-black text-primary mb-2 italic">Call for Papers</h3>
                            <p className="text-xs text-gray-500 mb-8 font-medium leading-relaxed italic">Be part of our inaugural edition. We offer accelerated peer-review and global indexing.</p>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/5">
                                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Submission Deadline</span>
                                    <span className="text-[10px] font-black text-primary">Open 2026</span>
                                </div>
                                <Link href="/submit" className="block w-full py-4 bg-primary text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/10">
                                    Submit Manuscript
                                </Link>
                            </div>
                        </div>

                        {/* Resource Desk */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <Download className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Author Toolkit</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium italic">Download our professional IEEE standard templates and copyright forms.</p>
                            <Link href="/guidelines" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                                <span className="text-[10px] font-black uppercase tracking-widest">View Guidelines</span>
                                <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

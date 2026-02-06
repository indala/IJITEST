import { Calendar, FileText } from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';
import PaperCard from '@/components/archives/PaperCard';

export const dynamic = 'force-dynamic';

export default async function Archives() {
    // Fetch published papers from MySQL
    const [rows]: any = await pool.execute(
        "SELECT * FROM submissions WHERE status = 'published' ORDER BY submitted_at DESC"
    );

    const papers = rows;
    const hasPapers = papers.length > 0;

    return (
        <div className="py-20 bg-gray-50/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6">Journal Archives</h1>
                <p className="text-gray-500 mb-12 text-lg">Browse through all published research papers and issues.</p>

                <div className="space-y-16">
                    {hasPapers ? (
                        <section>
                            <div className="flex items-center gap-4 mb-8 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <div className="bg-primary/10 p-4 rounded-xl">
                                    <Calendar className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-gray-900">Inaugural Edition</h2>
                                    <p className="text-gray-500 font-medium">Digital Research Archive 2026</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {papers.map((paper: any) => (
                                    <PaperCard key={paper.paper_id} paper={paper} />
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h2 className="text-2xl font-serif font-black text-gray-400 uppercase tracking-widest mb-4">No Published Issues Yet</h2>
                            <p className="text-gray-400 max-w-sm mx-auto italic font-medium">
                                The journal is currently accepting submissions for its inaugural issue. Check back soon for the latest research.
                            </p>
                            <Link href="/submit" className="inline-block mt-10 text-primary font-black uppercase text-sm border-b-2 border-primary hover:text-secondary hover:border-secondary transition-all">
                                Submit Your Research
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

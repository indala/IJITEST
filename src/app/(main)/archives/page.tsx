import { Download, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';
import pool from '@/lib/db';

export default async function Archives() {
    // Fetch published papers from MySQL
    // Note: We'll need paper metadata (volume, issue, etc) in the DB eventually.
    // For now, we fetch from submissions where status = 'published'
    const [rows]: any = await pool.execute(
        "SELECT * FROM submissions WHERE status = 'published' ORDER BY submitted_at DESC"
    );

    const papers = rows;

    // Grouping logic (simplified for now as we don't have volume/issue columns yet)
    // In a real scenario, you'd group by volume and issue.
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
                                    <h2 className="text-2xl font-bold font-serif text-gray-900">Volume 1, Issue 1</h2>
                                    <p className="text-gray-500 font-medium">Inaugural Issue 2026</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {papers.map((paper: any) => (
                                    <div key={paper.paper_id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <span className="inline-block bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mb-3">Research Article</span>
                                                <h3 className="text-xl font-bold font-serif leading-snug mb-3 hover:text-primary cursor-pointer transition-colors">
                                                    {paper.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span>{paper.author_name}</span>
                                                    </div>
                                                    <div className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                        Paper ID: {paper.paper_id}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-3">
                                                {paper.file_path && (
                                                    <a href={paper.file_path} download className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                                                        <Download className="w-4 h-4" /> Full PDF
                                                    </a>
                                                )}
                                                <button className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-bold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                    View Abstract
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ) : (
                        <div className="bg-white p-20 rounded-[2.5rem] border border-gray-100 shadow-sm text-center">
                            <FileText className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                            <h2 className="text-2xl font-serif font-black text-gray-400 uppercase tracking-widest mb-4">No Published Issues Yet</h2>
                            <p className="text-gray-400 max-w-sm mx-auto italic font-medium">
                                The journal is currently accepting submissions for seiner inaugural issue. Check back soon for the latest research.
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

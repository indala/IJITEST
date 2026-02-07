import { Download, User } from 'lucide-react';
import { memo } from 'react';

interface PaperCardProps {
    paper: {
        paper_id: string;
        title: string;
        author_name: string;
        file_path?: string;
    };
}

function PaperCard({ paper }: PaperCardProps) {
    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
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
    );
}

export default memo(PaperCard);

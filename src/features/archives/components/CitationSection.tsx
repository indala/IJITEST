'use client';

import { Quote, Share2 } from "lucide-react";

interface CitationSectionProps {
    paper: {
        title: string;
        author_name: string;
        publication_year: number;
        volume_number?: number;
        issue_number?: number;
        paper_id: string;
    };
}

export default function CitationSection({ paper }: CitationSectionProps) {
    const citationText = `${paper.author_name} (${paper.publication_year}). "${paper.title}". International Journal of Innovative Trends in Engineering Science and Technology (IJITEST), Vol. ${paper.volume_number}, Issue ${paper.issue_number}. Paper ID: ${paper.paper_id}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(citationText);
        alert("Citation copied to clipboard!");
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 sticky top-24">
            <div className="flex items-center gap-3 text-primary">
                <Quote className="w-6 h-6 rotate-180" />
                <h3 className="font-serif font-black text-xl italic">Cite this Article</h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative group">
                <p className="text-xs text-gray-600 leading-relaxed font-medium italic">
                    {paper.author_name} ({paper.publication_year}). "{paper.title}".
                    <br />
                    <span className="font-bold text-primary">International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</span>,
                    Vol. {paper.volume_number}, Issue {paper.issue_number}.
                    <br />
                    Paper ID: {paper.paper_id}
                </p>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-100 hover:text-primary hover:border-primary/20 transition-all font-sans"
                >
                    Copy Citation
                </button>
            </div>

            <div className="flex flex-col gap-3">
                <button
                    onClick={() => {
                        if (navigator.share) {
                            navigator.share({
                                title: paper.title,
                                text: `Check out this research paper: ${paper.title}`,
                                url: window.location.href
                            });
                        } else {
                            navigator.clipboard.writeText(window.location.href);
                            alert("Link copied to clipboard!");
                        }
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border border-gray-100 hover:bg-gray-100 transition-all font-sans"
                >
                    <Share2 className="w-4 h-4" /> Share Research
                </button>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest text-center">Journal Metadata</h4>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">ISSN (Online)</p>
                        <p className="text-[10px] font-black text-gray-900 italic">2584-2579</p>
                    </div>
                    <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 text-center">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">SJIF Impact</p>
                        <p className="text-[10px] font-black text-gray-900 italic">8.16 (2024)</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

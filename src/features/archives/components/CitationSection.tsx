'use client';

import { Quote, Share2 } from "lucide-react";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { toast } from "sonner";
import type { Author } from "@/db/types";

interface CitationSectionProps {
    paper: {
        title: string;
        authorName: string;
        publicationYear: number;
        volumeNumber?: number | null;
        issueNumber?: number | null;
        paperId: string;
        coAuthors?: Author[] | null;
    };
}

export default function CitationSection({ paper }: CitationSectionProps) {
    const settings = useSettingsContext();

    // 1. Parse Authors for the citation
    const getFormattedAuthors = () => {
        const coAuthors = paper.coAuthors;
        
        if (Array.isArray(coAuthors) && coAuthors.length > 0) {
            const names = coAuthors.map((a: Author) => a.name);
            if (names.length === 1) {
                return names[0];
            } else if (names.length === 2) {
                return `${names[0]} & ${names[1]}`;
            } else {
                const allButLast = names.slice(0, -1);
                const last = names[names.length - 1];
                return `${allButLast.join(', ')} & ${last}`;
            }
        }
        return paper.authorName;
    };

    const authors = getFormattedAuthors();
    const citationText = `${authors} "${paper.title}". ${settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology'} (${settings['journalShortName'] || 'IJITEST'}), Vol. ${paper.volumeNumber || 'X'}, Issue ${paper.issueNumber || 'X'}, ${paper.publicationYear || new Date().getFullYear()}.`;

    const handleCopy = () => {
        navigator.clipboard.writeText(citationText)
            .then(() => {
                toast.success("Citation copied to clipboard!");
            })
            .catch((err) => {
                console.error("Failed to copy citation:", err);
                toast.error("Failed to copy citation");
            });
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl shadow-blue-900/5 space-y-6 sticky top-24">
            <div className="flex items-center gap-3 text-primary">
                <Quote className="w-6 h-6 rotate-180" />
                <h3 className="font-serif font-black ">Cite this Article</h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 space-y-4 relative group">
                <p className="text-sm 2xl:text-base text-gray-600 leading-relaxed font-medium ">
                    {authors} <span className="italic">&quot;{paper.title}&quot;</span>.
                    <br />
                    <span className="">{settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology'} ({settings['journalShortName'] || 'IJITEST'})</span>,
                    Vol. {paper.volumeNumber || 'X'}, Issue {paper.issueNumber || 'X'}, {paper.publicationYear || new Date().getFullYear()}.
                    <br />
                </p>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-2 bg-white text-gray-400 py-3 rounded-xl text-xs 2xl:text-sm font-black  tracking-widest border border-gray-100 hover:text-primary hover:border-primary/20 transition-all font-sans"
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
                            }).catch((err) => console.error("Share failed:", err));
                        } else {
                            navigator.clipboard.writeText(window.location.href)
                                .then(() => {
                                    toast.success("Link copied to clipboard!");
                                })
                                .catch((err) => {
                                    console.error("Failed to copy link:", err);
                                    toast.error("Failed to copy link");
                                });
                        }
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gray-50 text-gray-500 py-4 rounded-2xl font-black text-xs 2xl:text-sm tracking-[0.2em] border border-gray-100 hover:bg-gray-100 transition-all font-sans"
                >
                    <Share2 className="w-4 h-4" /> Share Research
                </button>
            </div>

            <div className="pt-6 border-t border-gray-100 space-y-4">
                <h4 className="text-xs 2xl:text-sm font-black text-gray-400 tracking-widest text-center uppercase">Journal Metadata</h4>
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center group/meta">
                        <p className="text-[10px] 2xl:text-xs font-black text-gray-400 tracking-[0.2em] uppercase mb-1 group-hover/meta:text-primary transition-colors">ISSN (Online)</p>
                        <p className="text-sm 2xl:text-base font-black text-gray-900 ">{settings['issnNumber'] || 'XXXX-XXXX'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

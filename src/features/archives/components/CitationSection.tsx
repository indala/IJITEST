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
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-border/70 shadow-2xs space-y-4 sticky top-24">
            <div className="flex items-center gap-2 text-primary">
                <Quote className="w-4 h-4 rotate-180" />
                <h3 className="m-0">Cite this Article</h3>
            </div>

            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60 space-y-2.5 relative group">
                <p className="text-muted-foreground m-0">
                    {authors} <span className="italic font-medium text-foreground">&quot;{paper.title}&quot;</span>.
                    <br />
                    <span>{settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology'} ({settings['journalShortName'] || 'IJITEST'})</span>,
                    Vol. {paper.volumeNumber || 'X'}, Issue {paper.issueNumber || 'X'}, {paper.publicationYear || new Date().getFullYear()}.
                </p>
                <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center gap-1.5 bg-white text-primary py-2 rounded-lg text-xs font-bold border border-border/70 hover:bg-primary/5 transition-all cursor-pointer shadow-2xs"
                >
                    Copy Citation
                </button>
            </div>

            <div>
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
                    className="w-full flex items-center justify-center gap-2 bg-muted/40 text-foreground py-2 rounded-lg text-xs font-bold border border-border/60 hover:bg-muted/70 transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5" /> Share Research
                </button>
            </div>

            <div className="pt-3 border-t border-border/50 space-y-2">
                <h4 className="text-label text-center text-muted-foreground m-0">Journal Metadata</h4>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/60 text-center">
                    <p className="text-label text-muted-foreground mb-0.5 m-0">ISSN (Online)</p>
                    <p className="text-meta font-bold text-foreground m-0">{settings['issnNumber'] || '3139-6887'}</p>
                </div>
            </div>
        </div>
    );
}

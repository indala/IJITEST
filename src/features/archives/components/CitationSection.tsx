'use client';

import { useState } from 'react';
import { Quote, Share2, Copy, Check, Download } from "lucide-react";
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
        doi?: string | null;
        coAuthors?: Author[] | null;
    };
}

type CitationStyle = 'apa' | 'ieee' | 'bibtex' | 'harvard';

export default function CitationSection({ paper }: CitationSectionProps) {
    const settings = useSettingsContext();
    const [style, setStyle] = useState<CitationStyle>('apa');
    const [copied, setCopied] = useState(false);

    const journalName = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalShortName = settings['journalShortName'] || 'IJITEST';
    const year = paper.publicationYear || new Date().getFullYear();
    const vol = paper.volumeNumber || 1;
    const iss = paper.issueNumber || 1;
    const doi = paper.doi ? `https://doi.org/${paper.doi}` : `https://ijitest.org/archives/${paper.paperId}`;

    // Authors list parsing
    const getAuthorsList = () => {
        if (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0) {
            return paper.coAuthors.map((a: Author) => a.name);
        }
        return [paper.authorName];
    };

    const authorsList = getAuthorsList();

    // Formatted Citation Generators
    const generateCitation = (format: CitationStyle): string => {
        switch (format) {
            case 'apa': {
                const authorsStr = authorsList.length === 1
                    ? authorsList[0]
                    : authorsList.length === 2
                        ? `${authorsList[0]}, & ${authorsList[1]}`
                        : `${authorsList.slice(0, -1).join(', ')}, & ${authorsList[authorsList.length - 1]}`;
                return `${authorsStr} (${year}). ${paper.title}. ${journalName}, ${vol}(${iss}). ${doi}`;
            }
            case 'ieee': {
                const authorsStr = authorsList.join(', ');
                return `${authorsStr}, "${paper.title}," ${journalShortName}, vol. ${vol}, no. ${iss}, ${year}. [Online]. Available: ${doi}`;
            }
            case 'harvard': {
                const authorsStr = authorsList.join(', ');
                return `${authorsStr}, ${year}. ${paper.title}. ${journalName}, ${vol}(${iss}). Available at: <${doi}>.`;
            }
            case 'bibtex': {
                const citeKey = `${(authorsList[0] || 'author').toLowerCase().replace(/[^a-z]/g, '')}${year}${paper.paperId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                const bibAuthors = authorsList.join(' and ');
                return `@article{${citeKey},
  title={${paper.title}},
  author={${bibAuthors}},
  journal={${journalName}},
  volume={${vol}},
  number={${iss}},
  year={${year}},
  url={${doi}}
}`;
            }
        }
    };

    const currentCitation = generateCitation(style);

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCitation)
            .then(() => {
                setCopied(true);
                toast.success(`${style.toUpperCase()} citation copied to clipboard!`);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy citation:", err);
                toast.error("Failed to copy citation");
            });
    };

    const handleDownloadRis = () => {
        const risContent = `TY  - JOUR
TI  - ${paper.title}
${authorsList.map((a) => `AU  - ${a}`).join('\n')}
T2  - ${journalName}
JA  - ${journalShortName}
VL  - ${vol}
IS  - ${iss}
PY  - ${year}
UR  - ${doi}
ER  - `;

        const blob = new Blob([risContent], { type: 'application/x-research-info-systems' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paper.paperId}-citation.ris`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded .RIS citation for Zotero/Mendeley/EndNote");
    };

    return (
        <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/70 shadow-2xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                    <Quote className="w-4 h-4 rotate-180 text-secondary" />
                    <h3 className="m-0">Cite this Article</h3>
                </div>
                <span className="text-label text-muted-foreground">
                    {style.toUpperCase()}
                </span>
            </div>

            {/* Style Selector Tabs */}
            <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
                {(['apa', 'ieee', 'bibtex', 'harvard'] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`py-1 rounded text-center text-label transition-all cursor-pointer ${
                            style === s
                                ? 'bg-white text-primary shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* Citation Box */}
            <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60 space-y-2.5 relative group">
                <pre className="text-muted-foreground text-body-sm leading-relaxed m-0 whitespace-pre-wrap select-all font-normal">
                    {currentCitation}
                </pre>

                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={handleCopy}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-white text-primary py-2 rounded-lg text-label border border-border/70 hover:bg-primary/5 transition-all cursor-pointer shadow-2xs"
                    >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copied ? 'Copied!' : 'Copy Citation'}</span>
                    </button>

                    <button
                        onClick={handleDownloadRis}
                        title="Download .RIS citation for reference managers (Zotero, EndNote, Mendeley)"
                        className="flex items-center justify-center gap-1 bg-white hover:bg-primary/5 text-muted-foreground hover:text-primary py-2 px-3 rounded-lg text-label border border-border/70 transition-all cursor-pointer shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>.RIS</span>
                    </button>
                </div>
            </div>

            {/* Share action */}
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
                                    toast.success("Paper link copied to clipboard!");
                                })
                                .catch((err) => {
                                    console.error("Failed to copy link:", err);
                                    toast.error("Failed to copy link");
                                });
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-muted/40 text-foreground py-2 rounded-lg text-label border border-border/60 hover:bg-muted/70 transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5" /> Share Research
                </button>
            </div>

            {/* Metadata Footer */}
            <div className="pt-3 border-t border-border/50 space-y-2">
                <h4 className="text-label text-center text-muted-foreground m-0">Journal Indexing ID</h4>
                <div className="bg-muted/20 p-2.5 rounded-lg border border-border/60 text-center">
                    <p className="text-label text-muted-foreground mb-0.5 m-0">ISSN (Online)</p>
                    <p className="text-meta font-bold text-foreground m-0">{settings['issnNumber'] || '3139-6887'}</p>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { Quote, Share2, Copy, Check, Download } from "lucide-react";
import { useSettingsContext } from "@/components/providers/SettingsContext";
import { toast } from "sonner";
import type { Author } from "@/db/models";

interface CitationSectionProps {
    paper: {
        title: string;
        authorName: string;
        publicationYear: number;
        volumeNumber?: number | null | undefined;
        issueNumber?: number | null | undefined;
        paperId: string;
        doi?: string | null | undefined;
        coAuthors?: Author[] | null | undefined;
        startPage?: number | null | undefined;
        endPage?: number | null | undefined;
        pageRange?: string | null | undefined;
    };
}

type CitationStyle = 'apa' | 'ieee' | 'harvard' | 'mla' | 'chicago' | 'bibtex';

export default function CitationSection({ paper }: CitationSectionProps) {
    const settings = useSettingsContext();
    const [style, setStyle] = useState<CitationStyle>('apa');
    const [copied, setCopied] = useState(false);

    const journalName = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalShortName = settings['journalShortName'] || 'IJITEST';
    const issn = settings['issnNumber'] || '3139-6887';
    const baseUrl = settings['journalWebsite'] || (typeof window !== 'undefined' ? window.location.origin : 'https://ijitest.org');
    const year = paper.publicationYear || new Date().getFullYear();
    const vol = paper.volumeNumber || 1;
    const iss = paper.issueNumber || 1;
    const shortArticleUrl = `${baseUrl}/article/${paper.paperId.toLowerCase()}`;
    const rawDoi = paper.doi?.trim();
    const hasDoi = Boolean(rawDoi);
    const doiClean = rawDoi ? rawDoi.replace(/^https?:\/\/doi\.org\//i, '').trim() : '';
    const doiUrl = hasDoi ? `https://doi.org/${doiClean}` : '';
    const citationTargetUrl = hasDoi ? doiUrl : shortArticleUrl;

    const pagesStr = paper.pageRange
        ? paper.pageRange
        : paper.startPage && paper.endPage
        ? `${paper.startPage}-${paper.endPage}`
        : '';

    // Authors list parsing
    const getAuthorsList = () => {
        if (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0) {
            return paper.coAuthors.map((a: Author) => a.name.trim()).filter(Boolean);
        }
        return [paper.authorName.trim()].filter(Boolean);
    };

    const authorsList = getAuthorsList();

    // Author name formatters for academic standards
    const formatNameApa = (name: string): string => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        if (trimmed.includes(',')) return trimmed;
        const parts = trimmed.split(/\s+/);
        if (parts.length === 1) return parts[0]!;
        const lastName = parts[parts.length - 1]!;
        const initials = parts
            .slice(0, -1)
            .map((p) => {
                const clean = p.replace(/[^a-zA-Z]/g, '');
                return clean ? `${clean[0]?.toUpperCase()}.` : '';
            })
            .filter(Boolean)
            .join(' ');
        return initials ? `${lastName}, ${initials}` : lastName;
    };

    const formatNameIeee = (name: string): string => {
        const trimmed = name.trim();
        if (!trimmed) return '';
        if (trimmed.includes(',')) {
            const [last, first] = trimmed.split(',').map((s) => s.trim());
            const initials = first
                ? first
                      .split(/\s+/)
                      .map((p) => {
                          const clean = p.replace(/[^a-zA-Z]/g, '');
                          return clean ? `${clean[0]?.toUpperCase()}.` : '';
                      })
                      .filter(Boolean)
                      .join(' ')
                : '';
            return initials ? `${initials} ${last}` : (last || trimmed);
        }
        const parts = trimmed.split(/\s+/);
        if (parts.length === 1) return parts[0]!;
        const lastName = parts[parts.length - 1]!;
        const initials = parts
            .slice(0, -1)
            .map((p) => {
                const clean = p.replace(/[^a-zA-Z]/g, '');
                return clean ? `${clean[0]?.toUpperCase()}.` : '';
            })
            .filter(Boolean)
            .join(' ');
        return initials ? `${initials} ${lastName}` : trimmed;
    };

    // Formatted Citation Generators
    const generateCitation = (format: CitationStyle): string => {
        switch (format) {
            case 'apa': {
                const apaAuthors = authorsList.map(formatNameApa);
                const authorsStr = apaAuthors.length === 1
                    ? apaAuthors[0]
                    : apaAuthors.length === 2
                        ? `${apaAuthors[0]}, & ${apaAuthors[1]}`
                        : `${apaAuthors.slice(0, -1).join(', ')}, & ${apaAuthors[apaAuthors.length - 1]}`;
                const pagesPart = pagesStr ? `, ${pagesStr}` : '';
                return `${authorsStr} (${year}). ${paper.title}. ${journalName}, ${vol}(${iss})${pagesPart}. ${citationTargetUrl}`;
            }
            case 'ieee': {
                const ieeeAuthors = authorsList.map(formatNameIeee);
                const authorsStr = ieeeAuthors.length === 1
                    ? ieeeAuthors[0]
                    : ieeeAuthors.length === 2
                        ? `${ieeeAuthors[0]} and ${ieeeAuthors[1]}`
                        : `${ieeeAuthors.slice(0, -1).join(', ')}, and ${ieeeAuthors[ieeeAuthors.length - 1]}`;
                const pagesPart = pagesStr ? `, pp. ${pagesStr}` : '';
                if (hasDoi) {
                    return `${authorsStr}, "${paper.title}," ${journalShortName}, vol. ${vol}, no. ${iss}${pagesPart}, ${year}, doi: ${doiClean}.`;
                }
                return `${authorsStr}, "${paper.title}," ${journalShortName}, vol. ${vol}, no. ${iss}${pagesPart}, ${year}. [Online]. Available: ${shortArticleUrl}`;
            }
            case 'harvard': {
                const harvardAuthors = authorsList.map(formatNameApa);
                const authorsStr = harvardAuthors.length === 1
                    ? harvardAuthors[0]
                    : harvardAuthors.length === 2
                        ? `${harvardAuthors[0]} and ${harvardAuthors[1]}`
                        : `${harvardAuthors.slice(0, -1).join(', ')} and ${harvardAuthors[harvardAuthors.length - 1]}`;
                const pagesPart = pagesStr ? `, pp. ${pagesStr}` : '';
                return `${authorsStr}, ${year}. ${paper.title}. ${journalName}, ${vol}(${iss})${pagesPart}. Available at: <${citationTargetUrl}>.`;
            }
            case 'mla': {
                const mlaFirstAuthor = formatNameApa(authorsList[0] || 'Author');
                const authorsStr = authorsList.length === 1
                    ? mlaFirstAuthor
                    : authorsList.length === 2
                        ? `${mlaFirstAuthor}, and ${authorsList[1]}`
                        : `${mlaFirstAuthor}, et al.`;
                const pagesPart = pagesStr ? `, pp. ${pagesStr}` : '';
                return `${authorsStr}. "${paper.title}." ${journalName}, vol. ${vol}, no. ${iss}, ${year}${pagesPart}, ${citationTargetUrl}.`;
            }
            case 'chicago': {
                const chicagoAuthors = authorsList.map((a, i) => (i === 0 ? formatNameApa(a) : a));
                const authorsStr = chicagoAuthors.length === 1
                    ? chicagoAuthors[0]
                    : chicagoAuthors.length === 2
                        ? `${chicagoAuthors[0]}, and ${chicagoAuthors[1]}`
                        : `${chicagoAuthors.slice(0, -1).join(', ')}, and ${chicagoAuthors[chicagoAuthors.length - 1]}`;
                const pagesPart = pagesStr ? `: ${pagesStr}` : '';
                return `${authorsStr}. ${year}. "${paper.title}." ${journalName} ${vol} (${iss})${pagesPart}. ${citationTargetUrl}.`;
            }
            case 'bibtex': {
                const citeKey = `${(authorsList[0] || 'author').toLowerCase().replace(/[^a-z]/g, '')}${year}${paper.paperId.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                const bibAuthors = authorsList.join(' and ');
                const pagesField = pagesStr ? `\n  pages={${pagesStr.replace('-', '--')}},` : '';
                const doiField = hasDoi ? `\n  doi={${doiClean}},` : '';
                return `@article{${citeKey},
  title={{${paper.title}}},
  author={${bibAuthors}},
  journal={${journalName}},
  issn={${issn}},
  volume={${vol}},
  number={${iss}},${pagesField}${doiField}
  year={${year}},
  url={${citationTargetUrl}}
}`;
            }
        }
    };

    const currentCitation = generateCitation(style);

    const handleCopy = () => {
        navigator.clipboard.writeText(currentCitation);
        setCopied(true);
        toast.success(`Copied ${style.toUpperCase()} citation to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadBib = () => {
        const bibContent = generateCitation('bibtex');
        const blob = new Blob([bibContent], { type: 'application/x-bibtex;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${paper.paperId}-citation.bib`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Downloaded .BIB citation for LaTeX / Overleaf");
    };

    const handleDownloadRis = () => {
        const effectiveStartPage = paper.startPage ?? (pagesStr && pagesStr.includes('-') ? pagesStr.split('-')[0]?.trim() : null);
        const effectiveEndPage = paper.endPage ?? (pagesStr && pagesStr.includes('-') ? pagesStr.split('-')[1]?.trim() : null);

        const risContent = `TY  - JOUR
TI  - ${paper.title}
${authorsList.map((a) => `AU  - ${a}`).join('\n')}
T2  - ${journalName}
JA  - ${journalShortName}
SN  - ${issn}
VL  - ${vol}
IS  - ${iss}${effectiveStartPage ? `\nSP  - ${effectiveStartPage}` : ''}${effectiveEndPage ? `\nEP  - ${effectiveEndPage}` : ''}
PY  - ${year}${hasDoi ? `\nDO  - ${doiClean}` : ''}
UR  - ${citationTargetUrl}
ER  - \n`;

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
        <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/70 shadow-2xs space-y-4">
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
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 p-1 bg-muted/50 rounded-lg border border-border/40">
                {(['apa', 'ieee', 'harvard', 'mla', 'chicago', 'bibtex'] as const).map((s) => (
                    <button
                        key={s}
                        type="button"
                        onClick={() => setStyle(s)}
                        className={`py-1 rounded text-center uppercase transition-all cursor-pointer ${
                            style === s
                                ? 'bg-white text-primary shadow-xs font-bold'
                                : 'text-muted-foreground hover:text-foreground'
                        } `}
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
                        <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>

                    <button
                        onClick={handleDownloadBib}
                        title="Download .BIB citation for LaTeX / Overleaf"
                        className="flex items-center justify-center gap-1 bg-white hover:bg-primary/5 text-muted-foreground hover:text-primary py-2 px-2.5 rounded-lg text-label border border-border/70 transition-all cursor-pointer shadow-2xs"
                    >
                        <Download className="w-3.5 h-3.5" />
                        <span>.BIB</span>
                    </button>

                    <button
                        onClick={handleDownloadRis}
                        title="Download .RIS citation for reference managers (Zotero, EndNote, Mendeley)"
                        className="flex items-center justify-center gap-1 bg-white hover:bg-primary/5 text-muted-foreground hover:text-primary py-2 px-2.5 rounded-lg text-label border border-border/70 transition-all cursor-pointer shadow-2xs"
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
                        const shareLink = shortArticleUrl;
                        if (navigator.share) {
                            navigator.share({
                                title: paper.title,
                                text: `Check out this research paper: ${paper.title}`,
                                url: shareLink
                            }).catch((err) => console.error("Share failed:", err));
                        } else {
                            navigator.clipboard.writeText(shareLink)
                                .then(() => {
                                    toast.success("Permanent article link copied to clipboard!");
                                })
                                .catch((err) => {
                                    console.error("Failed to copy link:", err);
                                    toast.error("Failed to copy link");
                                });
                        }
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-muted/40 text-foreground py-2 rounded-lg text-label border border-border/60 hover:bg-muted/70 transition-all cursor-pointer"
                >
                    <Share2 className="w-3.5 h-3.5" /> Share Research (Permanent Link)
                </button>
            </div>

            {/* Metadata Footer: Permanent Link, DOI, and ISSN */}
            <div className="pt-3 border-t border-border/50 space-y-2">
                <div className="bg-muted/20 p-3 rounded-xl border border-border/60 space-y-2 text-left">
                    {hasDoi && (
                        <div>
                            <p className="text-label text-muted-foreground mb-0.5 m-0 font-medium">Digital Object Identifier (DOI)</p>
                            <a
                                href={doiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-body-sm font-mono font-semibold text-emerald-600 hover:underline break-all block"
                            >
                                {doiUrl}
                            </a>
                        </div>
                    )}
                    <div>
                        <div className="flex items-center justify-between mb-0.5">
                            <p className="text-label text-muted-foreground m-0 font-medium">Permanent Article URL</p>
                            <button
                                type="button"
                                onClick={() => {
                                    navigator.clipboard.writeText(shortArticleUrl);
                                    toast.success("Permanent URL copied!");
                                }}
                                className="text-caption text-primary hover:underline font-semibold cursor-pointer"
                            >
                                Copy Link
                            </button>
                        </div>
                        <a
                            href={shortArticleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-body-sm font-mono text-foreground hover:text-primary hover:underline break-all block"
                        >
                            {shortArticleUrl}
                        </a>
                    </div>
                    <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                        <span className="text-label text-muted-foreground font-medium">ISSN (Online)</span>
                        <span className="text-meta font-bold text-foreground">{settings['issnNumber'] || '3139-6887'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

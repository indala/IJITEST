import {
    Download,
    BookOpen,
    Hash,
    ArrowLeft,
    FileText,
    Eye,
    Quote,
    Award,
    ShieldCheck,
    Paperclip,
    FileSpreadsheet,
    Code2
} from "lucide-react";
import Link from "next/link";
import type { PublishedPaperUI, RelatedArticle } from "@/db/types";
import CitationSection from "./CitationSection";
import { PaperViewTracker, DownloadPaperButton } from "./PaperActions";
import { CrossrefLogo } from "@/features/indexing/components/IndexingLogos";
import { CrossmarkDialog } from "./CrossmarkDialog";
import { RelatedArticlesPanel } from "./RelatedArticlesPanel";

interface PaperDetailClientProps {
    paper: PublishedPaperUI;
    mode?: 'current' | 'archive';
    relatedArticles?: RelatedArticle[];
}

const OrcidIcon = ({ orcid }: { orcid: string }) => (
    <a
        href={`https://orcid.org/${orcid}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center text-[#A6CE39] hover:opacity-80 transition-opacity ml-1 align-middle"
        title={`ORCID: https://orcid.org/${orcid}`}
    >
        <svg className="w-3.5 h-3.5 inline" viewBox="0 0 256 256" fill="currentColor">
            <path d="M128,0A128,128,0,1,0,256,128,128,128,0,0,0,128,0ZM86.35,186.29H64.76V77.47h21.6ZM75.56,65.6a13,13,0,1,1,13-13A13,13,0,0,1,75.56,65.6Zm123.63,65.86c0,35.43-20.21,48.24-44.57,48.24H110.1V77.47h44.57C179,77.47,199.19,90.28,199.19,131.46Zm-22.18,0c0-26.65-12.78-33.72-27.18-33.72H130.63v67.44h19.2C164.23,165.18,177.01,158.11,177.01,131.46Z" />
        </svg>
    </a>
);

export default function PaperDetailClient({ paper, mode = 'archive', relatedArticles }: PaperDetailClientProps) {
    const isRetracted = paper.status === 'retracted';
    const isCorrigendum = paper.status === 'corrigendum';

    return (
        <div className="container-responsive -mt-10">
            <PaperViewTracker paperId={paper.id} />
            {isRetracted && (
                <div className="mb-12 bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-red-900/5 animate-pulse">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 rotate-3">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-red-900 mb-1 uppercase tracking-tighter m-0">Manuscript Retracted</h3>
                        <p className="text-red-700 font-bold leading-relaxed max-w-2xl m-0">
                            {paper.retractionReason || 'This article has been formally retracted due to editorial policy violations or significant technical inaccuracies. Please refer to the official retraction notice for detailed reasoning.'}
                        </p>
                    </div>
                    {paper.retractionNoticeUrl && (
                        <a 
                            href={paper.retractionNoticeUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
                        >
                            VIEW NOTICE
                        </a>
                    )}
                </div>
            )}

            {isCorrigendum && (
                <div className="mb-12 bg-amber-50 border-2 border-amber-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-amber-900/5">
                    <div className="w-16 h-16 bg-amber-600 rounded-2xl flex items-center justify-center shrink-0 rotate-3">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-amber-900 mb-1 uppercase tracking-tighter m-0">Formal Corrigendum / Erratum Issued</h3>
                        <p className="text-amber-800 font-bold leading-relaxed max-w-2xl m-0">
                            {paper.retractionReason || 'A formal corrigendum or erratum notice has been issued for this publication to amend typographical or editorial records.'}
                        </p>
                    </div>
                    {paper.retractionNoticeUrl && (
                        <a 
                            href={paper.retractionNoticeUrl} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-amber-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-amber-800 transition-colors shadow-lg shadow-amber-900/20"
                        >
                            VIEW CORRIGENDUM
                        </a>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Main Article Content */}
                <div className="lg:col-span-2 space-y-5 sm:space-y-6">
                    {/* Title & Core Meta */}
                    <div className="bg-card p-5 sm:p-7 rounded-2xl border border-border/70 shadow-2xs relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-primary/5 text-primary text-label px-2.5 py-1 rounded-lg border border-primary/10">Research Article</span>
                                {paper.volumeNumber && (
                                    <span className="flex items-center gap-1.5 bg-primary/5 text-primary text-label px-2.5 py-1 rounded-lg border border-secondary/10">
                                        <BookOpen className="w-3.5 h-3.5" /> Volume {paper.volumeNumber}, Issue {paper.issueNumber}
                                    </span>
                                )}
                                <span className="bg-muted/50 text-muted-foreground text-meta px-2.5 py-1 rounded-lg border border-border/50">
                                    Published: {new Date((paper.publishedAt || paper.updatedAt || new Date()) as string | number | Date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            {/* Metrics Section */}
                            <div className="flex flex-wrap items-center gap-4 py-2 px-3.5 bg-muted/40 rounded-xl border border-border/50 w-fit">
                                <div className="flex items-center gap-1.5">
                                    <Eye className="w-3.5 h-3.5 text-primary/60" />
                                    <div className="flex flex-col">
                                        <span className="text-label text-muted-foreground">Views</span>
                                        <span className="text-meta font-bold text-primary tabular-nums">{(paper.views || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-border/50" />
                                <div className="flex items-center gap-1.5">
                                    <Download className="w-3.5 h-3.5 text-emerald-600/60" />
                                    <div className="flex flex-col">
                                        <span className="text-label text-muted-foreground">Downloads</span>
                                        <span className="text-meta font-bold text-emerald-700 tabular-nums">{(paper.downloads || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-px h-6 bg-border/50" />
                                <div className="flex items-center gap-1.5">
                                    <Quote className="w-3.5 h-3.5 text-amber-600/60" />
                                    <div className="flex flex-col">
                                        <span className="text-label text-muted-foreground">Citations</span>
                                        <span className="text-meta font-bold text-amber-700 tabular-nums">{(paper.citations || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <h1 className="m-0">
                                {paper.title}
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-3 gap-y-3 pt-3 border-t border-border/40">
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                    <span className="text-label text-primary shrink-0">Authors:</span>
                                    <span className="font-medium text-foreground/90 inline-flex flex-wrap items-center gap-x-1">
                                        {paper.coAuthors && paper.coAuthors.length > 0 ? (
                                            paper.coAuthors.map((author, idx) => (
                                                <span key={idx} className="inline-flex items-center">
                                                    <span>{author.name}</span>
                                                    {author.orcidId && <OrcidIcon orcid={author.orcidId} />}
                                                    {idx < (paper.coAuthors?.length ?? 0) - 1 && <span className="mr-1">,</span>}
                                                </span>
                                            ))
                                        ) : (
                                            Array.isArray(paper.authorsList) ? paper.authorsList.join(', ') : ''
                                        )}
                                    </span>
                                </div>

                                <DownloadPaperButton
                                    filePath={paper.filePath}
                                    paperId={paper.id}
                                    className="hidden md:flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-label shadow-xs transition-all shrink-0"
                                />
                            </div>

                            {/* DOI & Digital Repository Badges */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {paper.doi ? (
                                    <a
                                        href={`https://doi.org/${paper.doi}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-primary/5 hover:bg-primary/10 border border-primary/15 text-meta font-bold text-primary transition-colors"
                                    >
                                        <span className="text-label px-1 py-0.5 rounded bg-primary text-white font-sans">DOI</span>
                                        <span>{paper.doi}</span>
                                    </a>
                                ) : (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/40 border border-border/60 text-meta font-medium text-muted-foreground">
                                        <span className="text-label px-1 py-0.5 rounded bg-muted text-muted-foreground font-sans">DOI</span>
                                        <span>Assignment in Progress</span>
                                    </span>
                                )}
                                <CrossmarkDialog paper={paper} />
                                <a
                                    href={`https://search.crossref.org/?q=${encodeURIComponent(paper.doi || paper.title)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-label font-bold text-amber-900 transition-colors shadow-2xs"
                                    title="Crossref Cited-by & Metadata Record"
                                >
                                    <CrossrefLogo className="h-3.5 w-auto" />
                                    <span>Cited-by Record</span>
                                </a>
                                <a
                                    href="https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-label text-blue-800 transition-colors"
                                >
                                    <span>Repository Record</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Abstract Section */}
                    <div className="bg-card p-5 sm:p-7 rounded-2xl border border-border/70 relative group space-y-4">
                        <div>
                            <h2 className="mb-2 flex items-center gap-2 m-0">
                                <FileText className="w-4 h-4 text-secondary" /> Abstract
                            </h2>
                            <p className="text-foreground/90 text-justify m-0">
                                {paper.abstract}
                            </p>
                        </div>

                        {paper.keywords && (
                            <div className="pt-3 border-t border-border/40">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider mb-2">
                                    <Hash className="w-3 h-3 text-secondary" /> Keywords
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                    {paper.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} className="bg-muted/50 px-2.5 py-1 rounded-md text-xs font-medium text-foreground/80 border border-border/50">
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* CRediT (Contributor Roles Taxonomy) Statement */}
                        {paper.coAuthors && paper.coAuthors.some(a => Array.isArray(a.creditRoles) && a.creditRoles.length > 0) && (
                            <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                                    <Award className="w-3.5 h-3.5 text-secondary" /> Author Contributions (CRediT Statement)
                                </div>
                                <div className="space-y-1.5 text-xs text-foreground/85">
                                    {paper.coAuthors
                                        .filter(a => Array.isArray(a.creditRoles) && a.creditRoles.length > 0)
                                        .map((a, i) => (
                                            <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                                                <span className="font-bold text-foreground shrink-0">{a.name}:</span>
                                                <span className="text-muted-foreground">{a.creditRoles?.join(', ')}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Ethics & Disclosures */}
                        {(paper.competingInterests || paper.fundingStatement || paper.ethicalApproval) && (
                            <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/60 space-y-2.5">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                                    <ShieldCheck className="w-3.5 h-3.5 text-secondary" /> Declarations & Ethics
                                </div>
                                <div className="space-y-2 text-xs text-foreground/85">
                                    {paper.fundingStatement && (
                                        <div>
                                            <span className="font-bold text-foreground mr-1.5">Funding:</span>
                                            <span className="text-muted-foreground">{paper.fundingStatement}</span>
                                        </div>
                                    )}
                                    {paper.competingInterests && (
                                        <div>
                                            <span className="font-bold text-foreground mr-1.5">Conflict of Interest:</span>
                                            <span className="text-muted-foreground">{paper.competingInterests}</span>
                                        </div>
                                    )}
                                    {paper.ethicalApproval && (
                                        <div>
                                            <span className="font-bold text-foreground mr-1.5">Ethical Approval:</span>
                                            <span className="text-muted-foreground">{paper.ethicalApproval}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Supplementary Materials */}
                        {paper.supplementaryFiles && paper.supplementaryFiles.length > 0 && (
                            <div className="p-4 sm:p-5 rounded-xl bg-muted/30 border border-border/60 space-y-3">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wider">
                                    <Paperclip className="w-3.5 h-3.5 text-secondary" /> Supplementary Materials ({paper.supplementaryFiles.length})
                                </div>
                                <div className="space-y-2">
                                    {paper.supplementaryFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-card rounded-lg border border-border/50 text-xs">
                                            <div className="flex items-center gap-2 truncate mr-2">
                                                <FileSpreadsheet className="w-4 h-4 text-primary shrink-0" />
                                                <span className="font-medium truncate">{file.originalName || `Supplementary File ${idx + 1}`}</span>
                                                {file.fileSize && (
                                                    <span className="text-muted-foreground text-[10px] shrink-0">
                                                        ({(file.fileSize / 1024).toFixed(1)} KB)
                                                    </span>
                                                )}
                                            </div>
                                            <a
                                                href={file.fileUrl}
                                                download
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-primary hover:text-primary/80 font-semibold px-2.5 py-1 bg-primary/5 rounded border border-primary/15 transition-colors shrink-0"
                                            >
                                                <Download className="w-3 h-3" /> Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Open Access & Creative Commons License */}
                        <div className="p-3.5 sm:p-4 rounded-xl bg-primary/5 border border-primary/15 shadow-2xs">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-primary text-white text-meta font-bold">
                                        CC BY 4.0
                                    </span>
                                    <p className="font-bold text-primary m-0">Open Access Attribution License</p>
                                </div>
                                <p className="text-muted-foreground leading-relaxed m-0">
                                    Distributed under the terms of the{' '}
                                    <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-primary font-bold underline hover:text-secondary">
                                        Creative Commons Attribution 4.0 International (CC BY 4.0)
                                    </a>.
                                </p>
                            </div>
                        </div>

                        {relatedArticles && relatedArticles.length > 0 && (
                            <RelatedArticlesPanel articles={relatedArticles} />
                        )}
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-4 sm:space-y-5">
                    {/* Publication Certificate Generator */}
                    <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/70 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                                <Award className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-foreground m-0">Publication Certificate</h4>
                                <p className="text-[11px] text-muted-foreground m-0">Official verified author credential</p>
                            </div>
                        </div>
                        <a
                            href={`/api/certificate/${paper.paperId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-2.5 px-4 rounded-xl font-bold text-xs shadow-xs transition-all"
                        >
                            <Download className="w-3.5 h-3.5" /> Download Certificate (PDF)
                        </a>
                    </div>

                    {/* Download Button (Mobile Only) */}
                    <div className="flex flex-col gap-2 md:hidden">
                        <DownloadPaperButton
                            filePath={paper.filePath}
                            paperId={paper.id}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold text-xs shadow-xs hover:bg-primary/90 transition-all"
                        >
                            <Download className="w-4 h-4" /> Download Full Paper
                        </DownloadPaperButton>
                    </div>
                    
                    {/* Citation Widget (Client Component) */}
                    <CitationSection paper={{
                        ...paper,
                        publicationYear: paper.publicationYear || new Date().getFullYear(),
                        coAuthors: paper.coAuthors || []
                    }} />

                    {/* Scholarly XML & Metadata Export Card */}
                    <div className="bg-card p-4 sm:p-5 rounded-2xl border border-border/70 shadow-2xs space-y-3">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
                                <Code2 className="w-4 h-4" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-foreground m-0">Scholarly XML Data</h4>
                                <p className="text-[11px] text-muted-foreground m-0">Standard indexing downloads</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <a
                                href={`/api/export/jats/${paper.paperId}`}
                                download={`jats-${paper.paperId}.xml`}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/60 transition-all cursor-pointer"
                                title="Download NISO JATS 1.3 Full-Text XML"
                            >
                                <Download className="w-3 h-3 text-primary" /> JATS 1.3
                            </a>
                            <a
                                href={`/api/export/pubmed/${paper.paperId}`}
                                download={`pubmed-${paper.paperId}.xml`}
                                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold border border-border/60 transition-all cursor-pointer"
                                title="Download NLM PubMed 2.8 DTD XML"
                            >
                                <Download className="w-3 h-3 text-primary" /> PubMed
                            </a>
                        </div>
                        {paper.doi && (
                            <a
                                href={`/api/export/crossref/${paper.paperId}`}
                                download={`crossref-${paper.paperId}.xml`}
                                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 transition-all cursor-pointer"
                                title="Download CrossRef Schema 5.3.1 XML Deposit"
                            >
                                <Download className="w-3 h-3" /> CrossRef Schema XML
                            </a>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 px-4">
                        <Link
                            href={mode === 'current' ? '/current-issue' : '/archives'}
                            className="flex items-center justify-center gap-2 text-gray-600 hover:text-primary transition-all font-black text-[10px] tracking-[0.2em]"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back to {mode === 'current' ? 'Current Issue' : 'Full Archives'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

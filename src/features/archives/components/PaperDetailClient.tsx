'use client';

import {
    Download,
    BookOpen,
    Hash,
    ArrowLeft,
    FileText,
    Eye,
    Quote
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import type { PublishedPaperUI } from "@/db/types";
import CitationSection from "./CitationSection";
import { incrementPaperViews, incrementPaperDownloads } from "@/actions/publications";

interface PaperDetailClientProps {
    paper: PublishedPaperUI;
    mode?: 'current' | 'archive';
}

export default function PaperDetailClient({ paper, mode = 'archive' }: PaperDetailClientProps) {
    const isRetracted = paper.status === 'retracted';

    useEffect(() => {
        const paperId = paper.id;
        const storageKey = `v_${paperId}`;
        if (!localStorage.getItem(storageKey)) {
            incrementPaperViews(paperId).then((res) => {
                if (res.success) {
                    localStorage.setItem(storageKey, '1');
                }
            });
        }
    }, [paper.id]);

    const handleDownload = () => {
        const paperId = paper.id;
        const storageKey = `d_${paperId}`;
        if (!localStorage.getItem(storageKey)) {
            incrementPaperDownloads(paperId).then((res) => {
                if (res.success) {
                    localStorage.setItem(storageKey, '1');
                }
            });
        }
    };

    return (
        <div className="container-responsive -mt-10">
            {isRetracted && (
                <div className="mb-12 bg-red-50 border-2 border-red-200 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-red-900/5 animate-pulse">
                    <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shrink-0 rotate-3">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h3 className="text-red-900 mb-1 uppercase tracking-tighter m-0">Manuscript Retracted</h3>
                        <p className="text-red-700 font-bold leading-relaxed max-w-2xl m-0">
                            This article has been formally retracted due to editorial policy violations or significant technical inaccuracies. 
                            Please refer to the official retraction notice for detailed reasoning.
                        </p>
                    </div>
                    {/* @ts-expect-error - retractionNoticeUrl might be missing in some states */}
                    {paper.retractionNoticeUrl && (
                        <a 
                            // @ts-expect-error - retractionNoticeUrl might be missing on PublishedPaperUI
                            href={paper.retractionNoticeUrl} 
                            className="bg-red-900 text-white px-8 py-4 rounded-xl font-black text-[10px] tracking-[0.2em] hover:bg-red-800 transition-colors shadow-lg shadow-red-900/20"
                        >
                            VIEW NOTICE
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
                                    <span className="font-medium text-foreground/90">
                                        {Array.isArray(paper.authorsList) ? paper.authorsList.join(', ') : ''}
                                    </span>
                                </div>

                                <a
                                    href={paper.filePath}
                                    download
                                    onClick={handleDownload}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-label shadow-xs transition-all shrink-0"
                                >
                                    <Download className="w-3.5 h-3.5" /> <span>Download PDF</span>
                                </a>
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
                                    <a
                                        href="https://doi.org/10.5281/zenodo.22016453"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-meta font-bold text-emerald-800 transition-colors"
                                    >
                                        <span className="text-label px-1 py-0.5 rounded bg-emerald-700 text-white font-sans">Zenodo DOI</span>
                                        <span>10.5281/zenodo.22016453</span>
                                    </a>
                                )}
                                <a
                                    href="https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-label text-blue-800 transition-colors"
                                >
                                    <span>Zenodo Community</span>
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
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-4 sm:space-y-5">
                    {/* Download Button (Mobile Only) */}
                    <div className="flex flex-col gap-2 md:hidden">
                        <a
                            href={paper.filePath}
                            download
                            onClick={handleDownload}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-lg font-bold text-xs shadow-xs hover:bg-primary/90 transition-all"
                        >
                            <Download className="w-4 h-4" /> Download Full Paper
                        </a>
                    </div>
                    
                    {/* Citation Widget (Client Component) */}
                    <CitationSection paper={{
                        ...paper,
                        publicationYear: paper.publicationYear || new Date().getFullYear(),
                        coAuthors: paper.coAuthors || []
                    }} />

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

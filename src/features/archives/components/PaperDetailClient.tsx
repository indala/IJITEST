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
import { PublishedPaperUI } from "@/db/types";
import CitationSection from "./CitationSection";
import { incrementPaperViews, incrementPaperDownloads } from "@/actions/publications";

interface PaperDetailClientProps {
    paper: PublishedPaperUI;
    id?: string;
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
                        <h3 className="font-serif font-black text-red-900 text-xl md:text-2xl mb-1 uppercase tracking-tighter">Manuscript Retracted</h3>
                        <p className="text-red-700 font-bold text-sm leading-relaxed max-w-2xl">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Article Content */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Title & Core Meta */}
                    <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-gray-100 shadow-xl shadow-blue-900/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

                        <div className="relative z-10 space-y-8">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="bg-primary/5 text-primary text-md px-4 py-2 rounded-full  border border-primary/10">Research Article</span>
                                {paper.volumeNumber && (
                                    <span className="flex items-center gap-2 bg-primary/5 text-primary text-md px-4 py-2 rounded-full   border border-secondary/10">
                                        <BookOpen className="w-3 h-3" /> Volume {paper.volumeNumber}, Issue {paper.issueNumber}
                                    </span>
                                )}
                                <span className="bg-primary/5 text-primary text-md px-4 py-2 rounded-full  border border-gray-200">
                                    Published: {new Date((paper.publishedAt || paper.updatedAt || new Date()) as string | number | Date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>

                            {/* Metrics Section */}
                            <div className="flex flex-wrap items-center gap-6 py-4 px-6 bg-muted/30 rounded-2xl border border-border/50 w-fit">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-primary/60" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Views</span>
                                        <span className="text-sm font-black text-primary tabular-nums">{(paper.views || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border/50" />
                                <div className="flex items-center gap-2">
                                    <Download className="w-4 h-4 text-emerald-600/60" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Downloads</span>
                                        <span className="text-sm font-black text-emerald-700 tabular-nums">{(paper.downloads || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                                <div className="w-px h-8 bg-border/50" />
                                <div className="flex items-center gap-2">
                                    <Quote className="w-4 h-4 text-amber-600/60" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Citations</span>
                                        <span className="text-sm font-black text-amber-700 tabular-nums">{(paper.citations || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <h1 className=" font-serif font-black text-gray-900 leading-[1.15]">
                                {paper.title}
                            </h1>

                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-x-3 gap-y-4 pt-6 border-t border-gray-100">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                                    <span className="-black  tracking-widest  shrink-0">Authors <span className="text-red-600 font-bold">:</span></span>
                                    <div className="flex flex-wrap items-center gap-x-2">
                                        <span className="font-normal leading-tight">{paper.authorsList.join(', ')}</span>
                                    </div>
                                </div>

                                <a
                                    href={paper.filePath}
                                    download
                                    onClick={handleDownload}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hidden md:flex items-center justify-center gap-3 bg-primary text-white px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 whitespace-nowrap"
                                >
                                    <Download className="w-4 h-4" /> DOWNLOAD FULL PAPER
                                </a>
                            </div>

                            
                        </div>
                    </div>

                    {/* Abstract Section */}
                    <div className="bg-gray-50/50 p-10 md:p-14 rounded-[3rem] border border-gray-100 relative group">
                        <h2 className=" font-serif font-black text-gray-900 mb-8 flex items-center gap-3">
                            <FileText className="w-6 h-6 text-primary opacity-50" /> Abstract
                        </h2>
                        <p className="text-gray-800 leading-[1.8] text-justify font-medium indent-8">
                            {paper.abstract}
                        </p>

                        {paper.keywords && (
                            <div className="mt-12 pt-8 border-t border-gray-200/50">
                                <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 tracking-widest mb-4">
                                    <Hash className="w-3 h-3" /> Keywords
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {paper.keywords.split(',').map((kw: string, i: number) => (
                                        <span key={i} className="bg-white px-4 py-2 rounded-xl text-[10px] font-bold text-gray-700 border border-gray-300 tracking-widest shadow-sm">
                                            {kw.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Utilities */}
                <div className="space-y-8">
                    {/* Download Button (Mobile Only) */}
                    <div className="flex flex-col gap-4 px-4 md:hidden">
                        <a
                            href={paper.filePath}
                            download
                            onClick={handleDownload}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-center gap-3 bg-primary text-white py-5 rounded-2xl font-black text-[10px] sm:text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-1 z-10"
                        >
                            <Download className="w-4 h-4" /> DOWNLOAD FULL PAPER
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

"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertTriangle, AlertOctagon, ExternalLink, ShieldCheck, FileCheck, RefreshCw } from "lucide-react";
import type { PublishedPaperUI } from "@/db/types";
import Link from "next/link";

interface CrossmarkDialogProps {
    paper: PublishedPaperUI;
}

export function CrossmarkDialog({ paper }: CrossmarkDialogProps) {
    const [isOpen, setIsOpen] = useState(false);

    const isRetracted = Boolean(paper.retractedAt);
    const isCorrigendum = paper.status === 'corrigendum';
    const isCurrent = !isRetracted && !isCorrigendum;

    const pubDateStr = paper.publishedAt
        ? new Date(paper.publishedAt).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })
        : (paper.publicationYear ? String(paper.publicationYear) : "Recent");

    return (
        <>
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 hover:bg-sky-100 border border-sky-200 text-label font-bold text-sky-900 transition-colors shadow-2xs cursor-pointer"
                title="CrossMark: Check for updates and verify scholarly record status"
            >
                <div className="w-3.5 h-3.5 rounded-full bg-sky-600 text-white flex items-center justify-center text-[9px] font-black leading-none">
                    ✚
                </div>
                <span>Check for updates</span>
            </button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-lg bg-card border-border/80 shadow-2xl rounded-2xl p-6">
                    <DialogHeader className="space-y-2 border-b border-border/60 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 shrink-0">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-base font-bold text-foreground">
                                    CrossMark Publication Record
                                </DialogTitle>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Verified scholarly record &amp; publication integrity status
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Status Badge Banner */}
                        {isCurrent && (
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 m-0">
                                        Record Status: Current &amp; Active
                                    </p>
                                    <p className="text-[11px] text-emerald-700/90 dark:text-emerald-400 m-0 mt-0.5 leading-relaxed">
                                        No updates, retractions, or corrigenda have been reported for this publication.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isCorrigendum && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-amber-800 dark:text-amber-300 m-0">
                                        Notice: Corrigendum / Correction Issued
                                    </p>
                                    <p className="text-[11px] text-amber-700/90 dark:text-amber-400 m-0 mt-0.5 leading-relaxed">
                                        An editorial amendment has been issued for this published article.
                                    </p>
                                </div>
                            </div>
                        )}

                        {isRetracted && (
                            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-3">
                                <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-rose-800 dark:text-rose-300 m-0">
                                        Notice: Formally Retracted
                                    </p>
                                    <p className="text-[11px] text-rose-700/90 dark:text-rose-400 m-0 mt-0.5 leading-relaxed">
                                        {paper.retractionReason || "This article has been formally retracted in accordance with COPE publishing guidelines."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Paper Details Summary */}
                        <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 space-y-2 text-xs">
                            <div>
                                <span className="text-muted-foreground font-medium">Article Title:</span>
                                <p className="font-semibold text-foreground mt-0.5 leading-snug">{paper.title}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px]">
                                <div>
                                    <span className="text-muted-foreground">Publication Date:</span>
                                    <p className="font-medium text-foreground">{pubDateStr}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Journal Section:</span>
                                    <p className="font-medium text-foreground">{paper.sectionTitle || "Original Research"}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Peer Review:</span>
                                    <p className="font-medium text-foreground">Double-Blind Peer Reviewed</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Licence:</span>
                                    <p className="font-medium text-emerald-600 dark:text-emerald-400">CC BY 4.0 (Open Access)</p>
                                </div>
                            </div>
                        </div>

                        {/* Scholarly Integrity Checklist */}
                        <div className="space-y-1.5 text-xs">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Published under official peer-review and COPE standards</span>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span>Crossref permanent DOI registration and crawler archiving</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-3 border-t border-border/60">
                        <Link
                            href="/ethics"
                            target="_blank"
                            className="text-xs text-primary hover:underline font-semibold"
                        >
                            Editorial &amp; Retraction Policies &rarr;
                        </Link>

                        {paper.doi ? (
                            <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
                                <a href={`https://doi.org/${paper.doi}`} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-3.5 h-3.5" /> Resolve DOI
                                </a>
                            </Button>
                        ) : (
                            <Button size="sm" variant="ghost" onClick={() => setIsOpen(false)} className="text-xs">
                                Close
                            </Button>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

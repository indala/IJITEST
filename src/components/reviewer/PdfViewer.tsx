"use client";

import { useState } from 'react';
import { ExternalLink, FileText, RefreshCw, Download, ShieldCheck, Smartphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface PdfViewerProps {
    pdfUrl: string;
    title: string;
}

export function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
    const isMobile = useIsMobile();
    const [isHovered, setIsHovered] = useState(false);
    const [reloadCounter, setReloadCounter] = useState(0);

    const effectiveUrl = reloadCounter > 0
        ? (pdfUrl.includes('?') ? `${pdfUrl}&reload=${reloadCounter}` : `${pdfUrl}?reload=${reloadCounter}`)
        : pdfUrl;

    const openInNewWindow = () => {
        window.open(effectiveUrl, '_blank', 'noopener,noreferrer');
    };

    const handleReload = () => {
        setReloadCounter(prev => prev + 1);
    };

    // Mobile View: Mobile browsers block inline PDF iframes. Render a dedicated, native-friendly view card.
    if (isMobile) {
        return (
            <div className="w-full h-full min-h-[380px] bg-card rounded-xl border border-border/70 p-4 sm:p-6 flex flex-col justify-between items-center text-center">
                <div className="w-full flex items-center justify-between pb-3 border-b border-border/60 text-meta">
                    <span className="flex items-center gap-1.5 text-primary font-semibold">
                        <FileText className="w-3.5 h-3.5" /> Manuscript PDF
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground text-caption">
                        <Smartphone className="w-3 h-3" /> Mobile View
                    </span>
                </div>

                <div className="py-6 flex flex-col items-center max-w-sm mx-auto space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h4 className="font-bold text-foreground text-base leading-snug line-clamp-3">
                            {title || "Manuscript Document"}
                        </h4>
                        <p className="text-caption text-muted-foreground leading-relaxed">
                            Mobile browsers restrict embedding PDFs inside pages. Tap below to read with your phone&apos;s native reader (supports pinch-to-zoom and multi-page search).
                        </p>
                    </div>
                </div>

                <div className="w-full space-y-2 pt-3 border-t border-border/60">
                    <Button
                        onClick={openInNewWindow}
                        className="w-full h-11 btn-primary gap-2 font-bold text-sm shadow-sm"
                    >
                        <ExternalLink className="w-4 h-4" /> Open Full PDF in Viewer
                    </Button>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            asChild
                            className="flex-1 h-9 gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
                        >
                            <a href={effectiveUrl} download>
                                <Download className="w-3.5 h-3.5" /> Download
                            </a>
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={handleReload}
                            className="h-9 px-3 gap-1.5 text-xs text-muted-foreground"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reload
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Desktop View: Embedded Iframe with accessible persistent header controls + floating hover bar
    return (
        <div
            className="relative w-full h-full bg-white group flex flex-col"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Desktop Top Helper Bar */}
            <div className="h-9 px-3.5 bg-muted/40 border-b border-border/60 flex items-center justify-between text-meta select-none shrink-0">
                <div className="flex items-center gap-2 text-primary font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[280px] lg:max-w-md">{title || "Manuscript Preview"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={handleReload}
                        className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors cursor-pointer text-xs"
                        title="Reload PDF iframe"
                    >
                        <RefreshCw className="w-3 h-3" /> Reload
                    </button>
                    <span className="text-border">|</span>
                    <a
                        href={effectiveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline font-semibold cursor-pointer text-xs"
                    >
                        <ExternalLink className="w-3 h-3" /> New Tab
                    </a>
                </div>
            </div>

            {/* Main Iframe with dynamic key to force remount on URL update */}
            <div className="flex-1 relative w-full h-full min-h-0 bg-neutral-100">
                <iframe
                    key={effectiveUrl}
                    src={`${effectiveUrl}#toolbar=0&navpanes=0`}
                    className="w-full h-full border-none block"
                    title={title}
                />
            </div>

            {/* Controls Overlay on Desktop Hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/95 backdrop-blur-xl border border-border/40 shadow-2xl z-20"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReload}
                            className="h-8 px-3 gap-1.5 font-semibold text-xs hover:bg-primary/10 hover:text-primary transition-all rounded-lg cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reload
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openInNewWindow}
                            className="h-8 px-3 gap-1.5 font-semibold text-xs hover:bg-primary/10 hover:text-primary transition-all rounded-lg cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            asChild
                            className="h-8 px-3 gap-1.5 font-semibold text-xs hover:bg-primary/10 hover:text-primary transition-all rounded-lg cursor-pointer"
                        >
                            <a href={effectiveUrl} download>
                                <Download className="w-3.5 h-3.5" /> Download
                            </a>
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

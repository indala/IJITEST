"use client"

import { useState } from 'react'
import { ExternalLink, FileText, RefreshCw } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"

interface PdfViewerProps {
    pdfUrl: string
    title: string
}

export function PdfViewer({ pdfUrl, title }: PdfViewerProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [reloadCounter, setReloadCounter] = useState(0)

    const effectiveUrl = reloadCounter > 0
        ? (pdfUrl.includes('?') ? `${pdfUrl}&reload=${reloadCounter}` : `${pdfUrl}?reload=${reloadCounter}`)
        : pdfUrl

    const openInNewWindow = () => {
        window.open(effectiveUrl, '_blank')
    }

    const handleReload = () => {
        setReloadCounter(prev => prev + 1)
    }

    return (
        <div
            className="relative w-full h-full bg-white group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Iframe with dynamic key to force remount on URL update */}
            <iframe
                key={effectiveUrl}
                src={`${effectiveUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none"
                title={title}
            />

            {/* Controls Overlay */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/90 backdrop-blur-xl border border-border/40 shadow-2xl z-20"
                    >
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleReload}
                            className="h-9 px-3 gap-2 font-semibold text-xs tracking-wider hover:bg-primary/10 hover:text-primary transition-all rounded-lg cursor-pointer"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Reload Preview
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={openInNewWindow}
                            className="h-9 px-3 gap-2 font-semibold text-xs tracking-wider hover:bg-primary/10 hover:text-primary transition-all rounded-lg cursor-pointer"
                        >
                            <ExternalLink className="w-3.5 h-3.5" /> Open in New Tab
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Corner Badge */}
            <div className="absolute top-4 right-4 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 backdrop-blur-md border border-primary/20">
                    <FileText className="w-3 h-3 text-primary" />
                    <span className="text-label font-bold text-primary uppercase tracking-widest">Manuscript Preview</span>
                </div>
            </div>
        </div>
    )
}

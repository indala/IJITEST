'use client';

import { useEffect } from 'react';
import { Download } from 'lucide-react';
import { incrementPaperViews, incrementPaperDownloads } from '@/actions/publications';

export function PaperViewTracker({ paperId }: { paperId: number }) {
    useEffect(() => {
        const storageKey = `v_${paperId}`;
        if (!localStorage.getItem(storageKey)) {
            incrementPaperViews(paperId).then((res) => {
                if (res.success) {
                    localStorage.setItem(storageKey, '1');
                }
            });
        }
    }, [paperId]);

    return null;
}

interface DownloadPaperButtonProps {
    filePath: string;
    paperId: number;
    className?: string;
    children?: React.ReactNode;
}

export function DownloadPaperButton({ filePath, paperId, className, children }: DownloadPaperButtonProps) {
    const handleDownload = () => {
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
        <a
            href={filePath}
            download
            onClick={handleDownload}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {children || (
                <>
                    <Download className="w-3.5 h-3.5" /> <span>Download PDF</span>
                </>
            )}
        </a>
    );
}

'use client';

import { useEffect, useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { incrementPaperViews, incrementPaperDownloads } from '@/actions/publications';
import { generateCertificateAction } from '@/actions/certificate';

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

interface DownloadCertificateButtonProps {
    paperId: string;
    className?: string;
    children?: React.ReactNode;
}

export function DownloadCertificateButton({ paperId, className, children }: DownloadCertificateButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        try {
            const res = await generateCertificateAction(paperId);
            if (res.success && res.pdfBase64) {
                const byteCharacters = atob(res.pdfBase64);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = res.filename || `Certificate-${paperId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                alert(res.error || 'Failed to generate certificate');
            }
        } catch (err) {
            console.error('Certificate download error:', err);
            alert('Failed to generate certificate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleDownload}
            disabled={loading}
            className={className}
        >
            {loading ? (
                <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating Certificate...</span>
                </>
            ) : (
                children || (
                    <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Certificate (PDF)</span>
                    </>
                )
            )}
        </button>
    );
}


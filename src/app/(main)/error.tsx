'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-card rounded-2xl border border-destructive/20 shadow-2xs my-10 max-w-lg mx-auto">
            <div className="w-14 h-14 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4 text-destructive">
                <AlertTriangle className="w-7 h-7" />
            </div>
            <h2 className="text-foreground m-0 mb-2">Interruption in Services</h2>
            <p className="text-muted-foreground m-0 mb-6 leading-relaxed">
                An unexpected technical error has occurred while processing your request. Our systems have logged this event for administrative review.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button
                    onClick={() => reset()}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
                >
                    <RotateCcw className="w-3.5 h-3.5" /> Restart Segment
                </button>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-border text-muted-foreground rounded-lg font-bold text-xs hover:bg-muted/40 transition-all cursor-pointer"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}

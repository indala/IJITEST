'use client';

import { memo } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';

function JournalMetricsWidget() {
    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                    <Award className="w-4 h-4 2xl:w-5 2xl:h-5 text-secondary" />
                </div>
                <div>
                    <h3 className="m-0 text-primary">Indexing & Metrics</h3>
                    <p className="text-meta text-muted-foreground m-0">Verified Standards</p>
                </div>
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="font-semibold text-foreground/80">Access Model</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        100% Gold OA
                    </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="font-semibold text-foreground/80">Digital Archiving</span>
                    <span className="font-mono text-secondary font-bold text-[11px]">Open Science Repository</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="font-semibold text-foreground/80">Peer Review</span>
                    <span className="text-foreground/90 font-bold text-[11px]">Double-Blind</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="font-semibold text-foreground/80">Frequency</span>
                    <span className="text-foreground/90 font-bold text-[11px]">Monthly (12/yr)</span>
                </div>
            </div>
        </div>
    );
}

export default memo(JournalMetricsWidget);

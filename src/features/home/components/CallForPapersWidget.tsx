import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function CallForPapersWidget() {
    return (
        <div className="bg-card border border-border/70 border-l-4 border-l-secondary rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-2.5 2xl:space-y-3.5 shadow-2xs relative overflow-hidden">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
                    <MessageSquare className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand m-0">Call for Papers</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed m-0">
                IJITEST welcomes original research and review contributions in engineering, science, and technology.
            </p>
            <Link 
                href="/submit" 
                className="btn-secondary btn-sm w-full flex items-center justify-center gap-1 no-underline"
            >
                <span>Submit Manuscript</span>
                <ChevronRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

export default memo(CallForPapersWidget);

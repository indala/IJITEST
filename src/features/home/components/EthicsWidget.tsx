import { ShieldCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function EthicsWidget() {
    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <ShieldCheck className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand m-0">
                    Publication Ethics
                </h3>
            </div>
            <p className="text-caption m-0">
                IJITEST adheres strictly to COPE (Committee on Publication Ethics) international standards and core practices.
            </p>
            <Link 
                href="/ethics" 
                className="btn-outline btn-sm w-full flex items-center justify-center gap-1.5 no-underline group"
            >
                <span>Read Policy & Guidelines</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
        </div>
    );
}

export default memo(EthicsWidget);

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function EthicsWidget() {
    return (
        <div>
            <div className="bg-primary p-3.5 sm:p-4 2xl:p-5 rounded-xl text-white shadow-md space-y-2 2xl:space-y-3 group">
                <h3 className="text-white m-0">Publication Ethics</h3>
                <p className="text-white/80 leading-relaxed m-0">
                    IJITEST adheres strictly to COPE (Committee on Publication Ethics) international standards.
                </p>
                <Link href="/ethics" className="text-xs 2xl:text-sm font-bold text-secondary hover:text-white transition-colors inline-flex items-center gap-1 pt-1">
                    <span>Read Policy & Guidelines</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </div>
    );
}

export default memo(EthicsWidget);

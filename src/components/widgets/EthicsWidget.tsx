import { ShieldAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function EthicsWidget() {
    return (
        <div className="bg-secondary p-8 rounded-[3rem] text-white shadow-xl shadow-secondary/20 group">
            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
            <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Statement</h3>
            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE (Committee on Publication Ethics) guidelines for research integrity.</p>
            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                View Ethics <ChevronRight className="w-4 h-4" />
            </Link>
        </div>
    );
}

export default memo(EthicsWidget);

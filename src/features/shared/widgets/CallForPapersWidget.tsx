import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function CallForPapersWidget() {
    return (
        <div className="bg-primary p-8 rounded-[3rem] text-white shadow-2xl shadow-primary/20 group">
            <MessageSquare className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
            <h3 className="text-xl font-serif font-black mb-4 italic">Calls for Papers</h3>
            <p className="text-xs text-white/70 mb-8 font-medium italic leading-relaxed">
                There is no deadline for regular paper submission. Authors are requested to send unpublished manuscripts to: <span className="text-secondary font-black">editor@ijitest.org</span>
            </p>
            <Link href="/submit" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                <span className="text-[10px] font-black uppercase tracking-widest">Submit Now</span>
                <ChevronRight className="w-4 h-4 text-secondary" />
            </Link>
        </div>
    );
}

export default memo(CallForPapersWidget);

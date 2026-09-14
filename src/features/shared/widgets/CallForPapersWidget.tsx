import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';

function CallForPapersWidget() {
    return (
        <div className="bg-primary text-white rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-2.5 2xl:space-y-3.5 shadow-md relative overflow-hidden">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary">
                    <MessageSquare className="w-4 h-4 2xl:w-5 2xl:h-5" />
                </div>
                <h3 className="card-title-brand text-white m-0">Call for Papers</h3>
            </div>
            <p className="text-white/80 leading-relaxed m-0">
                Rolling monthly submissions with fast-track double-blind review. Open to all engineering disciplines.
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

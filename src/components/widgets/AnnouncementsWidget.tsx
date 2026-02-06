import { Newspaper } from 'lucide-react';
import { memo } from 'react';

function AnnouncementsWidget() {
    return (
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="flex items-center gap-3 mb-6">
                <Newspaper className="w-5 h-5 text-secondary" />
                <h3 className="text-xl font-serif font-black italic">Announcements</h3>
            </div>
            <div className="space-y-6">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100/50">
                    <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest mb-1">Latest Update</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">
                        Research papers are now open for submissions in the 2026 Edition.
                    </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100/50">
                    <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-1">Indexing Update</p>
                    <p className="text-sm font-bold text-gray-900 leading-tight">Google Scholar synchronization active for current year.</p>
                </div>
            </div>
        </div>
    );
}

export default memo(AnnouncementsWidget);

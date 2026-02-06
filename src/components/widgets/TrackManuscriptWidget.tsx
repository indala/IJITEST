"use client";

import { Search } from 'lucide-react';
import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';

function TrackManuscriptWidget() {
    const [paperId, setPaperId] = useState('');
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (paperId.trim()) {
            router.push(`/track?id=${paperId}`);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[3rem] border-2 border-primary/5 shadow-2xl shadow-primary/5">
            <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Track Your Paper</h3>
            <form onSubmit={handleTrack} className="space-y-4">
                <input
                    type="text"
                    placeholder="Manuscript ID"
                    value={paperId}
                    onChange={(e) => setPaperId(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm font-bold outline-none"
                />
                <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-3">
                    <Search className="w-4 h-4" /> Track Manuscript
                </button>
            </form>
        </div>
    );
}

export default memo(TrackManuscriptWidget);

"use client";
import { Globe } from 'lucide-react';
import { memo } from 'react';

const roadmapItems = [
    { name: "Google Scholar", status: "Active Processing" },
    { name: "CrossRef", status: "Full Assignment" },
    { name: "ROAD Directory", status: "Verified Entry" },
    { name: "UGC CARE", status: "Upcoming Goal" },
    { name: "Scopus / WOS", status: "Strategic Target" },
    { name: "ResearchGate", status: "Auto-Integration" }
];

function RoadmapSection() {
    return (
        <section className="bg-primary p-12 md:p-16 rounded-[4rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <div>
                    <h2 className="text-3xl font-serif font-black mb-2 italic tracking-tight">Institutional Roadmaps</h2>
                    <p className="text-white/60 font-bold uppercase text-[10px] tracking-widest">Our Future Indexing Objectives</p>
                </div>
                <Globe className="w-12 h-12 text-white/20 hidden md:block" />
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {roadmapItems.map((item, idx) => (
                    <li key={idx} className="flex flex-col gap-2 p-6 bg-white/5 rounded-2xl border border-white/10 group hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-secondary rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                            <span className="font-serif font-black text-lg tracking-tight italic">{item.name}</span>
                        </div>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.status}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default memo(RoadmapSection);

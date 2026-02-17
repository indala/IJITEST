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
        <section className="bg-primary p-12 md:p-20 rounded-[4rem] text-white shadow-vip-hover relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20 relative z-10">
                <div className="space-y-4">
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic leading-none">Institutional <span className="text-secondary not-italic">Roadmaps</span></h2>
                    <p className="text-white/40 font-black uppercase text-[10px] tracking-[0.5em] italic flex items-center gap-4">
                        <span className="w-12 h-[1px] bg-secondary" /> Global Indexing Milestones
                    </p>
                </div>
                <Globe className="w-16 h-16 text-white/10 hidden md:block group-hover:rotate-[30deg] transition-transform duration-700" />
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {roadmapItems.map((item, idx) => (
                    <li key={idx} className="flex flex-col gap-4 p-8 bg-white/5 rounded-[2rem] border border-white/5 group/item hover:bg-white/10 transition-all duration-500 hover:-translate-y-1">
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-2 bg-secondary rounded-full shadow-[0_0_15px_rgba(239,68,68,0.8)] group-hover/item:scale-150 transition-transform"></div>
                            <span className="font-black text-xl tracking-tight italic">{item.name}</span>
                        </div>
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] block">Status Protocol</span>
                            <span className="text-[10px] font-black text-secondary italic uppercase tracking-[0.2em]">{item.status}</span>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default memo(RoadmapSection);

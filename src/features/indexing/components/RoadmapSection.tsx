"use client";
import { memo } from 'react';
import { CheckCircle2, Clock, Shield, Globe, Award, Zap } from 'lucide-react';

const roadmapPhases = [
    {
        phase: "Phase 1",
        title: "Foundation & Launch",
        status: "Completed",
        items: ["Peer Review Infrastructure", "Global Archive System", "OAI-PMH Protocols"],
        icon: Shield,
        color: "text-green-500",
        bgColor: "bg-green-50"
    },
    {
        phase: "Phase 2",
        title: "Scholarly Identity",
        status: "In Progress",
        items: ["ISSN Registration", "DOI Assignment (CrossRef)", "ROAD Directory"],
        icon: Zap,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        phase: "Phase 3",
        title: "Global Visibility",
        status: "Q3 2026",
        items: ["Google Scholar Discovery", "SJIF Impact Factor", "Directory of Research"],
        icon: Globe,
        color: "text-amber-600",
        bgColor: "bg-amber-50"
    },
    {
        phase: "Phase 4",
        title: "Elite Indexing",
        status: "Strategic Goal",
        items: ["Scopus Evaluation", "Web of Science", "UGC CARE Listing"],
        icon: Award,
        color: "text-slate-400",
        bgColor: "bg-slate-50"
    }
];

function RoadmapSection() {
    return (
        <section className="space-y-12 2xl:space-y-16">
            <div className="space-y-4">
                <h2 className="text-xl xl:text-2xl 2xl:text-3xl font-semibold text-primary flex items-center gap-3">
                    <span className="text-xs xl:text-sm 2xl:text-base text-muted-foreground font-mono">01.</span>
                    Strategic Growth Roadmap
                </h2>
                <p className="text-xs xl:text-sm 2xl:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    IJITEST follows a rigorous path toward global scientific recognition. Our growth is structured into distinct phases, ensuring every published paper adheres to international scholarly standards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8 relative">
                {/* Visual Connector for Desktop (Optional, can be added with CSS) */}
                
                {roadmapPhases.map((item, idx) => (
                    <div
                        key={idx}
                        className={`group p-8 xl:p-10 2xl:p-12 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                            item.status === "Completed" ? "bg-white border-green-100" : 
                            item.status === "In Progress" ? "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50" : 
                            "bg-slate-50/50 border-slate-100 opacity-80"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={`p-3 xl:p-4 rounded-xl ${item.bgColor} ${item.color}`}>
                                <item.icon className="w-6 h-6 xl:w-7 xl:h-7 2xl:w-8 2xl:h-8" />
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] xl:text-xs 2xl:text-sm font-mono text-muted-foreground block mb-1 uppercase tracking-tighter">{item.phase}</span>
                                <div className={`flex items-center gap-1.5 justify-end px-2.5 py-1 rounded-full text-[10px] xl:text-xs 2xl:text-sm font-bold uppercase tracking-wider ${
                                    item.status === "Completed" ? "bg-green-100 text-green-700" :
                                    item.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                    "bg-slate-200 text-slate-600"
                                }`}>
                                    {item.status === "Completed" ? <CheckCircle2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-4.5 2xl:h-4.5" /> : <Clock className="w-3.5 h-3.5 xl:w-4 xl:h-4 2xl:w-4.5 2xl:h-4.5" />}
                                    {item.status}
                                </div>
                            </div>
                        </div>

                        <h3 className="text-lg xl:text-xl 2xl:text-2xl font-bold text-primary mb-4">{item.title}</h3>
                        
                        <ul className="space-y-3">
                            {item.items.map((sub, sIdx) => (
                                <li key={sIdx} className="flex items-center gap-3 text-xs xl:text-sm 2xl:text-lg text-muted-foreground group-hover:text-primary/80 transition-colors">
                                    <div className={`w-1.5 h-1.5 rounded-full ${
                                        item.status === "Completed" ? "bg-green-400" : 
                                        item.status === "In Progress" ? "bg-blue-400" : 
                                        "bg-slate-300"
                                    }`} />
                                    {sub}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-6 xl:p-8 2xl:p-10 bg-[#000066]/5 rounded-xl border border-[#000066]/10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-12 h-12 shrink-0 bg-[#000066] text-white rounded-full flex items-center justify-center font-bold italic shadow-inner">i</div>
                <p className="text-[11px] xl:text-sm 2xl:text-lg text-primary/70 leading-relaxed m-0 text-center sm:text-left">
                    <strong className="text-primary 2xl:text-xl">Note to Authors:</strong> All articles published during the registration phases (Phase 1 & 2) will receive retroactive metadata updates, including DOI assignments and ISSN cross-linking, once registrations are finalized.
                </p>
            </div>
        </section>
    );
}

export default memo(RoadmapSection);

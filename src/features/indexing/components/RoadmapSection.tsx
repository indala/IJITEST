import { memo } from 'react';
import { CheckCircle2, Clock, Shield, Globe, Award, Zap, ExternalLink } from 'lucide-react';

interface RoadmapSubItem {
    title: string;
    status: 'Completed' | 'In Progress' | 'Pending';
    badgeText?: string;
    linkUrl?: string;
}

interface RoadmapPhase {
    phase: string;
    title: string;
    status: 'Completed' | 'In Progress' | 'Strategic Goal' | 'Q3 2026';
    items: RoadmapSubItem[];
    icon: React.ElementType;
    color: string;
    bgColor: string;
}

const roadmapPhases: RoadmapPhase[] = [
    {
        phase: "Phase 1",
        title: "Foundation & Launch",
        status: "Completed",
        items: [
            { title: "Peer Review Infrastructure", status: "Completed" },
            { title: "Global Archive System", status: "Completed" },
            { title: "OAI-PMH Protocols", status: "Completed" }
        ],
        icon: Shield,
        color: "text-green-500",
        bgColor: "bg-green-50"
    },
    {
        phase: "Phase 2",
        title: "Scholarly Identity & Indexing",
        status: "In Progress",
        items: [
            { 
                title: "ISSN Registration", 
                status: "Completed", 
                badgeText: "E-ISSN: 3139-6887" 
            },
            { 
                title: "OpenAIRE Indexing", 
                status: "Completed", 
                badgeText: "Indexed (Verified)",
                linkUrl: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453"
            },
            { 
                title: "Zenodo Digital Repository", 
                status: "Completed", 
                badgeText: "DOI: 10.5281/zenodo.22016453",
                linkUrl: "https://doi.org/10.5281/zenodo.22016453"
            },
            { 
                title: "CiteFactor Indexing", 
                status: "In Progress", 
                badgeText: "Registered" 
            },
            { 
                title: "OpenAlex Indexing", 
                status: "In Progress", 
                badgeText: "Registered" 
            },
            { 
                title: "ROAD Directory Indexing", 
                status: "In Progress" 
            }
        ],
        icon: Zap,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        phase: "Phase 3",
        title: "Global Visibility",
        status: "In Progress",
        items: [
            { title: "Google Scholar Discovery", status: "In Progress", badgeText: "Papers Discovered" },
            { title: "SJIF Impact Factor Evaluation", status: "In Progress" },
            { title: "Crossref DOI Continuous Sync", status: "In Progress" },
            { title: "Directory of Research Journal Indexing", status: "Pending" }
        ],
        icon: Globe,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        phase: "Phase 4",
        title: "Elite Indexing",
        status: "Strategic Goal",
        items: [
            { title: "Scopus Evaluation", status: "Pending" },
            { title: "Web of Science", status: "Pending" },
            { title: "UGC CARE Listing", status: "Pending" }
        ],
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
                    Strategic Growth & Indexing Roadmap
                </h2>
                <p className="text-xs xl:text-sm 2xl:text-lg text-muted-foreground max-w-2xl leading-relaxed">
                    IJITEST follows a rigorous path toward global scientific recognition. Our growth is structured into distinct phases, ensuring every published paper adheres to international scholarly standards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 2xl:gap-8 relative">
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
                        
                        <ul className="space-y-3.5">
                            {item.items.map((sub, sIdx) => (
                                <li key={sIdx} className="flex flex-wrap items-center justify-between gap-2 text-xs xl:text-sm 2xl:text-base text-muted-foreground group-hover:text-primary/80 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${
                                            sub.status === "Completed" ? "bg-emerald-500" : 
                                            sub.status === "In Progress" ? "bg-blue-500" : 
                                            "bg-slate-300"
                                        }`} />
                                        <span className="font-medium text-slate-800">{sub.title}</span>
                                    </div>

                                    {sub.status === "Completed" && (
                                        sub.linkUrl ? (
                                            <a 
                                                href={sub.linkUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] xl:text-xs font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 shadow-sm transition-colors"
                                            >
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                {sub.badgeText || "Completed"}
                                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] xl:text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                {sub.badgeText || "Completed"}
                                            </span>
                                        )
                                    )}

                                    {sub.status === "In Progress" && sub.badgeText && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] xl:text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                            <Clock className="w-3 h-3 text-blue-600" />
                                            {sub.badgeText}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-6 xl:p-8 2xl:p-10 bg-[#000066]/5 rounded-xl border border-[#000066]/10 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-12 h-12 shrink-0 bg-[#000066] text-white rounded-full flex items-center justify-center font-bold italic shadow-inner">i</div>
                <p className="text-[11px] xl:text-sm 2xl:text-lg text-primary/80 leading-relaxed m-0 text-center sm:text-left">
                    <strong className="text-primary 2xl:text-xl">Active Scholarly Credentials:</strong> Articles published in IJITEST are assigned formal metadata including <strong className="text-primary">E-ISSN: 3139-6887</strong> and are indexed with verified digital repositories including <strong className="text-primary">OpenAIRE</strong> & <strong className="text-primary">Zenodo</strong> (DOI: 10.5281/zenodo.22016453). Crossref and expanded indexing partners (CiteFactor, OpenAlex) are continuously synchronized.
                </p>
            </div>
        </section>
    );
}

export default memo(RoadmapSection);

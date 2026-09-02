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
                badgeText: "Indexed & Disclosed",
                linkUrl: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453"
            },
            { 
                title: "Zenodo Open Science Repository", 
                status: "Completed", 
                badgeText: "Community Archive",
                linkUrl: "https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest"
            },
            { 
                title: "OpenAlex Indexing", 
                status: "In Progress", 
                badgeText: "Registered" 
            },
            { 
                title: "CiteFactor Indexing", 
                status: "In Progress", 
                badgeText: "Registered" 
            },
            { 
                title: "ROAD Directory Listing", 
                status: "Completed",
                badgeText: "UNESCO Partner"
            }
        ],
        icon: Zap,
        color: "text-blue-600",
        bgColor: "bg-blue-50"
    },
    {
        phase: "Phase 3",
        title: "Global Visibility & Crossref",
        status: "In Progress",
        items: [
            { title: "Crossref Publisher DOI Prefix", status: "In Progress", badgeText: "Onboarding" },
            { title: "Google Scholar Discovery", status: "In Progress", badgeText: "Automated Metadata" },
            { title: "SJIF Impact Factor Evaluation", status: "In Progress" },
            { title: "Directory of Research Journals Indexing", status: "Pending" }
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
        <section className="space-y-6">
            <div className="space-y-1.5">
                <h2 className="flex items-center gap-2 m-0">
                    <span className="text-meta">01.</span>
                    Strategic Growth & Indexing Roadmap
                </h2>
                <p className="text-muted-foreground max-w-2xl m-0">
                    IJITEST follows a rigorous path toward global scientific recognition. Our growth is structured into distinct phases, ensuring every published paper adheres to international scholarly standards.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
                {roadmapPhases.map((item, idx) => (
                    <div
                        key={idx}
                        className={`group p-4 sm:p-5 rounded-xl border transition-all duration-200 hover:shadow-2xs ${
                            item.status === "Completed" ? "bg-white border-green-200" : 
                            item.status === "In Progress" ? "bg-white border-blue-200 shadow-2xs" : 
                            "bg-slate-50/50 border-slate-200 opacity-80"
                        }`}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <div className={`p-2 rounded-lg ${item.bgColor} ${item.color}`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                                <span className="text-meta block mb-0.5 uppercase tracking-tighter">{item.phase}</span>
                                <div className={`flex items-center gap-1 justify-end px-2 py-0.5 rounded-full text-label ${
                                    item.status === "Completed" ? "bg-green-100 text-green-700" :
                                    item.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                    "bg-slate-200 text-slate-600"
                                }`}>
                                    {item.status === "Completed" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                    {item.status}
                                </div>
                            </div>
                        </div>

                        <h3 className="mb-2 m-0">{item.title}</h3>
                        
                        <ul className="space-y-1.5 list-none p-0 m-0">
                            {item.items.map((sub, sIdx) => (
                                <li key={sIdx} className="flex flex-wrap items-center justify-between gap-1.5 text-xs text-muted-foreground group-hover:text-primary/80 transition-colors">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
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
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300 shadow-2xs transition-colors"
                                            >
                                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                                {sub.badgeText || "Completed"}
                                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                                                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                                {sub.badgeText || "Completed"}
                                            </span>
                                        )
                                    )}

                                    {sub.status === "In Progress" && sub.badgeText && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                            <Clock className="w-2.5 h-2.5 text-blue-600" />
                                            {sub.badgeText}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="p-3.5 sm:p-4 bg-[#000066]/5 rounded-xl border border-[#000066]/10 flex flex-col sm:flex-row items-center gap-3">
                <div className="w-8 h-8 shrink-0 bg-[#000066] text-white rounded-full flex items-center justify-center font-bold text-xs shadow-inner">i</div>
                <p className="text-xs text-primary/80 leading-relaxed m-0 text-center sm:text-left">
                    <strong className="text-primary">Active Scholarly Credentials:</strong> Articles published in IJITEST are assigned formal metadata including <strong className="text-primary">E-ISSN: 3139-6887</strong>, permanent digital object identifiers (DataCite / Crossref), and are indexed with verified digital repositories including <strong className="text-primary">OpenAIRE</strong> & <strong className="text-primary">Zenodo</strong>. Expanded indexing partners (CiteFactor, OpenAlex, Crossref) are actively integrated.
                </p>
            </div>
        </section>
    );
}

export default memo(RoadmapSection);

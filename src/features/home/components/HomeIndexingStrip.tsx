import { memo } from 'react';
import Link from 'next/link';
import { ExternalLink, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { Card } from "@/components/ui/card";
import {
    CrossrefLogo,
    IssnLogo,
    GoogleScholarLogo,
    ZenodoLogo,
    CiteSeerXLogo,
    DoajLogo,
    CiteFactorLogo,
    OpenAireLogo
} from '@/features/indexing/components/IndexingLogos';

const indexingAgencies = [
    {
        name: "Crossref",
        role: "Digital Object Identifiers",
        status: "Active Registration",
        isVerified: true,
        link: "https://www.crossref.org",
        Component: CrossrefLogo,
    },
    {
        name: "ISSN Centre (ROAD)",
        role: "International Serial Directory",
        status: "E-ISSN: 3139-6887",
        isVerified: true,
        link: "https://road.issn.org",
        Component: IssnLogo,
    },
    {
        name: "Google Scholar",
        role: "Citation & Discovery",
        status: "Automated Metadata",
        isVerified: true,
        Component: GoogleScholarLogo,
    },
    {
        name: "Zenodo (CERN)",
        role: "Open Science Repository",
        status: "Community Archive",
        isVerified: true,
        link: "https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest",
        Component: ZenodoLogo,
    },
    {
        name: "CiteSeerX",
        role: "Computer Science Hub",
        status: "Metadata Disclosed",
        isVerified: true,
        Component: CiteSeerXLogo,
    },
    {
        name: "DOAJ",
        role: "Open Access Directory",
        status: "Under Evaluation",
        isVerified: false,
        link: "https://doaj.org",
        Component: DoajLogo,
    },
    {
        name: "CiteFactor",
        role: "Academic Journal Indexing",
        status: "Registered Partner",
        isVerified: false,
        link: "https://www.citefactor.org",
        Component: CiteFactorLogo,
    },
    {
        name: "OpenAIRE",
        role: "European Scholarly Hub",
        status: "Indexed & Disclosed",
        isVerified: true,
        link: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453",
        Component: OpenAireLogo,
    },
];

function HomeIndexingStrip() {
    return (
        <section className="space-y-4 pt-2" aria-labelledby="indexing-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-primary/10">
                <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-primary/5 rounded-lg text-primary">
                        <Globe className="w-4 h-4" />
                    </span>
                    <h2 id="indexing-heading" className="m-0 text-lg font-bold text-foreground">
                        Indexing & Digital Repositories
                    </h2>
                </div>
                <Link
                    href="/indexing"
                    className="text-xs font-bold text-primary hover:text-secondary transition-colors inline-flex items-center gap-1"
                >
                    <span>View Roadmap & Details</span>
                    <Sparkles className="w-3.5 h-3.5 text-secondary" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 2xl:gap-3.5">
                {indexingAgencies.map((agency, i) => {
                    const Logo = agency.Component;
                    return (
                        <Card
                            key={i}
                            className="p-3 2xl:p-3.5 rounded-xl border border-border/60 bg-card hover:border-primary/30 transition-all flex flex-col justify-between group shadow-2xs space-y-2"
                        >
                            <div className="space-y-1.5">
                                <div className="h-9 flex items-center justify-start">
                                    <Logo className="h-6 sm:h-7 w-auto max-w-full object-contain" />
                                </div>
                                <div>
                                    <div className="flex items-center justify-between gap-1">
                                        <h3 className="group-hover:text-primary transition-colors m-0 text-xs font-semibold truncate">
                                            {agency.name}
                                        </h3>
                                        {agency.isVerified && (
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-meta text-muted-foreground m-0 truncate">
                                        {agency.role}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] 2xl:text-xs">
                                <span className={`font-medium truncate max-w-[120px] ${agency.isVerified ? 'text-emerald-700 font-semibold' : 'text-muted-foreground'}`}>
                                    {agency.status}
                                </span>
                                {agency.link && (
                                    <a
                                        href={agency.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary hover:text-secondary font-bold inline-flex items-center gap-0.5 shrink-0"
                                    >
                                        <span>Verify</span>
                                        <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                                    </a>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}

export default memo(HomeIndexingStrip);

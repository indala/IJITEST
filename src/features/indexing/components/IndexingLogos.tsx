export function CrossrefLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Crossref DOI">
            <g transform="translate(2, 4)">
                <polygon points="0,10 18,0 24,12 6,22" fill="#E5B32E" />
                <polygon points="6,22 24,12 30,24 12,34" fill="#D95328" />
                <polygon points="0,24 18,14 24,26 6,36" fill="#30919C" />
                <polygon points="6,36 24,26 30,38 12,48" fill="#22374E" />
            </g>
            <text x="42" y="28" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="800" fill="#22374E" letterSpacing="-0.5">
                Crossref
            </text>
            <g transform="translate(132, 10)">
                <circle cx="14" cy="14" r="14" fill="#E5A31E" />
                <text x="14" y="19" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
                    doi
                </text>
            </g>
        </svg>
    );
}

export function IssnLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="ISSN International Centre">
            <text x="2" y="32" fontFamily="Arial Black, Impact, sans-serif" fontSize="32" fontWeight="900" fill="#7A1526" letterSpacing="1">
                ISSN
            </text>
            <g transform="translate(98, 12)" fill="#4A4A4A" fontFamily="system-ui, sans-serif" fontSize="6" fontWeight="700" letterSpacing="0.4">
                <text x="0" y="6">INTERNATIONAL</text>
                <text x="0" y="13">STANDARD SERIAL NUMBER</text>
                <text x="0" y="20">INTERNATIONAL CENTRE</text>
            </g>
        </svg>
    );
}

export function GoogleScholarLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 190 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Google Scholar">
            <text x="2" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700">
                <tspan fill="#4285F4">G</tspan>
                <tspan fill="#EA4335">o</tspan>
                <tspan fill="#FBBC05">o</tspan>
                <tspan fill="#4285F4">g</tspan>
                <tspan fill="#34A853">l</tspan>
                <tspan fill="#EA4335">e</tspan>
            </text>
            <text x="84" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="400" fill="#5F6368">
                Scholar
            </text>
            <g transform="translate(160, 10)" fill="#4285F4">
                <path d="M12 2L1 8l11 6 9-4.91V15h2V8L12 2z M5 12.18V17c0 2.76 3.13 5 7 5s7-2.24 7-5v-4.82l-7 3.82-7-3.82z" />
            </g>
        </svg>
    );
}

export function ZenodoLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 190 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="Zenodo Open Science">
            <g transform="translate(2, 10)">
                <circle cx="14" cy="14" r="14" fill="#E5A31E" />
                <text x="14" y="19" fontFamily="system-ui, -apple-system, sans-serif" fontSize="12" fontWeight="900" fill="#FFFFFF" textAnchor="middle">
                    doi
                </text>
            </g>
            <g transform="translate(40, 6)">
                <rect width="145" height="36" rx="6" fill="#1B6AC9" />
                <text x="72" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="700" fill="#FFFFFF" textAnchor="middle" letterSpacing="-0.5">
                    zenodo
                </text>
            </g>
        </svg>
    );
}

export function CiteSeerXLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 180 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="CiteSeerX">
            <text x="4" y="32" fontFamily="system-ui, -apple-system, sans-serif" fontSize="26" fontWeight="700" fill="#1E7B9E" letterSpacing="-0.5">
                CiteSeer
                <tspan fontSize="20" dy="-10" fontWeight="900" fill="#0F4C63">x</tspan>
            </text>
        </svg>
    );
}

export function DoajLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 170 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="DOAJ">
            <g transform="translate(4, 10)" stroke="#EE7324" strokeWidth="4" strokeLinecap="round">
                <path d="M2 24 A16 16 0 0 1 2 4" />
                <path d="M10 24 A11 11 0 0 1 10 7" />
                <path d="M18 24 A6 6 0 0 1 18 10" />
            </g>
            <text x="34" y="32" fontFamily="Arial Black, system-ui, sans-serif" fontSize="28" fontWeight="900" fill="#222222" letterSpacing="0.5">
                DOAJ
            </text>
        </svg>
    );
}

export function CiteFactorLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="CiteFactor">
            <g transform="translate(18, 24)" fill="#1B8AC9">
                <circle cx="0" cy="-14" r="2.8" />
                <circle cx="10" cy="-10" r="2.6" />
                <circle cx="14" cy="0" r="2.4" />
                <circle cx="10" cy="10" r="2.2" />
                <circle cx="0" cy="14" r="2.0" />
                <circle cx="-10" cy="10" r="1.8" />
                <circle cx="-14" cy="0" r="1.6" />
                <circle cx="-10" cy="-10" r="1.4" />
                <circle cx="-5" cy="-5" r="2.0" fill="#0D5075" />
                <circle cx="5" cy="5" r="2.0" fill="#0D5075" />
            </g>
            <g transform="translate(42, 0)">
                <text x="0" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="800" fill="#2C5282" letterSpacing="-0.5">
                    CiteFactor
                </text>
                <text x="0" y="37" fontFamily="system-ui, sans-serif" fontSize="7" fontWeight="600" fill="#718096" letterSpacing="0.2">
                    Academic Scientific Journals
                </text>
            </g>
        </svg>
    );
}

export function OpenAireLogo({ className = "h-7 w-auto" }: { className?: string }) {
    return (
        <svg viewBox="0 0 220 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-label="OpenAIRE EXPLORE">
            <text x="4" y="30" fontFamily="system-ui, -apple-system, sans-serif" fontSize="22" fontWeight="800" fill="#1B65A4" letterSpacing="-0.5">
                OpenAIRE
            </text>
            <line x1="124" y1="10" x2="124" y2="36" stroke="#CBD5E0" strokeWidth="1.5" />
            <text x="134" y="30" fontFamily="system-ui, -apple-system, sans-serif" fontSize="16" fontWeight="700" fill="#D97706" letterSpacing="1.5">
                EXPLORE
            </text>
        </svg>
    );
}

export const INDEXING_PARTNERS = [
    {
        name: "Crossref",
        Component: CrossrefLogo,
        category: "Digital Object Identifiers",
        status: "Active Registration",
        link: "https://www.crossref.org",
        verified: true
    },
    {
        name: "ISSN International Centre",
        Component: IssnLogo,
        category: "UNESCO Serial Directory",
        status: "E-ISSN: 3139-6887",
        link: "https://road.issn.org",
        verified: true
    },
    {
        name: "Google Scholar",
        Component: GoogleScholarLogo,
        category: "Citation Index & Discovery",
        status: "Automated Metadata",
        verified: true
    },
    {
        name: "Zenodo (CERN)",
        Component: ZenodoLogo,
        category: "Open Science Repository",
        status: "Community Archive",
        link: "https://zenodo.org/communities/ijitest/records?q=&l=list&p=1&s=10&sort=newest",
        verified: true
    },
    {
        name: "CiteSeerX",
        Component: CiteSeerXLogo,
        category: "Computer & Information Science",
        status: "Metadata Disclosed",
        verified: true
    },
    {
        name: "DOAJ",
        Component: DoajLogo,
        category: "Directory of Open Access Journals",
        status: "Evaluation In Progress",
        link: "https://doaj.org",
        verified: false
    },
    {
        name: "CiteFactor",
        Component: CiteFactorLogo,
        category: "Academic Scientific Journals",
        status: "Indexed Partner",
        link: "https://www.citefactor.org",
        verified: false
    },
    {
        name: "OpenAIRE EXPLORE",
        Component: OpenAireLogo,
        category: "European Research Infrastructure",
        status: "Verified Record",
        link: "https://explore.openaire.eu/search/result?pid=10.5281%2Fzenodo.22016453",
        verified: true
    }
];

export function NowIndexingGrid() {
    return (
        <div className="bg-card border border-border/70 rounded-2xl p-4 sm:p-6 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/50">
                <div>
                    <span className="text-meta uppercase font-bold text-primary tracking-wider">Global Indexing Portfolio</span>
                    <h3 className="text-lg font-bold text-foreground m-0">Now Indexing & Digital Repositories</h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full w-fit">
                    ● Active Indexing & Discovery
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {INDEXING_PARTNERS.map((partner) => {
                    const Logo = partner.Component;
                    const cardContent = (
                        <div className="h-20 sm:h-24 p-3 bg-muted/20 hover:bg-muted/40 border border-border/60 hover:border-primary/30 rounded-xl transition-all flex flex-col items-center justify-center text-center group">
                            <Logo className="h-8 sm:h-9 w-auto max-w-full object-contain transition-transform group-hover:scale-105" />
                            <span className="text-[10px] text-muted-foreground mt-1.5 line-clamp-1 font-medium">{partner.name}</span>
                        </div>
                    );

                    return partner.link ? (
                        <a key={partner.name} href={partner.link} target="_blank" rel="noopener noreferrer" className="block cursor-pointer">
                            {cardContent}
                        </a>
                    ) : (
                        <div key={partner.name}>{cardContent}</div>
                    );
                })}
            </div>

            <div className="pt-2 flex items-center justify-between text-meta text-muted-foreground border-t border-border/40">
                <span>Published under Felix Academic Publications</span>
                <span className="text-primary font-medium">Open Access Infrastructure</span>
            </div>
        </div>
    );
}

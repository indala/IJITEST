import type { JournalSettings } from '@/db/types';

interface TopBarDynamicProps {
    settings: JournalSettings;
}

export function TopBarDynamic({ settings }: TopBarDynamicProps) {
    const { journalName, issnNumber, publisherName } = settings;
    const formattedIssn = issnNumber || '3139-6887';
    const issnDisplay = formattedIssn.toLowerCase().includes('(online)') 
        ? formattedIssn 
        : `${formattedIssn} (Online)`;

    return (
        <div className="container-responsive max-w-7xl mx-auto py-1">
            {/* Top Bar Layout: Title in Center, ISSN pinned to Top-Most Right */}
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Left placeholder for symmetric balance on desktop */}
                <div className="hidden lg:flex items-center gap-2 text-xs xl:text-sm font-semibold tracking-wider text-white/80">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Open Access Journal</span>
                </div>

                {/* Center: Journal Name */}
                <div className="text-center flex-1 px-2">
                    <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-2xl font-serif font-bold text-white tracking-wide leading-snug drop-shadow-sm m-0">
                        {journalName}
                    </h1>
                </div>

                {/* Top-Most Right: ISSN Badge (as required by ISSN standard & letter) */}
                <div className="shrink-0 flex items-center justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 shadow-sm backdrop-blur-sm transition-all">
                        <span className="text-[10px] sm:text-xs font-black tracking-widest text-secondary uppercase bg-white px-1.5 py-0.5 rounded font-mono">
                            ISSN
                        </span>
                        <span className="text-xs sm:text-sm font-mono font-bold text-white tracking-wider">
                            {issnDisplay}
                        </span>
                    </div>
                </div>
            </div>

            {/* Sub-strip Metadata (Publisher & Access Model) */}
            <div className="mt-2 pt-2 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-[11px] sm:text-xs font-medium tracking-wider text-white/80">
                <div className="flex items-center gap-2">
                    <span className="text-white/60 uppercase font-semibold">Published By:</span>
                    <span className="text-white font-bold">{publisherName}</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-secondary/80" />
                <div className="flex items-center gap-2">
                    <span className="text-white/60 uppercase font-semibold">E-ISSN:</span>
                    <span className="text-white font-mono font-bold">{formattedIssn.replace(/\s*\(online\)/i, '')}</span>
                </div>
                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-secondary/80" />
                <div className="flex items-center gap-1.5 text-white/90">
                    <span className="text-emerald-300 font-semibold">Gold Open Access</span>
                    <span>• Rapid Peer Review</span>
                </div>
            </div>
        </div>
    );
}

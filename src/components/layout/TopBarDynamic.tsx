import type { JournalSettings } from '@/db/types';

interface TopBarDynamicProps {
    settings: JournalSettings;
}

export function TopBarDynamic({ settings }: TopBarDynamicProps) {
    const { journalName, issnNumber, publisherName } = settings;
    const cleanIssn = (issnNumber || '3139-6887').replace(/\s*\(online\)/i, '').trim();

    return (
        <div className="container-responsive 2xl:max-w-screen-2xl mx-auto py-1">
            <div className="flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-4 2xl:gap-6">
                {/* Left: Scholarly Status */}
                <div className="hidden lg:flex items-center gap-2 text-xs 2xl:text-sm font-medium text-white/80 shrink-0">
                    <span className="inline-block w-2 h-2 2xl:w-2.5 2xl:h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Peer-Reviewed Open Access</span>
                </div>

                {/* Center: Journal Full Title & Publisher Attribution */}
                <div className="text-center flex-1 px-2">
                    <h1 className="text-white text-xs sm:text-sm md:text-base 2xl:text-lg m-0 tracking-wide">
                        {journalName}
                    </h1>
                    {publisherName && (
                        <p className="text-[11px] sm:text-xs 2xl:text-sm text-white/70 font-medium tracking-wide m-0 mt-0.5">
                            Published by <span className="text-white font-semibold">{publisherName}</span>
                        </p>
                    )}
                </div>

                {/* Top-Most Right: Official E-ISSN Badge */}
                <div className="shrink-0 flex items-center justify-center">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 2xl:px-4 2xl:py-1.5 rounded-lg bg-white/10 border border-white/20 shadow-xs backdrop-blur-xs">
                        <span className="text-[10px] 2xl:text-xs font-black tracking-widest text-secondary uppercase bg-white px-1.5 py-0.5 rounded font-mono">
                            E-ISSN
                        </span>
                        <span className="text-xs sm:text-sm 2xl:text-base font-mono font-bold text-white tracking-wider">
                            {cleanIssn} (Online)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

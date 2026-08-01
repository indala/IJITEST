import type { JournalSettings } from '@/db/types';

interface TopBarDynamicProps {
    settings: JournalSettings;
}

export function TopBarDynamic({ settings }: TopBarDynamicProps) {
    const { journalName, issnNumber, publisherName } = settings;

    return (
        <div className="flex flex-col items-center text-center space-y-3">
            {/* Journal Name */}
            <div className="text-lg md:text-xl lg:text-2xl xl:text-2xl 2xl:text-3xl tracking-wider text-white font-mono font-bold">
                {journalName}
            </div>

            {/* Metadata strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-2 md:gap-x-10 2xl:gap-x-12 gap-y-3 text-xs md:text-sm 2xl:text-base font-bold tracking-[0.2em]">
                <div className="flex items-center gap-2.5">
                    <span className="text-white">ISSN:</span>
                    <span className="text-white/80">
                        {issnNumber}{issnNumber && !issnNumber.toLowerCase().includes('(online)') ? ' (online)' : ''}
                    </span>
                </div>

                <div className="hidden md:block w-2 h-2 rounded-full bg-secondary" />

                <div className="flex items-center gap-0 md:gap-2.5">
                    <span className="text-white">PUBLISHED BY:</span>
                    <span className="text-white">{publisherName}</span>
                </div>

                <div className="hidden md:block w-2 h-2 rounded-full bg-secondary" />

                <div className="flex items-center gap-2.5">
                    <span className="text-white/80">OPEN ACCESS PEER-REVIEWED JOURNAL</span>
                </div>
            </div>
        </div>
    );
}

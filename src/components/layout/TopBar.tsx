import Link from 'next/link';
import Image from 'next/image';

export default function TopBar({ settings }: { settings?: Record<string, string> }) {
    const journalName = settings?.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const issn = settings?.issn_number || "XXXX-XXXX (ONLINE)";
    const publisher = settings?.publisher_name || "FELIX ACADEMIC PUBLICATIONS";

    return (
        <div className="bg-blue-700 text-white py-6 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">

                {/* Title Column */}
                <div className="flex flex-col items-center lg:items-start space-y-2 text-center lg:text-left">
                    <div className="space-y-1">
                        <h1 className="text-lg md:text-xl lg:text-3xl font-sans font-black tracking-tight text-white leading-tight uppercase">
                            {journalName}
                        </h1>
                        <p className="text-[10px] md:text-xs font-bold text-blue-100 uppercase tracking-[0.3em]">
                            An International Peer-Reviewed Open Access Journal
                        </p>
                    </div>
                </div>

                {/* Metadata Strip */}
                <div className="flex flex-col items-center lg:items-end gap-3 lg:text-right">
                    <div className="text-[9px] md:text-[10px] font-bold text-blue-200 uppercase tracking-[0.2em]">
                        Published by <span className="text-white">{publisher}</span>
                    </div>
                    <div className="text-[8px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                        Engineering | Science | Technology | Management
                    </div>
                </div>
            </div>
        </div>
    );
}

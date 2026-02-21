import Link from 'next/link';
import Image from 'next/image';

export default function TopBar({ settings }: { settings?: Record<string, string> }) {
    const journalName = settings?.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const issn = settings?.issn_number || "XXXX-XXXX (ONLINE)";
    const publisher = settings?.publisher_name || "FELIX ACADEMIC PUBLICATIONS";

    return (
        <div className="bg-primary text-white py-8 px-2 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-secondary/10 to-transparent pointer-events-none blur-3xl opacity-50" />

            <div className="max-w-[1600px] mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex flex-col items-center lg:items-start space-y-3 text-center lg:text-left max-w-4xl">
                    <div className="space-y-1.5">
                        <h1 className="text-xl sm:text-2xl lg:text-4xl font-sans font-black tracking-normal text-white leading-[1.1] uppercase drop-shadow-md">
                            {journalName}
                        </h1>
                        <p className="text-[12px] md:text-xs font-bold text-secondary tracking-[0.25em] uppercase opacity-90">
                            An International Peer-Reviewed Open Access Journal
                        </p>
                    </div>
                </div>

                {/* Info Strip */}
                <div className="flex flex-col items-center lg:items-end gap-3 lg:text-right shrink-0">
                    <div className="text-[10px] sm:text-[11px] font-bold text-white/60 uppercase tracking-[0.2em]">
                        Published by <span className="text-white font-black">{publisher}</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[7px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                            <div className=" bg-emerald-400 rounded-full animate-pulse" />
                            ENGINEERING | SCIENCE | TECHNOLOGY
                        </div>
                        <div className="text-[10px] font-black text-white/40 tracking-[0.2em]">
                            ISSN: {issn}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
import { MousePointer2 } from 'lucide-react';

export default function TopBar({ settings }: { settings?: Record<string, string> }) {
    const journalName = settings?.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const issn = settings?.issn_number || "XXXX-XXXX (ONLINE)";
    const publisher = settings?.publisher_name || "FELIX ACADEMIC PUBLICATIONS";

    return (
        <div className="bg-blue-700 text-white py-4 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="flex flex-col items-center text-center space-y-3">
                    {/* Primary Title */}
                    <h1 className="text-lg md:text-xl lg:text-2xl font-sans font-black tracking-wide text-white leading-tight">
                        {journalName}
                    </h1>

                    {/* Journal Metadata Strip */}
                    <div className="flex flex-wrap items-center justify-center gap-x-6 md:gap-x-10 gap-y-3 text-xs md:text-sm font-bold uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2.5">
                            <span className="text-white/80">ISSN:</span>
                            <span className="text-white/80">{issn}</span>
                        </div>

                        <div className="hidden md:block w-2 h-2 rounded-full bg-red-500" />

                        <div className="flex items-center gap-2.5">
                            <span className="text-white/80">PUBLISHED BY:</span>
                            <span className="text-white/80">{publisher}</span>
                        </div>

                        <div className="hidden md:block w-2 h-2 rounded-full bg-red-500" />

                        <div className="flex items-center gap-2.5">
                            <span className="text-white/80">OPEN ACCESS PEER-REVIEWED JOURNAL</span>
                        </div>
                    </div>
                </div>

                {/* Optional: Keep the Track link as a floating-style element or integrated */}
                <div className="mt-6 flex justify-center lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:mt-0">
                </div>
            </div>
        </div>
    );
}

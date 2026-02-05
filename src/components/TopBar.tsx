"use client";

export default function TopBar() {
    return (
        <div className="bg-[#1e293b] py-3 md:py-3 border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center gap-1.5 md:gap-2">
                    <h2 className="text-white text-sm md:text-base font-serif font-black tracking-tight italic leading-tight">
                        International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)
                    </h2>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:gap-8 text-[8px] md:text-[9px] font-medium uppercase tracking-[0.2em] md:tracking-[0.4em] text-secondary/90">
                        <div className="flex items-center gap-1.5">
                            <span className="opacity-60 font-black">ISSN:</span>
                            <span className="text-white/90">3048-8168 (Online)</span>
                        </div>
                        <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full" />
                        <div className="flex items-center gap-1.5">
                            <span className="opacity-60 font-black">Published By:</span>
                            <span className="text-white/90">Felix Academic Publications</span>
                        </div>
                        <span className="hidden md:block w-1 h-1 bg-white/10 rounded-full" />
                        <div className="flex items-center gap-1.5 text-white/50">
                            <span>Open Access Peer-Reviewed Journal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

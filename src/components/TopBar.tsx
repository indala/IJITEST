"use client";

export default function TopBar() {
    return (
        <div className="bg-[#1e293b] py-3 border-b border-white/5 hidden md:block">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center text-center gap-1.5">
                    <h2 className="text-white text-base font-serif font-black tracking-tight italic">
                        International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)
                    </h2>
                    <div className="flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.4em] text-secondary/90">
                        <div className="flex items-center gap-2">
                            <span className="opacity-50">ISSN:</span>
                            <span>3048-8168 (Online)</span>
                        </div>
                        <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <div className="flex items-center gap-2">
                            <span className="opacity-50">Published By:</span>
                            <span>Felix Academic Publications</span>
                        </div>
                        <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                        <div className="flex items-center gap-2 text-white/50">
                            <span>Open Access Peer-Reviewed Journal</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

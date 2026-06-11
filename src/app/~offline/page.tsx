"use client";

import { WifiOff, RefreshCw } from "lucide-react";

export default function OfflinePage() {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-radial from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-4 transition-colors">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-2xl p-8 text-center shadow-xl overflow-hidden">
        {/* Subtle top decoration bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#000066]" />

        {/* Outer pulsating circle */}
        <div className="mx-auto w-24 h-24 rounded-full bg-[#000066]/5 dark:bg-[#000066]/10 flex items-center justify-center mb-6 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-[#000066]/10 dark:bg-[#000066]/20 flex items-center justify-center">
            <WifiOff className="w-8 h-8 text-[#000066]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight mb-2">
          Connectivity Lost
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
          The requested page could not be loaded. Please check your internet connection and try reloading the interface.
        </p>

        <button
          onClick={handleReload}
          className="w-full h-12 bg-[#000066] hover:bg-[#000066]/90 text-white font-semibold text-xs tracking-wider uppercase rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Connection</span>
        </button>

        <div className="mt-6 text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-widest font-medium">
          IJITEST Academic Portal
        </div>
      </div>
    </main>
  );
}

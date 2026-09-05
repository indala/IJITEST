import { Megaphone, ChevronRight, Sparkles } from "lucide-react";
import Link from "next/link";
import type { PublishedPaperUI } from "@/db/types";

interface AnnouncementBarProps {
    latestPaper?: PublishedPaperUI | null | undefined;
}

export default function AnnouncementBar({ latestPaper }: AnnouncementBarProps) {
    if (!latestPaper) return null;
    const publishDate = latestPaper.publishedAt ? new Date(latestPaper.publishedAt) : new Date();
    const monthYear = publishDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    });

    return (
        <div className="bg-primary overflow-hidden relative group/bar border-b border-white/10">
            {/* Animated Background Pulse */}
            <div className="absolute inset-0 bg-linear-to-r from-primary via-primary-dark to-primary opacity-50 animate-shimmer pointer-events-none" />

            <div className="container-responsive relative z-10 py-3 2xl:py-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 2xl:gap-8 text-center sm:text-left transition-all duration-500">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-full bg-white/10 flex items-center justify-center text-secondary border border-white/20 animate-pulse">
                        <Megaphone className="size-5 2xl:size-6" />
                    </div>
                    <p className="text-white/80 m-0 flex items-center gap-2">
                        Latest Publication <span className="text-orange-600 font-bold">:</span> <span className="text-white pl-1 sparkle-text">{monthYear} Issue Now Live</span>
                        <Sparkles className="size-6 text-red-600 animate-bounce" />
                    </p>
                </div>
                
                <div className="h-4 w-px bg-white/20 hidden sm:block" />

                <Link 
                    href="/current-issue" 
                    className="group/link flex items-center gap-2 text-white/90 hover:text-white transition-colors py-1 px-4 2xl:py-1.5 2xl:px-5 text-xs 2xl:text-sm rounded-full bg-white/5 border border-white/10 hover:bg-white/10 no-underline"
                >
                    View All Articles
                    <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                </Link>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 10s linear infinite;
                }
                .sparkle-text {
                    text-shadow: 0 0 10px rgba(var(--secondary), 0.5);
                }
            `}</style>
        </div>
    );
}

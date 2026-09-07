export function AnnouncementBarSkeleton() {
    return (
        <div className="h-9 w-full bg-primary/90 flex items-center justify-center px-4">
            <div className="h-3.5 w-72 bg-white/20 rounded-full animate-pulse" />
        </div>
    );
}

export function AnnouncementsWidgetSkeleton() {
    return (
        <div className="bg-card p-4 rounded-xl border border-border/70 space-y-3 animate-pulse">
            <div className="h-4 w-36 bg-muted/60 rounded" />
            <div className="h-3 w-full bg-muted/40 rounded" />
            <div className="h-3 w-4/5 bg-muted/40 rounded" />
        </div>
    );
}

export function HomeCurrentIssueSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-primary/10">
                <div className="space-y-1.5">
                    <div className="h-6 w-64 bg-muted/60 rounded-md" />
                    <div className="h-4 w-48 bg-muted/40 rounded-md" />
                </div>
                <div className="h-7 w-28 bg-muted/40 rounded-full" />
            </div>

            {/* Papers List Cards */}
            <div className="grid grid-cols-1 gap-3">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 sm:p-5 rounded-xl border border-border/60 bg-card/60 space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-20 bg-primary/10 rounded" />
                            <div className="h-4 w-28 bg-muted/50 rounded" />
                        </div>
                        <div className="h-5 w-4/5 bg-muted/60 rounded" />
                        <div className="h-3.5 w-2/3 bg-muted/40 rounded" />
                        <div className="pt-2 flex items-center justify-between border-t border-border/40">
                            <div className="h-3.5 w-32 bg-muted/30 rounded" />
                            <div className="h-8 w-24 bg-muted/40 rounded-lg" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function AnnouncementBarSkeleton() {
    return (
        <div className="h-9 w-full bg-primary/90 flex items-center justify-center px-4">
            <div className="h-3.5 w-72 bg-white/20 rounded-full animate-pulse" />
        </div>
    );
}

export function AnnouncementsWidgetSkeleton() {
    return (
        <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 space-y-3 2xl:space-y-4 shadow-2xs animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-muted/60 shrink-0" />
                    <div className="h-4 w-28 bg-muted/60 rounded" />
                </div>
                <div className="h-5 w-12 bg-muted/40 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-border/40 bg-muted/30 space-y-1.5">
                    <div className="flex justify-between">
                        <div className="h-3 w-16 bg-muted/50 rounded" />
                        <div className="h-3 w-12 bg-muted/40 rounded" />
                    </div>
                    <div className="h-4 w-4/5 bg-muted/60 rounded" />
                </div>
                <div className="p-2.5 rounded-lg border border-border/40 bg-muted/30 space-y-1.5">
                    <div className="flex justify-between">
                        <div className="h-3 w-16 bg-muted/50 rounded" />
                        <div className="h-3 w-12 bg-muted/40 rounded" />
                    </div>
                    <div className="h-4 w-3/5 bg-muted/60 rounded" />
                </div>
            </div>
        </div>
    );
}

import { Card, CardContent } from "@/components/ui/card";

export function DashboardStatsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-pulse">
            {[...Array(count)].map((_, i) => (
                <Card key={i} className="border-border/70 shadow-2xs bg-card rounded-xl">
                    <CardContent className="p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-lg bg-muted/60" />
                        </div>
                        <div className="space-y-1.5">
                            <div className="h-3 w-16 bg-muted/40 rounded" />
                            <div className="h-7 w-24 bg-muted/60 rounded" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function DashboardSubmissionsSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="space-y-3 animate-pulse">
            <div className="p-4 rounded-xl border border-border/70 bg-card space-y-3">
                <div className="h-5 w-40 bg-muted/60 rounded" />
                <div className="space-y-2.5">
                    {[...Array(count)].map((_, i) => (
                        <div key={i} className="p-3 rounded-lg border border-border/40 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-24 bg-primary/10 rounded" />
                                    <div className="h-4 w-16 bg-muted/50 rounded-full" />
                                </div>
                                <div className="h-4 w-3/4 bg-muted/60 rounded" />
                            </div>
                            <div className="h-8 w-20 bg-muted/40 rounded-lg shrink-0" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export function DashboardHealthSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-pulse">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/70 bg-card space-y-2">
                    <div className="flex items-center justify-between">
                        <div className="h-3.5 w-20 bg-muted/50 rounded" />
                        <div className="h-4 w-14 bg-muted/40 rounded-full" />
                    </div>
                    <div className="h-6 w-24 bg-muted/70 rounded" />
                </div>
            ))}
        </div>
    );
}

export function DashboardListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-2.5 animate-pulse">
            {[...Array(count)].map((_, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/60 bg-card/60 flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="h-4 w-32 bg-muted/60 rounded" />
                        <div className="h-3 w-44 bg-muted/40 rounded" />
                    </div>
                    <div className="h-7 w-16 bg-muted/40 rounded-lg" />
                </div>
            ))}
        </div>
    );
}

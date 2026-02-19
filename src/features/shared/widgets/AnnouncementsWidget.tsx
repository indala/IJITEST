import { Newspaper } from 'lucide-react';
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

function AnnouncementsWidget() {
    return (
        <Card className="border-border/50 shadow-md overflow-hidden">
            <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-secondary" />
                    <CardTitle className="text-base font-black">Announcements</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4 text-justify">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Badge variant="outline" className="text-[8px] h-4 font-black uppercase text-primary border-primary/20 bg-primary/5 mb-1">Call for Papers</Badge>
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                        IJITEST invites original research articles for the upcoming Volume 1 (2026).
                    </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <Badge variant="outline" className="text-[8px] h-4 font-black uppercase text-secondary border-secondary/20 bg-secondary/5 mb-1">Impact</Badge>
                    <p className="text-xs font-bold text-slate-700 leading-tight">
                        CrossRef DOI assigned to all published articles.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(AnnouncementsWidget);

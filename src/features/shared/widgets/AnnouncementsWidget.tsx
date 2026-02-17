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
            <CardContent className="p-5 pt-4 space-y-4">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100/50">
                    <Badge variant="outline" className="text-[8px] h-4 font-black uppercase text-emerald-600 border-emerald-200 bg-emerald-50/50 mb-1">Latest Update</Badge>
                    <p className="text-xs font-bold text-gray-900 leading-tight">
                        Now accepting manuscripts for Volume 1, Issue 1 (2026).
                    </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100/50">
                    <Badge variant="outline" className="text-[8px] h-4 font-black uppercase text-blue-600 border-blue-200 bg-blue-50/50 mb-1">Indexing Update</Badge>
                    <p className="text-xs font-bold text-gray-900 leading-tight">Rolling submissions with continuous online publication.</p>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(AnnouncementsWidget);

import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function CallForPapersWidget() {
    return (
        <Card className="bg-primary border-none text-white shadow-lg overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <CardHeader className="p-5 pb-0">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-secondary group-hover:rotate-12 transition-transform" />
                    <CardTitle className="text-base font-black text-white">Call for Papers</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-5 pt-3 space-y-4">
                <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                    Rolling submissions with continuous online publication. Send manuscripts to: <span className="text-secondary font-black">editor@ijitest.org</span>
                </p>
                <Button asChild variant="secondary" className="w-full h-9 p-0 bg-white/10 border border-white/20 hover:bg-white/20 text-white font-black text-[10px] uppercase tracking-widest">
                    <Link href="/submit" className="flex items-center justify-between px-4 w-full">
                        <span>Submit Now</span>
                        <ChevronRight className="w-3.5 h-3.5 text-secondary" />
                    </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

export default memo(CallForPapersWidget);

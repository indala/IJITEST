"use client";

import { Search } from 'lucide-react';
import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function TrackManuscriptWidget() {
    const [paperId, setPaperId] = useState('');
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (paperId.trim()) {
            router.push(`/track?id=${paperId}`);
        }
    };

    return (
        <Card className="border-border/50 shadow-md">
            <CardHeader className="p-5 pb-0">
                <CardTitle className="text-base font-black text-foreground">Track Your Paper</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-4">
                <form onSubmit={handleTrack} className="space-y-3">
                    <Input
                        type="text"
                        placeholder="Manuscript ID"
                        value={paperId}
                        onChange={(e) => setPaperId(e.target.value)}
                        className="bg-muted/30 border-border/50 font-bold"
                    />
                    <Button type="submit" className="w-full font-black text-[10px] uppercase tracking-widest gap-2">
                        <Search className="w-3.5 h-3.5" /> Track Manuscript
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

export default memo(TrackManuscriptWidget);

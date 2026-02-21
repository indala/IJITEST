"use client";

import { Search } from 'lucide-react';
import { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

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
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0 }}
        >
            <Card className="border-border/50 shadow-md hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="p-5 pb-0">
                    <CardTitle className="text-base font-black text-foreground group-hover:text-primary transition-colors duration-300">Track Your Paper</CardTitle>
                </CardHeader>
                <CardContent className="p-5 pt-4">
                    <form onSubmit={handleTrack} className="space-y-3">
                        <Input
                            type="text"
                            placeholder="Manuscript ID"
                            value={paperId}
                            onChange={(e) => setPaperId(e.target.value)}
                            className="bg-muted/30 border-border/50 font-bold focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <Button type="submit" className="w-full font-black text-[10px] uppercase tracking-widest gap-2 group-hover:bg-primary/90 transition-colors">
                            <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Track Manuscript
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(TrackManuscriptWidget);

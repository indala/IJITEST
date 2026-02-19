"use client";

import { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function CurrentIssueWidget() {
    const currentStatus = useMemo(() => {
        const now = new Date();
        const year = now.getFullYear();
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

        // Dynamic issue estimation for startup
        const issueNum = now.getMonth() + 1;
        const monthRange = `${monthNames[now.getMonth()]}`;

        return {
            volume: year - 2025, // Starting 2026 as Vol 1
            issue: issueNum,
            date: `${monthRange} ${year}`
        };
    }, []);

    return (
        <Card className="border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden bg-white group rounded-[2.5rem]">
            <CardHeader className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-secondary group-hover:text-white transition-colors duration-500">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">Current Issue</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-4 space-y-6">
                <div className="space-y-1.5 pl-2 border-l-4 border-secondary/30">
                    <div className="flex items-center gap-2">
                        <p className="text-[11px] font-black text-secondary uppercase tracking-[0.2em]">Volume {currentStatus.volume}</p>
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                        <p className="text-[11px] font-black text-secondary uppercase tracking-[0.2em]">Issue {currentStatus.issue}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{currentStatus.date}</p>
                </div>

                <div className="pt-2">
                    <Button asChild className="w-full h-14 bg-primary hover:bg-secondary text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-primary/20 transition-all duration-500">
                        <Link href="/archives" className="flex items-center justify-center gap-2">
                            <span>Open Articles</span>
                            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default memo(CurrentIssueWidget);

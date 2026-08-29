"use client";

import { memo, useMemo } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useLatestIssue } from '@/hooks/queries/usePublic';

function CurrentIssueWidget() {
    const { data: dbIssue, isLoading } = useLatestIssue();

    const currentStatus = useMemo(() => {
        if (dbIssue) {
            return {
                volume: dbIssue.volumeNumber,
                issue: dbIssue.issueNumber,
                date: `${dbIssue.monthRange} ${dbIssue.year}`
            };
        }

        return null;
    }, [dbIssue]);

    if (isLoading) return (
        <Card className="border border-primary/10 shadow-xl shadow-primary/5 overflow-hidden bg-primary/5 group rounded-[2.5rem]">
            <CardContent className="p-12 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary/20" />
            </CardContent>
        </Card>
    );

    if (!currentStatus) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <Card className="border border-border/70 bg-card rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-3 2xl:space-y-4 shadow-2xs">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                            <BookOpen className="w-4 h-4 2xl:w-5 2xl:h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-xs sm:text-sm 2xl:text-base font-bold text-primary m-0">Current Issue</CardTitle>
                            <p className="text-[10px] 2xl:text-xs text-muted-foreground m-0">{currentStatus.date}</p>
                        </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold text-[10px] 2xl:text-xs uppercase">
                        Vol {currentStatus.volume} · Iss {currentStatus.issue}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Button asChild size="sm" className="h-7 px-3 2xl:h-8 2xl:px-4 text-xs 2xl:text-sm bg-primary hover:bg-primary/90 rounded-md flex-1">
                        <Link href="/current-issue" className="flex items-center justify-center gap-1">
                            <span>View Issue</span>
                            <ChevronRight className="w-3 h-3" />
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="h-7 px-3 2xl:h-8 2xl:px-4 text-xs 2xl:text-sm border-primary/20 text-primary hover:bg-primary/5 rounded-md">
                        <Link href="/archives">Archives</Link>
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}

export default memo(CurrentIssueWidget);

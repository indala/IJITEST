"use client";

import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

function CallForPapersWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <Card className="bg-primary text-white border-none rounded-xl p-3.5 sm:p-4 2xl:p-5 space-y-2.5 2xl:space-y-3.5 shadow-md relative overflow-hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 2xl:w-10 2xl:h-10 rounded-lg bg-white/10 flex items-center justify-center text-secondary">
                        <MessageSquare className="w-4 h-4 2xl:w-5 2xl:h-5" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm 2xl:text-base font-bold text-white m-0">Call for Papers</CardTitle>
                </div>
                <p className="text-xs 2xl:text-sm text-white/80 leading-relaxed m-0">
                    Rolling monthly submissions with fast-track double-blind review. Open to all engineering disciplines.
                </p>
                <Button asChild size="sm" className="w-full h-8 2xl:h-9 text-xs 2xl:text-sm bg-secondary hover:bg-secondary/90 text-white font-bold rounded-lg">
                    <Link href="/submit" className="flex items-center justify-center gap-1">
                        <span>Submit Manuscript</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </Button>
            </Card>
        </motion.div>
    );
}

export default memo(CallForPapersWidget);

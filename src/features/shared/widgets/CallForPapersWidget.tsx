"use client";

import { MessageSquare, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';

function CallForPapersWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card className="bg-primary border-none text-white shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden relative group cursor-pointer">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-500" />
                <CardHeader className="p-5 pb-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={32} className="text-secondary group-hover:rotate-12 transition-transform animate-wiggle" />
                        <CardTitle className="text-base font-black text-white">Call for Papers</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-5 pt-3 space-y-4">
                    <p className="text-[11px] text-white/80 font-medium leading-relaxed">
                        Rolling submissions with continuous online publication. Ensure your research reaches the global audience through our elite peer-review process.
                    </p>
                    <Button asChild variant="secondary" className="w-full h-9 p-0 bg-white/10 border border-white/20 hover:bg-secondary hover:text-white transition-colors duration-300 text-white font-black text-[10px] uppercase tracking-widest group/btn">
                        <Link href="/submit" className="flex items-center justify-between px-4 w-full">
                            <span>Submit Now</span>
                            <ChevronRight className="w-3.5 h-3.5 text-secondary group-hover/btn:text-white transition-colors duration-300" />
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </motion.div>
    );
}

export default memo(CallForPapersWidget);

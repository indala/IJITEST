"use client";

import { motion } from 'framer-motion';
import { memo } from 'react';

const stats = [
    { label: "Commencement", value: "2026", color: "text-blue-600", dotColor: "bg-blue-600", delay: 0 },
    { label: "Frequency", value: "Monthly", color: "text-emerald-600", dotColor: "bg-emerald-600", delay: 0.1 },
    { label: "Journal Frequency", value: "Monthly (12 issues per year)", color: "text-amber-600", dotColor: "bg-amber-600", delay: 0.2 }
];

const CARD_DURATION = 3;
const TOTAL_CYCLE = stats.length * CARD_DURATION;

import { Card, CardContent } from "@/components/ui/card";





function HomeStats() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    whileHover={{ y: -6, transition: { duration: 0.3 } }}
                    className="h-full"
                >
                    <Card className="h-full border border-primary/5 bg-white shadow-vip hover:shadow-vip-hover transition-all duration-500 group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

                        <CardContent className="p-6 flex flex-col justify-between h-full relative z-10">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-3 group-hover:text-secondary transition-colors duration-500">
                                    {stat.label}
                                </p>
                                <p className={`text-2xl sm:text-3xl font-black text-primary tracking-tighter`}>
                                    {stat.value}
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-3">
                                <div className="h-1.5 w-12 bg-primary/10 rounded-full overflow-hidden">
                                    <motion.div
                                        animate={{ x: ["-100%", "100%"] }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                        className="h-full w-full bg-gradient-to-r from-secondary to-secondary/50"
                                    />
                                </div>
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            ))}
        </div>
    );
}

export default memo(HomeStats);
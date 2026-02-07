"use client";

import { motion } from 'framer-motion';
import { memo } from 'react';

const stats = [
    { label: "Commencement", value: "2026", color: "text-blue-600", dotColor: "bg-blue-600", delay: 0 },
    { label: "Frequency", value: "Monthly", color: "text-emerald-600", dotColor: "bg-emerald-600", delay: 0.1 },
    { label: "Journal Frequency", value: "Regularly", color: "text-amber-600", dotColor: "bg-amber-600", delay: 0.2 }
];

const CARD_DURATION = 3;
const TOTAL_CYCLE = stats.length * CARD_DURATION;

function HomeStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="group relative bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                >
                    {/* 1. THE SPHERE (Decorative Circle) - Sequenced Animation */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            backgroundColor: ["#f9fafb", "#fee2e2", "#f9fafb"], // Light gray to light red
                        }}
                        transition={{
                            duration: CARD_DURATION,
                            repeat: Infinity,
                            repeatDelay: TOTAL_CYCLE - CARD_DURATION,
                            delay: i * CARD_DURATION,
                        }}
                        className="absolute -right-4 -top-4 w-24 h-24 rounded-full z-0 transition-colors group-hover:bg-primary/10"
                    />

                    <div className="relative z-10">
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 group-hover:text-primary transition-colors">
                            {stat.label}
                        </p>

                        <p className={`text-4xl font-black ${stat.color} tracking-tight mb-8`}>
                            {stat.value}
                        </p>

                        <div className="flex items-center gap-3">
                            {/* 2. THE SEQUENTIAL LINE */}
                            <div className="relative h-[2px] w-12 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ x: ["-100%", "0%", "100%"] }}
                                    transition={{
                                        duration: CARD_DURATION,
                                        repeat: Infinity,
                                        repeatDelay: TOTAL_CYCLE - CARD_DURATION,
                                        delay: i * CARD_DURATION,
                                        ease: "linear"
                                    }}
                                    className="absolute inset-0 bg-red-500"
                                />
                                {/* Hover permanent line */}
                                <div className="absolute inset-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* 3. THE RED DOT (Pulsing and Scaling) */}
                            <div className="relative flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        backgroundColor: ["#e5e7eb", "#ef4444", "#e5e7eb"]
                                    }}
                                    transition={{
                                        duration: CARD_DURATION,
                                        repeat: Infinity,
                                        repeatDelay: TOTAL_CYCLE - CARD_DURATION,
                                        delay: i * CARD_DURATION,
                                    }}
                                    className="w-2.5 h-2.5 rounded-full z-10"
                                />
                                {/* Optional: Added a "ping" effect when active */}
                                <motion.span
                                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        repeatDelay: (TOTAL_CYCLE - 1), // Only pings when it's the active card
                                        delay: i * CARD_DURATION + (CARD_DURATION / 2)
                                    }}
                                    className="absolute w-2.5 h-2.5 bg-red-400 rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}

export default memo(HomeStats);
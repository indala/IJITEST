"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function HomeCarousel() {
    return (
        <section className="relative h-[300px] md:h-[450px] bg-slate-900 overflow-hidden">
            {/* Background Image with Subtle Scale */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    initial={{ scale: 1.05 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 10, ease: "linear" }}
                    className="absolute inset-0"
                >
                    <Image
                        src="/slides/slide1.jpeg"
                        alt="Journal Hero"
                        fill
                        priority
                        className="object-cover object-center opacity-40"
                        quality={90}
                    />
                </motion.div>
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-center">
                <div className="max-w-4xl space-y-6 md:space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-sans font-black text-white tracking-[0.05em] leading-[1.1] mb-6 drop-shadow-2xl">
                            International Journal of Innovative Trends in Engineering Science and Technology
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="flex flex-wrap items-center gap-4"
                    >
                        <Link
                            href="/submit"
                            className="px-8 py-3.5 rounded-xl bg-secondary text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-secondary/20 hover:scale-105 transition-transform"
                        >
                            Submit Manuscript
                        </Link>
                        <Link
                            href="/archives"
                            className="text-white/70 font-black text-[10px] uppercase tracking-[0.2em] border-b border-white/20 hover:border-white hover:text-white transition-all pb-1"
                        >
                            Explore Archives
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

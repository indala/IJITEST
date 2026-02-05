"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, GraduationCap, Globe, Zap, FileText } from 'lucide-react';
import Link from 'next/link';

const slides = [
    {
        title: "Advancing Global Innovation",
        subtitle: "Inaugural Volume 2026",
        desc: "IJITEST provides a high-impact platform for researchers to publish original work in Engineering, Science, and Technology.",
        icon: <GraduationCap className="w-12 h-12" />,
        cta: "Submit Manuscript",
        link: "/submit",
        image: "/slides/slide1.jpeg",
        overlay: "bg-black/40"
    },
    {
        title: "Rapid Peer Review",
        subtitle: "3-5 Day Decision Cycle",
        desc: "Our rigorous double-blind evaluation process ensures technical excellence with world-class publishing velocity.",
        icon: <Zap className="w-12 h-12 text-secondary" />,
        cta: "Review Process",
        link: "/peer-review",
        image: "/slides/slide2.jpg",
        overlay: "bg-black/50"
    },
    {
        title: "Global Scientific Reach",
        subtitle: "Permanent Digital Archiving",
        desc: "Indexed in major repositories to maximize the discoverability and long-term citation impact of your research.",
        icon: <Globe className="w-12 h-12" />,
        cta: "View Indexing",
        link: "/indexing",
        image: "/slides/slide3.jpg",
        overlay: "bg-black/40"
    }
];

export default function HomeCarousel() {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length);
        }, 8000);
        return () => clearInterval(timer);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % slides.length);
    const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative h-[500px] md:h-[650px] bg-gray-900 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Cinematic Zoom */}
                    <motion.div
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, ease: "linear" }}
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${slides[current].image})` }}
                    />

                    {/* Multi-layered Overlays */}
                    <div className={`absolute inset-0 ${slides[current].overlay} transition-colors duration-1000`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/40 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-center">
                        <div className="max-w-3xl space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-secondary font-black uppercase tracking-[0.4em] text-[9px] mb-6">
                                    <div className="w-1 h-1 bg-secondary rounded-full animate-pulse" />
                                    {slides[current].subtitle}
                                </span>
                                <h1 className="text-5xl md:text-8xl font-serif font-black text-white tracking-tighter leading-[0.9] mb-8 italic drop-shadow-2xl">
                                    {slides[current].title}
                                </h1>
                                <p className="text-white/80 text-lg md:text-xl max-w-xl font-medium leading-relaxed italic border-l-4 border-secondary/50 pl-8 drop-shadow-lg">
                                    {slides[current].desc}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-6"
                            >
                                <Link href={slides[current].link} className="group relative px-10 py-5 overflow-hidden rounded-2xl">
                                    <div className="absolute inset-0 bg-white transition-transform duration-500 group-hover:scale-105" />
                                    <span className="relative z-10 text-gray-900 font-black text-xs uppercase tracking-widest">{slides[current].cta}</span>
                                </Link>
                                <Link href="/archives" className="text-white/60 font-black text-[10px] uppercase tracking-widest border-b border-white/20 hover:border-white hover:text-white transition-all pb-1">
                                    Explore Archives
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination & Controls */}
            <div className="absolute bottom-12 left-0 right-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
                    <div className="flex gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1.5 transition-all duration-700 rounded-full ${i === current ? 'w-12 bg-secondary' : 'w-4 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-4">
                        <button onClick={prev} className="w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all group">
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <button onClick={next} className="w-14 h-14 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all group">
                            <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Floating Stats Indicator */}
            <div className="absolute top-1/2 right-12 -translate-y-1/2 hidden xl:block z-20">
                <div className="flex flex-col gap-12 text-right">
                    {[
                        { label: "Impact Factor", value: "TBA" },
                        { label: "Acceptance", value: "22%" },
                        { label: "Decision", value: "3-5 Days" }
                    ].map((stat, i) => (
                        <div key={i} className="group cursor-default">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] group-hover:text-secondary transition-colors">{stat.label}</p>
                            <p className="text-4xl font-serif font-black text-white/80 italic tracking-tighter group-hover:text-white transition-colors">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, GraduationCap, Globe, Zap, FileText } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

const slides = [
    {
        title: "Advancing Global Innovation",
        subtitle: "Inaugural Edition 2026",
        desc: "IJITEST provides a high-impact platform for researchers to publish original work in Engineering, Science, and Technology.",
        icon: <GraduationCap className="w-12 h-12" />,
        cta: "Submit Manuscript",
        link: "/submit",
        image: "/slides/slide1.jpeg",
        overlay: "bg-black/40"
    },
    {
        title: "Rapid Peer Review",
        subtitle: "Rigorous Peer Evaluation",
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
        <section className="relative h-[400px] md:h-[550px] bg-gray-900 overflow-hidden">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0"
                >
                    {/* Background Image with Cinematic Zoom and Responsive Positioning */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 10, ease: "linear" }}
                            className="absolute inset-0"
                        >
                            <Image
                                src={slides[current].image}
                                alt={slides[current].title}
                                fill
                                priority
                                className="object-cover object-center"
                                quality={90}
                            />
                        </motion.div>
                    </div>

                    {/* Multi-layered Overlays */}
                    <div className={`absolute inset-0 ${slides[current].overlay} transition-colors duration-1000`} />
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-transparent to-transparent" />

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-center">
                        <div className="max-w-3xl space-y-4 md:space-y-8 mt-4 md:mt-0">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/20 border border-secondary/30 rounded-full text-secondary font-black uppercase tracking-[0.4em] text-[8px] sm:text-[9px] mb-3 md:mb-6 italic">
                                    <div className="w-1 h-1 bg-secondary rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                                    {slides[current].subtitle}
                                </span>
                                <h1 className="text-2xl sm:text-4xl lg:text-7xl font-sans font-black text-white tracking-tighter leading-tight md:leading-[0.9] mb-4 md:mb-8 drop-shadow-2xl italic">
                                    {slides[current].title}
                                </h1>
                                <p className="text-white/80 text-xs sm:text-sm md:text-lg lg:text-xl max-w-xl font-medium leading-relaxed border-l-4 border-secondary/50 pl-4 md:pl-8 drop-shadow-lg line-clamp-3 md:line-clamp-none italic">
                                    {slides[current].desc}
                                </p>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6, duration: 0.8 }}
                                className="flex flex-wrap items-center gap-3 md:gap-6"
                            >
                                <Link href={slides[current].link} className="group relative px-6 md:px-10 py-3 md:py-5 overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-xl shadow-white/5 hover:scale-[1.02] transition-transform">
                                    <div className="absolute inset-0 bg-secondary transition-transform duration-500 scale-x-0 group-hover:scale-x-100 origin-left" />
                                    <span className="relative z-10 text-gray-900 group-hover:text-white transition-colors font-black text-[10px] md:text-xs uppercase tracking-widest italic">{slides[current].cta}</span>
                                </Link>
                                <Link href="/archives" className="text-white/60 font-black text-[9px] md:text-[10px] uppercase tracking-widest border-b border-white/20 hover:border-white hover:text-white transition-all pb-1 italic">
                                    Explore Archives
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination & Controls */}
            <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-end">
                    <div className="flex gap-2 md:gap-3">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`h-1 md:h-1.5 transition-all duration-700 rounded-full ${i === current ? 'w-8 md:w-12 bg-secondary shadow-[0_0_8px_rgba(239,68,68,0.5)]' : 'w-3 md:w-4 bg-white/20 hover:bg-white/40'}`}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2 md:gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={prev}
                            className="w-10 h-10 md:w-14 md:h-14 bg-white/5 border-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all group"
                        >
                            <ChevronLeft className="w-4 h-4 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={next}
                            className="w-10 h-10 md:w-14 md:h-14 bg-white/5 border-white/10 backdrop-blur-md rounded-xl md:rounded-2xl text-white hover:bg-secondary hover:border-secondary hover:text-white transition-all group"
                        >
                            <ChevronRight className="w-4 h-4 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>

        </section>
    );
}

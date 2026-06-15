"use client";

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

const TOP_TITLE = "International Journal of";
const BOTTOM_TITLE = 'Innovative Trends in Engineering Science and Technology'

export default function HomeCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slides = useMemo(() => [
        { id: 1, image: "/slides/slide1.jpeg" },
        { id: 2, image: "/slides/slide2.jpg" },
        { id: 3, image: "/slides/slide3.jpg" }
    ], []);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, [slides.length]);

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [nextSlide]);

    return (
        <section className="relative h-[300px] sm:h-[350px] lg:h-[400px] xl:h-[480px] 2xl:h-[600px] bg-slate-950 overflow-hidden">
            {/* Background Images Layer */}
            <div className="absolute inset-0">
                {slides.map((slide, index) => (
                    <motion.div
                        key={slide.id}
                        initial={index === 0 ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1 }}
                        animate={{ 
                            opacity: index === currentIndex ? 1 : 0,
                            scale: index === currentIndex ? 1.12 : 1
                        }}
                        transition={{ 
                            opacity: { duration: 1, ease: "easeInOut" },
                            scale: { duration: 8, ease: "linear" }
                        }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slide.image}
                            alt={`Journal Hero Slide ${index + 1}`}
                            fill
                            priority={index === 0}
                            className="object-cover object-center opacity-40"
                            quality={75}
                        />
                    </motion.div>
                ))}
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-slate-950/60 to-transparent z-10" />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-transparent z-10" />

            {/* Content Container */}
            <div className="container-responsive h-full relative z-20 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="max-w-5xl space-y-6 md:space-y-8"
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                        >
                            <h1 className=" leading-[1.1] mb-6 drop-shadow-2xl xl:text-4xl  text-white">
                                {TOP_TITLE}<br />{BOTTOM_TITLE}
                            </h1>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="flex flex-wrap items-center gap-6"
                        >
                            <motion.div
                                animate={{
                                    boxShadow: ["0px 0px 0px rgba(220,103,38,0)", "0px 10px 30px rgba(220,103,38,0.5)", "0px 0px 0px rgba(220,103,38,0)"]
                                }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="rounded-xl overflow-hidden"
                            >
                                <Link
                                    href="/submit"
                                    className="btn-secondary"
                                >
                                    Submit Manuscript
                                </Link>
                            </motion.div>
                            <Link
                                href="/archives"
                                className="btn-outline border-white/20 text-white hover:bg-white/10"
                            >
                                Explore Archives
                            </Link>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-3" role="tablist" aria-label="Carousel slides">
                {slides.map((_, idx) => (
                    <button
                        type="button"
                        key={idx}
                        role="tab"
                        {...{ "aria-selected": idx === currentIndex }}
                        aria-label={`Go to slide ${idx + 1}`}
                        tabIndex={0}
                        onClick={() => setCurrentIndex(idx)}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCurrentIndex(idx); } }}
                        className={cn(
                            "h-1 rounded-full transition-all duration-1000 cursor-pointer border-0 p-0",
                            idx === currentIndex ? "w-12 bg-secondary" : "w-6 bg-white/20"
                        )}
                    />
                ))}
            </div>
        </section>
    );
}


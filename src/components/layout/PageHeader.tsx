'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import { useRef, useEffect } from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: { name: string; href: string }[];
    scrollOnComplete?: boolean;
}

export default function PageHeader({ title, description, breadcrumbs, scrollOnComplete = true }: PageHeaderProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const animationRef = useRef<any>(null);

    useEffect(() => {
        const stopAnimation = () => {
            if (animationRef.current) {
                animationRef.current.stop();
                animationRef.current = null;
            }
        };

        window.addEventListener('wheel', stopAnimation, { passive: true });
        window.addEventListener('touchmove', stopAnimation, { passive: true });
        window.addEventListener('pointerdown', stopAnimation, { passive: true });

        return () => {
            window.removeEventListener('wheel', stopAnimation);
            window.removeEventListener('touchmove', stopAnimation);
            window.removeEventListener('pointerdown', stopAnimation);
            stopAnimation();
        };
    }, []);

    const handleAnimationComplete = () => {
        if (scrollOnComplete && sectionRef.current) {
            const sectionBottom =
                sectionRef.current.getBoundingClientRect().bottom + window.scrollY - 80;

            animationRef.current = animate(window.scrollY, sectionBottom, {
                duration: 1.2,
                ease: [0.32, 0.72, 0, 1],
                onUpdate: (latest) => window.scrollTo(0, latest),
            });
        }
    };


    return (
        <section ref={sectionRef} className="relative py-10 sm:py-14 bg-gradient-to-br from-primary via-primary/95 to-accent border-b border-white/5 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
            <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px]" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex items-center gap-2 mb-6"
                >
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Link
                                href={crumb.href}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 hover:text-white transition-all duration-300"
                            >
                                {crumb.name}
                            </Link>
                            {idx < breadcrumbs.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-secondary" />
                            )}
                        </div>
                    ))}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black text-white tracking-tighter mb-6 leading-[0.9]">
                            {title.split(' ').map((word, i) => (
                                <motion.span
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.1 + 0.2, duration: 0.5 }}
                                    className="inline-block mr-[0.2em]"
                                >
                                    <span className={i === title.split(' ').length - 1 ? "text-secondary decoration-white/20 underline underline-offset-8" : ""}>
                                        {word}
                                    </span>
                                </motion.span>
                            ))}
                        </h1>
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.7 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="max-w-xl text-sm sm:text-base text-white/80 font-medium border-l-[3px] border-secondary/50 pl-6 leading-relaxed"
                            >
                                {description}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* VIP Decorative Card or Metric (Optional, adds to the "eye catching" feel) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.8 }}
                        className="hidden lg:flex justify-end"
                    >
                        <div className="p-1 rounded-2xl bg-gradient-to-br from-white/20 to-transparent backdrop-blur-sm border border-white/10 shadow- vip">
                            <div className="bg-primary/40 p-4 rounded-xl border border-white/5">
                                <div className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-1">Journal Status</div>
                                <div className="text-lg font-black text-white">Actively Indexed & Peer Reviewed</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}

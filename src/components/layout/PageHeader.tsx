'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion, animate } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';
import { useRef, useEffect, useId } from 'react';
import { useLenis } from 'lenis/react';

interface BreadcrumbItem {
    name: string;
    href: string;
}

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: BreadcrumbItem[];
    scrollOnComplete?: boolean;
    disableBreadcrumbJsonLd?: boolean;
}

function BreadcrumbJsonLd({ items, baseUrl }: { items: BreadcrumbItem[]; baseUrl: string }) {
    const id = useId();
    const itemListElement = items.map((item, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: item.name,
        item: `${baseUrl}${item.href}`,
    }));

    return (
        <script
            id={id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'BreadcrumbList',
                    itemListElement,
                }),
            }}
        />
    );
}

export default function PageHeader({ title, description, breadcrumbs, scrollOnComplete = true, disableBreadcrumbJsonLd = false }: PageHeaderProps) {
    const sectionRef = useRef<HTMLElement>(null);
    const animationRef = useRef<AnimationPlaybackControls | null>(null);
    const lenis = useLenis();

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

            if (lenis) {
                lenis.scrollTo(sectionBottom, {
                    duration: 1.2,
                    easing: (t) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t), // smooth ease-out-expo
                });
            } else {
                animationRef.current = animate(window.scrollY, sectionBottom, {
                    duration: 1.2,
                    ease: [0.32, 0.72, 0, 1],
                    onUpdate: (latest) => window.scrollTo(0, latest),
                });
            }
        }
    };


    const baseUrl = (typeof window !== 'undefined'
        ? window.location.origin
        : process.env['NEXT_PUBLIC_APP_URL'] || 'https://ijitest.org');

    return (
        <>
            {!disableBreadcrumbJsonLd && (
                <BreadcrumbJsonLd items={breadcrumbs} baseUrl={baseUrl.replace(/\/$/, '')} />
            )}
            <section ref={sectionRef} className="relative py-12 bg-[#000066] border-b border-white/5 overflow-hidden">
            <div className="container-responsive relative z-10">
                <nav aria-label="Breadcrumb">
                    <ol className="flex items-center gap-2 list-none p-0">
                        {breadcrumbs.map((crumb, idx) => {
                            const isLast = idx === breadcrumbs.length - 1;
                            return (
                                <motion.li
                                    key={crumb.href + idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: idx * 0.1, ease: "easeOut" }}
                                    className="flex items-center gap-2"
                                >
                                    <Link
                                        href={crumb.href}
                                        aria-current={isLast ? "page" : undefined}
                                        className={`text-xs xl:text-sm 2xl:text-base font-medium tracking-tight transition-all duration-300 ${isLast ? "text-white" : "text-white/50 hover:text-white"}`}
                                    >
                                        {crumb.name}
                                    </Link>
                                    {!isLast && (
                                        <ChevronRight className="w-3 h-3 text-secondary" />
                                    )}
                                </motion.li>
                            );
                        })}
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-end">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onAnimationComplete={handleAnimationComplete}
                    >
                        <h1 className="font-serif font-semibold text-white mb-4 text-2xl xl:text-3xl 2xl:text-4xl">
                            {title}
                        </h1>
                        {description && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.9 }}
                                transition={{ delay: 0.6, duration: 1 }}
                                className="max-w-2xl text-sm sm:text-base 2xl:text-lg text-white/80 leading-relaxed border-l-2 border-primary-foreground/30 pl-4"
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

                    </motion.div>
                </div>
            </div>
        </section>
        </>
    );
}

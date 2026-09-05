'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import { animate } from 'framer-motion';
import type { AnimationPlaybackControls } from 'framer-motion';

interface PageHeaderScrollProps {
    targetId: string;
}

export default function PageHeaderScroll({ targetId }: PageHeaderScrollProps) {
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

        const timer = setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) {
                const sectionBottom = el.getBoundingClientRect().bottom + window.scrollY - 80;
                if (lenis) {
                    lenis.scrollTo(sectionBottom, {
                        duration: 1.2,
                        easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
                    });
                } else {
                    animationRef.current = animate(window.scrollY, sectionBottom, {
                        duration: 1.2,
                        ease: [0.32, 0.72, 0, 1],
                        onUpdate: (latest) => window.scrollTo(0, latest),
                    });
                }
            }
        }, 500);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('wheel', stopAnimation);
            window.removeEventListener('touchmove', stopAnimation);
            window.removeEventListener('pointerdown', stopAnimation);
            stopAnimation();
        };
    }, [targetId, lenis]);

    return null;
}

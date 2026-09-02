import { useState, useEffect } from 'react';

/**
 * useScrollSpy
 * Tracks the user's scroll position and returns the ID of the currently visible section.
 *
 * @param itemIds - Array of section DOM element IDs (without '#')
 * @param offset - Vertical clearance offset in pixels for sticky headers (default: 120px)
 * @returns string - ID of the currently active section
 */
export function useScrollSpy(itemIds: string[], offset: number = 120): string {
    const [activeId, setActiveId] = useState<string>(itemIds[0] || '');

    useEffect(() => {
        if (!itemIds.length) return;

        const handleScroll = () => {
            const scrollPosition = window.scrollY + offset;

            // Find the active section based on scroll offset
            let current = itemIds[0] || '';
            for (const id of itemIds) {
                const el = document.getElementById(id);
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY;
                    if (scrollPosition >= top - 20) {
                        current = id;
                    }
                }
            }

            if (current) {
                setActiveId(current);
            }
        };

        // Run once on mount
        handleScroll();

        // Attach passive scroll listener
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [itemIds, offset]);

    return activeId;
}

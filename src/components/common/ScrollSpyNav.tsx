'use client';

import React from 'react';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { cn } from '@/lib/utils';

export interface ScrollSpyItem {
    id: string;
    title: string;
}

interface ScrollSpyNavProps {
    items: ScrollSpyItem[];
    className?: string;
    itemClassName?: string;
    offset?: number;
}

export function ScrollSpyNav({
    items,
    className,
    itemClassName,
    offset = 120
}: ScrollSpyNavProps) {
    const itemIds = items.map((i) => i.id);
    const activeId = useScrollSpy(itemIds, offset);

    const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 90;
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            window.history.replaceState(null, '', `#${id}`);
        }
    };

    return (
        <nav
            aria-label="Quick Navigation"
            className={cn(
                "space-y-0.5 relative border-l border-border/70 pl-3 max-h-[calc(100vh-12rem)] overflow-y-auto pr-1 scroll-smooth",
                className
            )}
        >
            {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => handleScrollTo(e, item.id)}
                        aria-current={isActive ? 'true' : undefined}
                        className={cn(
                            "block py-1.5 px-3 rounded-lg text-xs 2xl:text-sm transition-all duration-200 relative",
                            isActive
                                ? "text-primary font-bold bg-primary/5 border-l-2 border-primary -ml-[13px] pl-3.5 shadow-2xs"
                                : "text-muted-foreground/80 hover:text-foreground hover:bg-muted/40 font-medium",
                            itemClassName
                        )}
                    >
                        {item.title}
                    </a>
                );
            })}
        </nav>
    );
}

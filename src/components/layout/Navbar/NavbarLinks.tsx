import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { navigation } from './nav-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';

interface NavbarLinksProps {
    isScrolled: boolean;
}

export function NavbarLinks({ isScrolled }: NavbarLinksProps) {
    const [activeIndex, setActiveIndex] = useState<string | null>(null);
    const pathname = usePathname();

    const handleActivate = useCallback((name: string) => {
        setActiveIndex(name);
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setActiveIndex(null);
        }
    }, []);

    const memoizedNavigation = useMemo(() => {
        return navigation.map((item) => {
            const isActive = pathname === item.href || (item.children?.some(child => pathname === child.href));
            const isMenuOpen = activeIndex === item.name;

            return (
                <li
                    key={item.name}
                    className={`relative group transition-all duration-300 ${isScrolled ? 'py-3' : 'py-3.5'}`}
                    onMouseEnter={() => handleActivate(item.name)}
                    onMouseLeave={() => setActiveIndex(null)}
                    onFocus={() => handleActivate(item.name)}
                    onBlur={(e) => {
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setActiveIndex(null);
                        }
                    }}
                    onKeyDown={handleKeyDown}
                >
                    <Link
                        href={item.href}
                        aria-haspopup={item.children ? "true" : undefined}
                        aria-expanded={item.children ? isMenuOpen : undefined}
                        className={`nav-link ${isActive ? 'text-primary' : 'text-foreground/90 hover:text-primary'}`}
                    >
                        <span className="relative z-10 py-0.5">
                            {item.name}
                            {(isMenuOpen || (isActive && !activeIndex)) && (
                                <motion.span
                                    layoutId="nav-underline"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-linear-to-r from-secondary to-secondary/40 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </span>
                        {item.children && (
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 text-secondary/50 group-hover:text-secondary ${isMenuOpen ? 'rotate-180' : ''}`} />
                        )}
                    </Link>

                    <AnimatePresence>
                        {item.children && isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className="absolute top-[calc(100%-2px)] left-[-10px] w-64 2xl:w-72 bg-white/95 backdrop-blur-2xl border border-primary/10 rounded-2xl shadow-xl py-2 z-50 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-secondary via-secondary/50 to-transparent" />
                                <ul className="space-y-0.5 list-none p-0 m-0">
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <li key={child.name}>
                                                <Link
                                                    href={child.href}
                                                    className={`nav-dropdown-item group/child ${isChildActive ? 'text-primary bg-primary/5' : 'text-foreground/90 hover:text-primary'}`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isChildActive ? 'bg-secondary scale-125' : 'bg-secondary/0 group-hover/child:bg-secondary'}`} />
                                                        {child.name}
                                                    </span>
                                                    <div className={`absolute inset-0 bg-primary/3 transition-transform duration-300 ${isChildActive ? 'translate-x-0' : '-translate-x-full group-hover/child:translate-x-0'}`} />
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </li>
            );
        });
    }, [pathname, activeIndex, isScrolled, handleActivate, handleKeyDown]);

    return (
        <ul className="hidden items-center list-none p-0 lg:flex lg:space-x-1 xl:space-x-2 2xl:space-x-4">
            {memoizedNavigation}
        </ul>
    );
}

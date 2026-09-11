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
            const isChildActive = (item.children?.some(child => pathname === child.href)) ||
                (item.columns?.some(col => col.items.some(child => pathname === child.href)));
            const isActive = pathname === item.href || isChildActive;
            const hasDropdown = Boolean(item.children?.length || item.columns?.length);
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
                        aria-haspopup={hasDropdown ? "true" : undefined}
                        aria-expanded={hasDropdown ? isMenuOpen : undefined}
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
                        {hasDropdown && (
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 text-secondary/50 group-hover:text-secondary ${isMenuOpen ? 'rotate-180' : ''}`} />
                        )}
                    </Link>

                    <AnimatePresence>
                        {hasDropdown && isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                className={`absolute top-[calc(100%-2px)] ${
                                    item.isMegaMenu
                                        ? "left-1/2 -translate-x-1/2 w-[540px] 2xl:w-[580px] p-3.5"
                                        : "left-[-10px] w-64 2xl:w-72 py-2"
                                } bg-white/95 backdrop-blur-2xl border border-primary/10 rounded-2xl shadow-2xl z-50 overflow-hidden`}
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-secondary via-secondary/50 to-transparent" />

                                {item.isMegaMenu && item.columns ? (
                                    <div className="grid grid-cols-2 gap-3 divide-x divide-primary/5">
                                        {item.columns.map((col, idx) => (
                                            <div key={col.heading} className={`space-y-1.5 ${idx > 0 ? 'pl-3' : 'pr-1'}`}>
                                                <div className="px-2.5 pb-1 border-b border-primary/5">
                                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary/60">
                                                        {col.heading}
                                                    </span>
                                                </div>
                                                <ul className="space-y-0.5 list-none p-0 m-0">
                                                    {col.items.map((child) => {
                                                        const isSubActive = pathname === child.href;
                                                        const IconComponent = child.icon;
                                                        return (
                                                            <li key={child.name}>
                                                                <Link
                                                                    href={child.href}
                                                                    className={`nav-dropdown-item group/child text-xs py-1.5 px-2.5 rounded-lg flex items-center justify-between transition-all ${
                                                                        isSubActive
                                                                            ? 'text-primary bg-primary/5 font-semibold'
                                                                            : 'text-foreground/80 hover:text-primary hover:bg-primary/5'
                                                                    }`}
                                                                >
                                                                    <span className="relative z-10 flex items-center gap-2 truncate">
                                                                        {IconComponent ? (
                                                                            <IconComponent className={`w-3.5 h-3.5 shrink-0 ${isSubActive ? 'text-secondary' : 'text-primary/40 group-hover/child:text-secondary'} transition-colors`} />
                                                                        ) : (
                                                                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-300 ${isSubActive ? 'bg-secondary scale-125' : 'bg-secondary/0 group-hover/child:bg-secondary'}`} />
                                                                        )}
                                                                        <span className="truncate">{child.name}</span>
                                                                    </span>
                                                                </Link>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <ul className="space-y-0.5 list-none p-0 m-0">
                                        {item.children?.map((child) => {
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
                                )}
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

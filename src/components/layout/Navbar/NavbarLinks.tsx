import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { navigation } from './nav-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { getPublishedPapers } from '@/actions/archives';
import { getEditorialBoard } from '@/actions/users';
import { publicKeys } from '@/hooks/queries/usePublic';

interface NavbarLinksProps {
    isScrolled: boolean;
}

export function NavbarLinks({ isScrolled }: NavbarLinksProps) {
    const [activeIndex, setActiveIndex] = useState<string | null>(null);
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const handleActivate = useCallback((name: string) => {
        setActiveIndex(name);

        // Prefetch high-priority public data based on activation
        if (name === 'Archives') {
            queryClient.prefetchQuery({
                queryKey: publicKeys.archives(),
                queryFn: () => getPublishedPapers(),
                staleTime: 1000 * 60 * 5
            });
        }
        if (name === 'Editorial Board') {
            queryClient.prefetchQuery({
                queryKey: publicKeys.editorialBoard(),
                queryFn: () => getEditorialBoard(),
                staleTime: 1000 * 60 * 5
            });
        }
    }, [queryClient]);

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
                    className={`relative group transition-all duration-500 ${isScrolled ? 'py-5' : 'py-7 2xl:py-10'}`}
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
                        className={`transition-all duration-300 flex items-center gap-2 2xl:gap-3 relative px-2 lg:px-3 2xl:px-4 text-sm xl:text-base 2xl:text-xl font-semibold ${isActive ? 'text-primary' : 'text-black hover:text-primary'}`}
                    >
                        <span className="relative z-10">{item.name}</span>
                        {item.children && (
                            <ChevronDown className={`w-3.5 h-3.5 2xl:w-5 2xl:h-5 transition-transform duration-500 text-secondary/50 group-hover:text-secondary ${isMenuOpen ? 'rotate-180' : ''}`} />
                        )}

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
                    </Link>

                    <AnimatePresence>
                        {item.children && isMenuOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                transition={{ duration: 0.2, ease: "easeOut" }}
                                className="absolute top-[calc(100%-2px)] left-[-20px] w-72 2xl:w-[400px] bg-white/95 backdrop-blur-2xl border border-primary/5 rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-5 2xl:py-10 z-50 overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-linear-to-r from-secondary via-secondary/50 to-transparent" />
                                <ul className="space-y-1 list-none p-0">
                                    {item.children.map((child) => {
                                        const isChildActive = pathname === child.href;
                                        return (
                                            <li key={child.name}>
                                                <Link
                                                    href={child.href}
                                                    className={`block px-8 py-3.5 2xl:px-12 2xl:py-6 tracking-widest transition-all relative group/child ${isChildActive ? 'text-primary' : 'text-black hover:text-primary'}`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 2xl:w-2.5  2xl:h-2.5 rounded-full transition-all duration-300 ${isChildActive ? 'bg-secondary scale-125' : 'bg-secondary/0 group-hover/child:bg-secondary'}`} />
                                                        {child.name}
                                                    </span>
                                                    <div className={`absolute inset-0 bg-primary/3 transition-transform duration-500 ${isChildActive ? 'translate-x-0' : '-translate-x-full group-hover/child:translate-x-0'}`} />
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
        <ul className="hidden lg:flex items-center lg:space-x-1 xl:space-x-1 2xl:space-x-8 list-none p-0">
            {memoizedNavigation}
        </ul>
    );
}

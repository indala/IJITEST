import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { navigation } from './nav-data';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavbarLinksProps {
    isScrolled: boolean;
}

export function NavbarLinks({ isScrolled }: NavbarLinksProps) {
    const [hoveredIndex, setHoveredIndex] = useState<string | null>(null);
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex items-center lg:space-x-1 xl:space-x-4 2xl:space-x-8">
            {navigation.map((item) => {
                const isActive = pathname === item.href || (item.children?.some(child => pathname === child.href));
                const isHovered = hoveredIndex === item.name;

                return (
                    <div
                        key={item.name}
                        className={`relative group transition-all duration-500 ${isScrolled ? 'py-5' : 'py-7'}`}
                        onMouseEnter={() => setHoveredIndex(item.name)}
                        onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <Link
                            href={item.href}
                            className={`font-black lg:text-[10px] xl:text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2 relative px-2 lg:px-3 ${isActive ? 'text-primary' : 'text-primary/60 hover:text-primary'}`}
                        >
                            <span className="relative z-10">{item.name}</span>
                            {item.children && (
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-500 text-secondary/50 group-hover:text-secondary ${isHovered ? 'rotate-180 animate-pulse' : ''}`} />
                            )}

                            {(isHovered || (isActive && !hoveredIndex)) && (
                                <motion.span
                                    layoutId="nav-underline"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute -bottom-1 left-0 right-0 h-[2px] bg-gradient-to-r from-secondary to-secondary/40 rounded-full"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                        </Link>

                        <AnimatePresence>
                            {item.children && isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="absolute top-[calc(100%-2px)] left-[-20px] w-72 bg-white/95 backdrop-blur-2xl border border-primary/5 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-5 z-50 overflow-hidden"
                                >
                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-secondary via-secondary/50 to-transparent" />
                                    <div className="space-y-1">
                                        {item.children.map((child) => {
                                            const isChildActive = pathname === child.href;
                                            return (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className={`block px-8 py-3.5 text-[10px] font-black uppercase tracking-widest transition-all relative group/child ${isChildActive ? 'text-primary' : 'text-primary/60 hover:text-primary'}`}
                                                >
                                                    <span className="relative z-10 flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${isChildActive ? 'bg-secondary scale-125' : 'bg-secondary/0 group-hover/child:bg-secondary'}`} />
                                                        {child.name}
                                                    </span>
                                                    <div className={`absolute inset-0 bg-primary/[0.03] transition-transform duration-500 ${isChildActive ? 'translate-x-0' : 'translate-x-[-100%] group-hover/child:translate-x-0'}`} />
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}

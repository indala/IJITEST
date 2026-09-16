import { useEffect, useState, memo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { navigation } from './nav-data';
import { X, ChevronRight, ChevronDown } from 'lucide-react';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

function MobileMenuComponent({ isOpen, setIsOpen }: MobileMenuProps) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

    // Auto-expand if the active route is a child of an item
    useEffect(() => {
        if (isOpen) {
            const initialExpanded: Record<string, boolean> = {};
            navigation.forEach(item => {
                const isChildActive = (item.children?.some(c => pathname === c.href)) ||
                    (item.columns?.some(col => col.items.some(c => pathname === c.href)));
                if (isChildActive) {
                    initialExpanded[item.name] = true;
                }
            });
            setExpandedItems(initialExpanded);
        }
    }, [isOpen, pathname]);

    const toggleExpand = useCallback((name: string) => {
        setExpandedItems(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setMounted(true), 0);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = useCallback(() => setIsOpen(false), [setIsOpen]);

    // Body Scroll Lock
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = 'var(--removed-body-scrollbar-width)'; // Prevent layout shift if any
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [isOpen]);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* High-End Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-primary/20 backdrop-blur-md z-9998 lg:hidden"
                    />

                    {/* Fixed Floating Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="mobile-menu-title"
                        className="fixed top-12 left-4 right-4 mx-auto w-[calc(100%-2rem)] max-w-[480px] bg-white/95 backdrop-blur-3xl rounded-4xl shadow-[0_40px_80px_-16px_rgba(0,0,0,0.3)] border border-white/40 flex flex-col overflow-hidden max-h-[85vh] z-9999 lg:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 h-16 border-b border-primary/5 shrink-0">
                            <div className="flex flex-col">
                                <span className="text-label font-black text-secondary tracking-[0.3em]">Menu</span>
                                <span id="mobile-menu-title" className="text-label font-black text-primary tracking-widest">Navigation</span>
                            </div>
                            <button
                                title="Close Menu"
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Navigation Scroll Area (Scrollbar Hidden) */}
                        <div className="flex-1 overflow-y-auto px-5 py-6 scrolling-touch">
                            <style dangerouslySetInnerHTML={{
                                __html: `
                                .scrolling-touch {
                                    scrollbar-width: none;
                                    -ms-overflow-style: none;
                                }
                                .scrolling-touch::-webkit-scrollbar { 
                                    display: none; 
                                }
                            `}} />
                            <ul className="grid grid-cols-1 gap-1.5 list-none p-0">
                                {navigation.map((item, idx) => {
                                    const isChildActive = (item.children?.some(c => pathname === c.href)) ||
                                        (item.columns?.some(col => col.items.some(c => pathname === c.href)));
                                    const isActive = pathname === item.href || isChildActive;
                                    return (
                                        <motion.li
                                            key={item.name}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.05 + idx * 0.03 }}
                                            className="block w-full"
                                        >
                                            <div className="space-y-1">
                                                {Boolean(item.children?.length || item.columns?.length) ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpand(item.name)}
                                                        aria-expanded={Boolean(expandedItems[item.name])}
                                                        className={cn(
                                                            "nav-mobile-link group w-full cursor-pointer text-left",
                                                            isActive
                                                                ? "bg-primary/5 text-primary"
                                                                : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                                                isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-primary/5 text-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                                                            )}>
                                                                {item.icon && <item.icon className="w-4 h-4" />}
                                                            </div>
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <ChevronDown className={cn(
                                                            "w-4 h-4 transition-transform duration-300",
                                                            expandedItems[item.name] ? "rotate-180 text-secondary" : "text-primary/30 group-hover:text-primary"
                                                        )} />
                                                    </button>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        onClick={handleClose}
                                                        className={cn(
                                                            "nav-mobile-link group",
                                                            isActive
                                                                ? "bg-primary/5 text-primary"
                                                                : "text-foreground/80 hover:bg-primary/5 hover:text-primary"
                                                        )}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <div className={cn(
                                                                "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
                                                                isActive ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-primary/5 text-primary/40 group-hover:bg-primary/10 group-hover:text-primary"
                                                            )}>
                                                                {item.icon && <item.icon className="w-4 h-4" />}
                                                            </div>
                                                            <span>{item.name}</span>
                                                        </div>
                                                        <ChevronRight className={cn(
                                                            "w-3.5 h-3.5 transition-all duration-300",
                                                            isActive ? "text-secondary translate-x-0" : "text-primary/20 -translate-x-1 group-hover:translate-x-0 group-hover:text-primary/40"
                                                        )} />
                                                    </Link>
                                                )}

                                                <AnimatePresence initial={false}>
                                                    {Boolean(item.children?.length || item.columns?.length) && expandedItems[item.name] && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: "auto", opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.25, ease: "easeInOut" }}
                                                            className="overflow-hidden"
                                                        >
                                                            {item.children && (
                                                                <ul className="ml-12 space-y-1 border-l border-primary/5 pl-4 pb-1 pt-1 list-none p-0">
                                                                    {item.children.map((child) => {
                                                                        const isSubActive = pathname === child.href;
                                                                        return (
                                                                            <li key={child.name}>
                                                                                <Link
                                                                                    href={child.href}
                                                                                    onClick={handleClose}
                                                                                    className={cn(
                                                                                        "nav-mobile-sublink",
                                                                                        isSubActive ? "text-secondary font-bold" : "text-muted-foreground hover:text-primary"
                                                                                    )}
                                                                                >
                                                                                    <div className={cn(
                                                                                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                                                        isSubActive ? "bg-secondary scale-110 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-primary/10"
                                                                                    )} />
                                                                                    {child.name}
                                                                                </Link>
                                                                            </li>
                                                                        );
                                                                    })}
                                                                </ul>
                                                            )}

                                                            {item.columns && (
                                                                <div className="ml-8 space-y-3 border-l border-primary/10 pl-3.5 pb-2 pt-1">
                                                                    {item.columns.map((col) => (
                                                                        <div key={col.heading} className="space-y-1">
                                                                            <span className="text-label text-primary/60 block px-1 pt-1">
                                                                                {col.heading}
                                                                            </span>
                                                                            <ul className="space-y-0.5 list-none p-0">
                                                                                {col.items.map((child) => {
                                                                                    const isSubActive = pathname === child.href;
                                                                                    const IconComponent = child.icon;
                                                                                    return (
                                                                                        <li key={child.name}>
                                                                                            <Link
                                                                                                href={child.href}
                                                                                                onClick={handleClose}
                                                                                                className={cn(
                                                                                                    "nav-mobile-sublink py-1.5",
                                                                                                    isSubActive ? "text-secondary font-bold" : "text-muted-foreground hover:text-primary"
                                                                                                )}
                                                                                            >
                                                                                                {IconComponent ? (
                                                                                                    <IconComponent className={cn(
                                                                                                        "w-3.5 h-3.5 shrink-0 transition-all duration-500",
                                                                                                        isSubActive ? "text-secondary" : "text-primary/30"
                                                                                                    )} />
                                                                                                ) : (
                                                                                                    <div className={cn(
                                                                                                        "w-1.5 h-1.5 rounded-full transition-all duration-500",
                                                                                                        isSubActive ? "bg-secondary scale-110 shadow-[0_0_8px_rgba(234,179,8,0.5)]" : "bg-primary/10"
                                                                                                    )} />
                                                                                                )}
                                                                                                <span className="truncate">{child.name}</span>
                                                                                            </Link>
                                                                                        </li>
                                                                                    );
                                                                                })}
                                                                            </ul>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Footer / Actions */}
                        <div className="px-5 py-4 border-t border-primary/10 shrink-0 bg-muted/20 space-y-2.5">
                            {/* Track Manuscript */}
                            <Link
                                href="/track"
                                onClick={handleClose}
                                className="w-full py-2 px-3 rounded-xl border border-primary/25 text-primary font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-primary/5 transition-all no-underline"
                            >
                                Track Manuscript
                            </Link>

                            {/* Submit Manuscript (Full-width Primary Action) */}
                            <Link
                                href="/submit"
                                onClick={handleClose}
                                className="nav-btn-action w-full py-2.5 px-4 rounded-xl text-center block font-semibold text-xs-plus sm:text-sm shadow-md no-underline"
                            >
                                Submit Manuscript
                            </Link>

                            {/* Portal Login */}
                            <div className="text-center pt-1">
                                <Link
                                    href="/login"
                                    onClick={handleClose}
                                    className="text-caption font-semibold text-muted-foreground hover:text-primary transition-colors inline-block"
                                >
                                    Portal Login
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
}

export const MobileMenu = memo(MobileMenuComponent);

"use client";

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { navigation } from './nav-data';

interface MobileMenuProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export function MobileMenu({ isOpen, setIsOpen }: MobileMenuProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-primary/10 shadow-2xl overflow-y-auto max-h-[85vh] z-50 p-4 pt-2 pb-10"
                >
                    <div className="space-y-2">
                        {navigation.map((item, idx) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <div className="space-y-1">
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center px-5 py-4 text-xs font-black uppercase tracking-widest text-primary/70 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/5"
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="ml-6 pl-4 border-l-2 border-secondary/10 space-y-1 mt-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-primary/40 hover:text-secondary hover:bg-secondary/5 rounded-xl transition-all"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div className="pt-6">
                            <Link
                                href="/submit"
                                className="flex items-center justify-center w-full h-16 bg-primary text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                Submit Manuscript
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

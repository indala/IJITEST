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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="lg:hidden bg-background/95 backdrop-blur-2xl border-b border-primary/10 overflow-hidden"
                >
                    <div className="px-4 pt-4 pb-8 space-y-1">
                        {navigation.map((item, idx) => (
                            <motion.div
                                key={item.name}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <div className="py-2">
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className="block px-4 py-3 text-xs font-black uppercase tracking-widest text-primary/70 hover:text-primary hover:bg-primary/5 rounded-xl transition-all"
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="ml-4 pl-4 border-l-2 border-secondary/20 space-y-1 mt-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="block px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-primary/50 hover:text-secondary transition-all"
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        <div className="pt-4">
                            <Link
                                href="/submit"
                                className="block w-full bg-primary text-white py-4 text-center rounded-xl font-black uppercase tracking-widest text-xs"
                                onClick={() => setIsOpen(false)}
                            >
                                Submit Paper
                            </Link>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

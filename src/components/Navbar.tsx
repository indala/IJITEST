"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
    { name: 'Home', href: '/' },
    {
        name: 'About',
        href: '/about',
        children: [
            { name: 'About the Journal', href: '/about' },
            { name: 'Editorial Board', href: '/editorial-board' },
            { name: 'Publication Ethics', href: '/ethics' },
            { name: 'Peer Review Process', href: '/peer-review' },
            { name: 'Reviewer Guidelines', href: '/reviewer-guidelines' },
        ]
    },
    { name: 'Guidelines', href: '/guidelines' },
    { name: 'Archives', href: '/archives' },
    { name: 'Indexing', href: '/indexing' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar({ settings }: { settings?: Record<string, string> }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const shortName = settings?.journal_short_name || "IJITEST";

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-white/98 shadow-2xl shadow-primary/5 py-1' : 'bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm py-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center">
                            <img
                                src="/logo.bmp"
                                alt={`${shortName} Logo`}
                                className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-14' : 'h-20'} hover:scale-105`}
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-10">
                        {navigation.map((item) => (
                            <div key={item.name} className={`relative group transition-all duration-500 ${isScrolled ? 'py-5' : 'py-7'}`}>
                                <Link
                                    href={item.href}
                                    className="text-gray-600 hover:text-primary font-bold text-sm uppercase tracking-widest transition-all duration-300 flex items-center gap-1.5 relative"
                                >
                                    {item.name}
                                    {item.children && <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300" />
                                </Link>

                                {item.children && (
                                    <div className="absolute top-[calc(100%-10px)] left-0 w-64 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-2xl shadow-2xl shadow-primary/5 opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-500 py-3 z-50 overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className="block px-6 py-2.5 text-xs font-bold text-gray-500 hover:bg-primary/5 hover:text-primary transition-all"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <Link href="/submit" className={`px-6 rounded-xl bg-primary text-white font-black hover:bg-secondary transition-all duration-500 shadow-xl shadow-primary/10 ${isScrolled ? 'py-2 text-[10px]' : 'py-3 text-xs'} uppercase tracking-widest`}>
                            Submit Paper
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-primary p-2 transition-colors"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-6 space-y-1">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="pl-6 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    href={child.href}
                                                    className="block px-3 py-1 text-sm text-gray-500 hover:text-primary"
                                                    onClick={() => setIsOpen(false)}
                                                >
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
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
        </nav>
    );
}

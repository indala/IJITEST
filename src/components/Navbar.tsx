"use client";

import Link from 'next/link';
import { useState } from 'react';
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

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="text-2xl font-serif font-bold text-primary">IJITEST</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <div key={item.name} className="relative group">
                                <Link
                                    href={item.href}
                                    className="text-gray-600 hover:text-primary font-medium transition-colors py-2 flex items-center gap-1"
                                >
                                    {item.name}
                                    {item.children && <ChevronDown className="w-4 h-4" />}
                                </Link>

                                {item.children && (
                                    <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                                        {item.children.map((child) => (
                                            <Link
                                                key={child.name}
                                                href={child.href}
                                                className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-primary"
                                            >
                                                {child.name}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        <Link href="/submit" className="btn-primary py-2 px-5 text-sm uppercase tracking-wide">
                            Submit Paper
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-600 hover:text-primary p-2"
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
                        className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
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
                                    className="block w-full btn-primary py-3 text-center"
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

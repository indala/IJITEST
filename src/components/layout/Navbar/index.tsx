"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { MobileMenu } from './MobileMenu';
import Link from 'next/link';

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
        <nav className={`sticky top-0 z-50 w-full transition-all duration-500 ${isScrolled ? 'bg-background/95 shadow-vip py-1' : 'bg-background/90 backdrop-blur-xl border-b border-primary/10 py-0'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className={`flex justify-between transition-all duration-500 ${isScrolled ? 'h-16' : 'h-20'}`}>
                    <NavbarBrand shortName={shortName} isScrolled={isScrolled} />

                    <NavbarLinks isScrolled={isScrolled} />

                    <div className="flex items-center gap-4">
                        <Link href="/submit" className={`flex items-center px-4 sm:px-6 rounded-xl bg-gradient-to-r from-secondary to-secondary/90 text-white font-black hover:scale-105 hover:shadow-vip-hover transition-all duration-500 shadow-xl shadow-secondary/20 ${isScrolled ? 'py-1.5 sm:py-2 text-[9px] sm:text-[10px]' : 'py-2 sm:py-3 text-[10px] sm:text-xs'} uppercase tracking-[0.15em]`}>
                            Submit Paper
                        </Link>

                        {/* Mobile menu button */}
                        <div className="lg:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-gray-600 hover:text-primary p-2 transition-colors"
                            >
                                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>
    );
}

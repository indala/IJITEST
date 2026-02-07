"use client";

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { MobileMenu } from './MobileMenu';

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
                    <NavbarBrand shortName={shortName} isScrolled={isScrolled} />

                    <NavbarLinks isScrolled={isScrolled} />

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

            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>
    );
}

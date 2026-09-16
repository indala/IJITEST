"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { MobileMenu } from './MobileMenu';
import SubmitPaperDropdown from './SubmitPaperDropdown';

import { useSettingsContext } from '@/components/providers/SettingsContext';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const settings = useSettingsContext();
    const shortName = settings.journalShortName;

    useEffect(() => {
        if (isOpen) {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [isOpen]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            id="journal-navbar"
            className={`sticky top-0 z-50 w-full transition-all duration-700 ${isScrolled
                ? 'bg-background/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-0.5'
                : 'bg-background/95 backdrop-blur-xl border-b border-primary/5 py-0'}`}>
            <div className="container-responsive">
                <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-12 lg:h-13 2xl:h-16' : 'h-14 lg:h-15 2xl:h-18'}`}>

                    {/* Brand */}
                    <NavbarBrand shortName={shortName || ""} isScrolled={isScrolled} />

                    {/* Desktop Navigation */}
                    <NavbarLinks isScrolled={isScrolled} />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 xl:gap-3 2xl:gap-4">
                        {/* Portal Login (subtle text link) */}
                        <Link
                            href="/login"
                            className="hidden 2xl:inline-flex items-center text-xs-plus font-semibold text-foreground/75 hover:text-primary transition-colors px-1.5 py-1"
                        >
                            Portal Login
                        </Link>

                        {/* Track Manuscript (outlined navy button) */}
                        <Link
                            href="/track"
                            className="hidden xl:inline-flex items-center gap-1.5 border border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-semibold px-3 py-1.5 text-xs xl:text-13 transition-all whitespace-nowrap"
                        >
                            Track Manuscript
                        </Link>

                        {/* Submit Manuscript (prominent action button/dropdown) */}
                        <SubmitPaperDropdown />

                        {/* Mobile menu button */}
                        <div className="lg:hidden flex items-center">
                            <button
                                id="mobile-nav-toggler"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-label="Toggle navigation menu"
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all duration-300"
                            >
                                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
        </nav>
    );
}

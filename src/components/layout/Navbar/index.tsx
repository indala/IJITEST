"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { NavbarBrand } from './NavbarBrand';
import { NavbarLinks } from './NavbarLinks';
import { MobileMenu } from './MobileMenu';

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
            aria-label="Main Navigation"
            className={`sticky top-0 z-50 w-full transition-all duration-700 ${isScrolled
                ? 'bg-background/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-0.5'
                : 'bg-background/95 backdrop-blur-xl border-b border-primary/5 py-0'}`}>
            <div className="container-responsive">
                <div className={`flex justify-between items-center transition-all duration-500 ${isScrolled ? 'h-12 xl:h-13 2xl:h-16' : 'h-14 xl:h-15 2xl:h-18'}`}>

                    {/* Brand */}
                    <NavbarBrand shortName={shortName || ""} isScrolled={isScrolled} />

                    {/* Desktop Navigation — Suspense lets usePathname() stream in at runtime */}
                    <Suspense fallback={<div className="hidden xl:flex items-center gap-1 h-8 w-64" />}>
                        <NavbarLinks isScrolled={isScrolled} />
                    </Suspense>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-3">

                        {/* Submit Manuscript (direct action button) */}
                        <Link
                            href="/submit"
                            style={{ color: '#ffffff' }}
                            className="nav-btn-action !text-white text-white hover:text-white flex items-center justify-center font-semibold shadow-xs no-underline"
                        >
                            <span style={{ color: '#ffffff' }} className="hidden sm:inline text-white !text-white">Submit Manuscript</span>
                            <span style={{ color: '#ffffff' }} className="sm:hidden text-white !text-white">Submit</span>
                        </Link>

                        {/* Mobile menu button */}
                        <div className="xl:hidden flex items-center">
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

            {/* Mobile menu — Suspense lets usePathname() stream in at runtime */}
            <Suspense fallback={null}>
                <MobileMenu isOpen={isOpen} setIsOpen={setIsOpen} />
            </Suspense>
        </nav>
    );
}

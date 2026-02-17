'use client'
import Link from 'next/link';

interface NavbarBrandProps {
    shortName: string;
    isScrolled: boolean;
}

export function NavbarBrand({ shortName, isScrolled }: NavbarBrandProps) {
    return (
        <div className="flex items-center">
            <Link href="/" className="flex items-center gap-4 group">
                <img
                    src="/logo.bmp"
                    alt={`${shortName} Logo`}
                    className={`w-auto object-contain transition-all duration-500 ${isScrolled ? 'h-12' : 'h-16'} group-hover:scale-105`}
                />

            </Link>
        </div>
    );
}

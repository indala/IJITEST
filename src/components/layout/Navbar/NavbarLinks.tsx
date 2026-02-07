import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { navigation } from './nav-data';

interface NavbarLinksProps {
    isScrolled: boolean;
}

export function NavbarLinks({ isScrolled }: NavbarLinksProps) {
    return (
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
    );
}

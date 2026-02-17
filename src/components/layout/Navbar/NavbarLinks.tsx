import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { navigation } from './nav-data';

interface NavbarLinksProps {
    isScrolled: boolean;
}

export function NavbarLinks({ isScrolled }: NavbarLinksProps) {
    return (
        <div className="hidden lg:flex items-center lg:space-x-6 xl:space-x-10">
            {navigation.map((item) => (
                <div key={item.name} className={`relative group transition-all duration-500 ${isScrolled ? 'py-5' : 'py-7'}`}>
                    <Link
                        href={item.href}
                        className="text-primary/70 hover:text-primary font-black text-[11px] uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-1.5 relative"
                    >
                        {item.name}
                        {item.children && <ChevronDown className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-secondary/50 group-hover:text-secondary" />}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-secondary to-secondary/50 group-hover:w-full transition-all duration-300" />
                    </Link>

                    {item.children && (
                        <div className="absolute top-[calc(100%-5px)] left-0 w-64 bg-white/98 backdrop-blur-xl border border-primary/5 rounded-2xl shadow-vip opacity-0 invisible translate-y-4 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-500 py-3 z-50 overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-secondary to-secondary/30" />
                            {item.children.map((child) => (
                                <Link
                                    key={child.name}
                                    href={child.href}
                                    className="block px-7 py-3 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:bg-primary/5 hover:text-primary transition-all relative overflow-hidden group/child"
                                >
                                    <span className="relative z-10">{child.name}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent translate-x-[-100%] group-hover/child:translate-x-0 transition-transform duration-500" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

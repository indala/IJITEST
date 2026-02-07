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
                <div className="flex flex-col">
                    <span className={`font-serif font-black tracking-tight leading-none text-gray-900 transition-all duration-500 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                        {shortName}
                    </span>
                    <span className={`text-[10px] font-bold text-primary uppercase tracking-[0.2em] transition-all duration-500 ${isScrolled ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
                        Quest for Innovation
                    </span>
                </div>
            </Link>
        </div>
    );
}

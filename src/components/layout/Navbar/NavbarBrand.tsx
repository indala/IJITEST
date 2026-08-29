import Link from 'next/link';
import NextImage from 'next/image';

interface NavbarBrandProps {
    shortName: string;
    isScrolled: boolean;
}

export function NavbarBrand({ shortName, isScrolled }: NavbarBrandProps) {
    return (
        <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group transition-all duration-300 cursor-pointer">
                <div className={`relative transition-all duration-300 ${isScrolled ? 'h-8 sm:h-9' : 'h-9 sm:h-11'}`}>
                    <NextImage
                        src="/logo.png"
                        alt={`${shortName} Logo`}
                        width={200}
                        height={96}
                        priority
                        style={{ width: 'auto', height: '100%' }}
                        className="object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-xs"
                    />
                    <div className="absolute inset-0 bg-primary/5 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                </div>
            </Link>
        </div>
    );
}

import Link from 'next/link';
import { Facebook, Twitter, Linkedin } from 'lucide-react';

interface FooterBrandingProps {
    shortName: string;
    name: string;
    publisherName?: string;
}

export function FooterBranding({ shortName, name, publisherName }: FooterBrandingProps) {
    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-white text-xl sm:text-2xl font-sans font-black mb-4 tracking-tighter">{shortName}</h3>
                <p className="text-xs leading-relaxed opacity-60 font-medium">
                    {name} ({shortName}) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                </p>
            </div>
            <div className="space-y-3">
                <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Institutional Publisher</p>
                <p className="text-sm font-black text-white">{publisherName || 'Felix Academic Publications'}</p>
                <div className="flex gap-4">
                    <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
                        <Facebook className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
                        <Twitter className="w-4 h-4" />
                    </Link>
                    <Link href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-secondary hover:text-white transition-all">
                        <Linkedin className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

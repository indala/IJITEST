import Link from 'next/link';

interface FooterLinksProps {
    title: string;
    links: { label: string; href: string }[];
}

export function FooterLinks({ title, links }: FooterLinksProps) {
    return (
        <div>
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em] opacity-40">{title}</h4>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                {links.map((link) => (
                    <li key={link.href}>
                        <Link href={link.href} className="hover:text-secondary transition-colors">
                            {link.label}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}

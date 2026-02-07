import { FooterBranding } from './FooterBranding';
import { FooterLinks } from './FooterLinks';
import { FooterContact } from './FooterContact';
import { FooterBottom } from './FooterBottom';

const journalPortals = [
    { label: 'About Journal', href: '/about' },
    { label: 'Editorial Board', href: '/editorial-board' },
    { label: 'Author Guidelines', href: '/guidelines' },
    { label: 'Peer Review', href: '/peer-review' },
    { label: 'Publication Ethics', href: '/ethics' },
];

const resources = [
    { label: 'Digital Archives', href: '/archives' },
    { label: 'Indexing Hub', href: '/indexing' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'Track Application', href: '/track' },
    { label: 'Contact Office', href: '/contact' },
];

export default function Footer({ settings }: { settings?: Record<string, string> }) {
    const name = settings?.journal_name || "International Journal of Innovative Trends in Engineering Science and Technology";
    const shortName = settings?.journal_short_name || "IJITEST";
    const email = settings?.support_email || "editor@ijitest.org";
    const phone = settings?.support_phone || "+91 8919643590";
    const address = settings?.office_address || "Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India";

    return (
        <footer className="bg-[#0f172a] text-gray-400 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    <FooterBranding shortName={shortName} name={name} />
                    <FooterLinks title="Journal Portals" links={journalPortals} />
                    <FooterLinks title="Resources" links={resources} />
                    <FooterContact email={email} phone={phone} address={address} />
                </div>
                <FooterBottom />
            </div>
        </footer>
    );
}

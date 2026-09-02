// Server Component — zero JS shipped for nav links, structure, and social icons
import { Suspense } from 'react';
import Link from 'next/link';
import { Phone, MapPin, ShieldCheck } from 'lucide-react';
import { FooterDynamic } from './FooterDynamic';
import { getSettingsData } from '@/actions/settings';

function FacebookIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
    );
}

function TwitterIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
    );
}

function InstagramIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
        </svg>
    );
}

const socialLinks = [
    { icon: FacebookIcon, href: process.env['NEXT_PUBLIC_FACEBOOK_URL'] || '#', label: 'Facebook' },
    { icon: TwitterIcon, href: process.env['NEXT_PUBLIC_TWITTER_URL'] || '#', label: 'Twitter' },
    { icon: InstagramIcon, href: process.env['NEXT_PUBLIC_INSTAGRAM_URL'] || '#', label: 'Instagram' },
];

export default async function Footer() {
    const settings = await getSettingsData();
    return (
        <footer className="bg-slate-950 text-white pt-10 pb-5 font-sans relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary/50 to-transparent opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-responsive">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-6">

                    <div className="lg:col-span-1 space-y-3">
                        <div>
                            <p className="mb-2 text-white m-0 font-bold">IJITEST</p>
                            <p className="text-white/80 m-0 text-xs leading-relaxed">
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                            </p>
                        </div>
                    </div>

                    {/* Journal Portals — static, zero JS */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white mb-3 border-b border-white/10 pb-2 inline-block m-0">Journal Portals</h3>
                        <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-white/80 list-none p-0 text-xs m-0">
                            <li><Link href="/about" className="hover:text-secondary transition-colors">About Journal</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-secondary transition-colors">Editorial Board</Link></li>
                            <li><Link href="/guidelines" className="hover:text-secondary transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/peer-review" className="hover:text-secondary transition-colors">Peer Review</Link></li>
                            <li><Link href="/ethics" className="hover:text-secondary transition-colors">Publication Ethics</Link></li>
                            <li><Link href="/archives" className="hover:text-secondary transition-colors">Digital Archives</Link></li>
                            <li><Link href="/indexing" className="hover:text-secondary transition-colors">Indexing Hub</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms of Use</Link></li>
                            <li><Link href="/track" className="hover:text-secondary transition-colors">Track Manuscript</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Office</Link></li>
                            <li><Link href="/login" className="hover:text-secondary transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Support — dynamic values from client island */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-white mb-3 border-b border-white/10 pb-2 inline-block m-0">Support HQ</h3>
                            <div className="space-y-2.5">
                                {/* Static — COPE compliance badge */}
                                <div className="flex items-center gap-3 group/support">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:bg-white/10 transition-all">
                                        <ShieldCheck className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 m-0 text-[10px] uppercase font-semibold">COPE Compliant</p>
                                        <p className="text-white m-0 text-xs font-bold">Institutional Standards</p>
                                    </div>
                                </div>

                                {/* Dynamic — phone from Zustand island */}
                                <div className="flex items-center gap-3 group/support">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:bg-white/10 transition-all">
                                        <Phone className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 m-0 text-[10px] uppercase font-semibold">Direct Line</p>
                                        <Suspense><FooterDynamic field="supportPhone" settings={settings} /></Suspense>
                                    </div>
                                </div>

                                {/* Dynamic — address from Zustand island */}
                                <div className="flex items-center gap-3 group/support">
                                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:bg-white/10 transition-all">
                                        <MapPin className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 m-0 text-[10px] uppercase font-semibold">Office Location</p>
                                        <Suspense><FooterDynamic field="officeAddress" className="text-white/80 m-0 text-xs italic" settings={settings} /></Suspense>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-4 border-t border-white/10 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div className="flex flex-col items-center lg:items-start gap-0.5">
                        {/* Dynamic — publisher name + year */}
                        <Suspense><FooterDynamic field="copyright" settings={settings} /></Suspense>
                        <p className="text-white/60 text-[11px] m-0">All Rights Reserved • E-ISSN: 3139-6887</p>
                    </div>

                    {/* Creative Commons Attribution Notice */}
                    <div className="text-center lg:text-left text-xs space-y-0.5">
                        <p className="m-0 text-white/90">
                            Articles licensed under{' '}
                            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 font-semibold underline">
                                Creative Commons Attribution 4.0 International (CC BY 4.0)
                            </a>
                        </p>
                        <p className="m-0 text-[11px] text-white/70 font-medium">
                            Gold Open Access • Permanent CERN Zenodo DOI Archiving
                        </p>
                    </div>

                    {/* Social links — static, zero JS */}
                    <div className="flex items-center gap-2.5">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-200"
                            >
                                <social.icon className="w-3.5 h-3.5" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

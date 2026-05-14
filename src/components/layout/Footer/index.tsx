// Server Component — zero JS shipped for nav links, structure, and social icons
import Link from 'next/link';
import { Phone, MapPin, ShieldCheck } from 'lucide-react';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import { FooterDynamic } from './FooterDynamic';

const socialLinks = [
    { icon: FaFacebook, href: process.env.NEXT_PUBLIC_FACEBOOK_URL || '#', label: 'Facebook' },
    { icon: FaTwitter, href: process.env.NEXT_PUBLIC_TWITTER_URL || '#', label: 'Twitter' },
    { icon: FaInstagram, href: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '#', label: 'Instagram' },
];

export default function Footer() {
    return (
        <footer className="bg-slate-950 text-white pt-10 pb-5 font-sans relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-secondary/50 to-transparent opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/4 right-0 w-64 h-64 bg-secondary/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-responsive">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-6">

                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h1 className="mb-4 text-white m-0">IJITEST</h1>
                            <p className="text-white/70 m-0">
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                            </p>
                        </div>
                    </div>

                    {/* Journal Portals — static, zero JS */}
                    <div className="lg:col-span-2">
                        <h3 className="text-white mb-10 border-b border-white/10 pb-4 inline-block m-0">Journal Portals</h3>
                        <ul className="grid grid-cols-2 gap-x-12 gap-y-4 text-white/70 list-none p-0">
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
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-white mb-10 border-b border-white/10 pb-4 inline-block m-0">Support HQ</h3>
                            <div className="space-y-6 2xl:space-y-12">
                                {/* Static — COPE compliance badge */}
                                <div className="flex items-center gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <ShieldCheck className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 mb-1 m-0 text-xs 2xl:text-base">COPE Compliant</p>
                                        <p className="text-white m-0 font-semibold">Institutional Standards</p>
                                    </div>
                                </div>

                                {/* Dynamic — phone from Zustand island */}
                                <div className="flex items-center gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <Phone className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 mb-1 m-0 text-xs 2xl:text-base">Direct Line</p>
                                        <FooterDynamic field="supportPhone" />
                                    </div>
                                </div>

                                {/* Dynamic — address from Zustand island */}
                                <div className="flex items-center gap-4 group/support">
                                    <div className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover/support:scale-110 group-hover/support:bg-white/10 transition-all duration-500 overflow-hidden relative">
                                        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/support:animate-shine pointer-events-none" />
                                        <MapPin className="w-4 h-4 2xl:w-8 2xl:h-8 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-white/80 mb-1 m-0 text-xs 2xl:text-base">Office Location</p>
                                        <FooterDynamic field="officeAddress" className="text-white/70 m-0 text-sm 2xl:text-lg italic" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center lg:items-start gap-2">
                        {/* Dynamic — publisher name + year */}
                        <FooterDynamic field="copyright" />
                        <p className="opacity-40 m-0">All Rights Reserved</p>
                    </div>

                    {/* Social links — static, zero JS */}
                    <div className="flex items-center gap-4">
                        {socialLinks.map((social) => (
                            <Link
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={social.label}
                                className="w-10 h-10 2xl:w-16 2xl:h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                            >
                                <social.icon className="w-4 h-4 2xl:w-8 2xl:h-8" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}

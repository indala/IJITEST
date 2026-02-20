import Link from 'next/link';
import { Mail, Phone, MapPin, ShieldCheck, Globe } from 'lucide-react';

export default function Footer({ settings }: { settings?: Record<string, string> }) {
    const publisher = settings?.publisher_name || "Felix Academic Publications";
    const copyrightYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-950 text-white pt-20 pb-10 font-sans relative overflow-hidden">
            {/* Background decorative glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="max-w-[1600px] mx-auto px-4 md:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">

                    <div className="lg:col-span-1 space-y-8">
                        <div>
                            <h3 className="text-4xl font-black tracking-tighter text-white mb-4">IJITEST</h3>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary">Institutional Publisher</h4>
                            <p className="text-sm font-black text-white uppercase tracking-wider">{publisher}</p>
                        </div>
                    </div>

                    {/* Journal Portals */}
                    <div className="lg:col-span-2">
                        <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-10 border-b border-white/10 pb-4 inline-block">Journal Portals</h4>
                        <ul className="grid grid-cols-2 gap-x-12 gap-y-4 text-xs font-bold text-slate-400 list-none p-0">
                            <li><Link href="/about" className="hover:text-secondary transition-colors">About Journal</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-secondary transition-colors">Editorial Board</Link></li>
                            <li><Link href="/guidelines" className="hover:text-secondary transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/peer-review" className="hover:text-secondary transition-colors">Peer Review</Link></li>
                            <li><Link href="/ethics" className="hover:text-secondary transition-colors">Publication Ethics</Link></li>
                            <li><Link href="/archives" className="hover:text-secondary transition-colors">Digital Archives</Link></li>
                            <li><Link href="/indexing" className="hover:text-secondary transition-colors">Indexing Hub</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms of Use</Link></li>
                            <li><Link href="/track" className="hover:text-secondary transition-colors">Track Application</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Office</Link></li>
                            <li><Link href="/login" className="hover:text-secondary transition-colors">Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact & Support */}
                    <div className="space-y-10">
                        <div>
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white mb-10 border-b border-white/10 pb-4 inline-block">Support HQ</h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <ShieldCheck className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">COPE Compliant</p>
                                        <span className="text-xs font-black text-white">Institutional Standards</span>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Direct Line</p>
                                        <p className="text-xs font-black text-white">+91 8919643590</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <MapPin className="w-4 h-4 text-secondary" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Office Location</p>
                                        <p className="text-xs font-medium text-slate-400 leading-relaxed">
                                            Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-10 border-t border-white/5 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center lg:items-start gap-2">
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                            &copy; {copyrightYear} <span className="text-white">{publisher}</span>
                        </p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">All Rights Reserved</p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">COPE Protocol</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <Globe className="w-4 h-4 text-blue-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Open Access Hub</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

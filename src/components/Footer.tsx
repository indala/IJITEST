import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Globe, Shield } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-[#0f172a] text-gray-400 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
                    {/* Journal Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-white text-2xl font-serif font-black mb-4 tracking-tighter italic">IJITEST</h3>
                            <p className="text-xs leading-relaxed opacity-60 font-medium italic">
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to elite research dissemination.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-secondary uppercase tracking-[0.3em]">Institutional Publisher</p>
                            <p className="text-sm font-black text-white italic">Felix Academic Publications</p>
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

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em] opacity-40">Journal Portals</h4>
                        <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                            <li><Link href="/about" className="hover:text-secondary transition-colors">About Journal</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-secondary transition-colors">Editorial Board</Link></li>
                            <li><Link href="/guidelines" className="hover:text-secondary transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/peer-review" className="hover:text-secondary transition-colors">Peer Review</Link></li>
                            <li><Link href="/ethics" className="hover:text-secondary transition-colors">Publication Ethics</Link></li>
                        </ul>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em] opacity-40">Resources</h4>
                        <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
                            <li><Link href="/archives" className="hover:text-secondary transition-colors">Digital Archives</Link></li>
                            <li><Link href="/indexing" className="hover:text-secondary transition-colors">Indexing Hub</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms of Use</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Office</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em] opacity-40">Support HQ</h4>
                        <ul className="space-y-6 text-sm">
                            <li className="flex items-start space-x-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-secondary shrink-0">
                                    <Mail className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Editorial Email</p>
                                    <p className="text-white font-bold">editor@ijitest.org</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-emerald-500 shrink-0">
                                    <Phone className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Direct Line</p>
                                    <p className="text-white font-bold">+91 8919643590</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-4">
                                <div className="p-2.5 bg-white/5 rounded-xl text-amber-500 shrink-0">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <div className="text-xs leading-relaxed font-medium">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Office Location</p>
                                    <p className="text-white/80 italic">Felix Academic Publications, Madhurawada, Visakhapatnam, AP, India</p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 mt-20 pt-10 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                    <div className="flex items-center gap-4">
                        <p>© {new Date().getFullYear()} Felix Academic Publications</p>
                        <span className="w-1 h-1 bg-white/50 rounded-full" />
                        <p>All Rights Reserved</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <Shield className="w-3 h-3 text-secondary" />
                            <span>COPE Compliant</span>
                        </div>
                        <div className="flex items-center gap-2 text-white">
                            <Globe className="w-3 h-3" />
                            <span>Open Access Journal</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

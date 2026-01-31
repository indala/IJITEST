import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Journal Info */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-white text-xl font-serif font-bold mb-4 tracking-wider">IJITEST</h3>
                        <p className="text-xs leading-relaxed mb-4 opacity-80">
                            International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to the dissemination of high-quality research.
                        </p>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-secondary uppercase tracking-widest">Published by</p>
                            <p className="text-sm font-serif text-white">Felix Academic Publications</p>
                            <p className="text-[10px] italic opacity-60">(Foundation for Education, Learning, Innovation & Excellence)</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Journal</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-secondary transition-colors">About Journal</Link></li>
                            <li><Link href="/editorial-board" className="hover:text-secondary transition-colors">Editorial Board</Link></li>
                            <li><Link href="/guidelines" className="hover:text-secondary transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/peer-review" className="hover:text-secondary transition-colors">Peer Review Process</Link></li>
                            <li><Link href="/ethics" className="hover:text-secondary transition-colors">Publication Ethics</Link></li>
                        </ul>
                    </div>

                    {/* Important Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Resouces</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/archives" className="hover:text-secondary transition-colors">Archives</Link></li>
                            <li><Link href="/indexing" className="hover:text-secondary transition-colors">Indexing & Abstracting</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-secondary transition-colors">Terms & Conditions</Link></li>
                            <li><Link href="/contact" className="hover:text-secondary transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Contact Office</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>support@ijitest.com</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                                <div>
                                    <span>+91 8919643590</span>
                                    <p className="text-[10px] italic opacity-50">Available for WhatsApp</p>
                                </div>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span className="text-xs leading-relaxed">
                                    Felix Academic Publications,<br />
                                    IJITEST Journal Office, Madhurawada,<br />
                                    Visakhapatnam, Andhra Pradesh, India
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest opacity-60">
                    <p>© {new Date().getFullYear()} Felix Academic Publications. All rights reserved.</p>
                    <p>International Peer-Reviewed Open Access Journal</p>
                </div>
            </div>
        </footer>
    );
}

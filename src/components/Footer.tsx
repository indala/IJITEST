import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Journal Info */}
                    <div className="col-span-1 md:col-span-1">
                        <h3 className="text-white text-xl font-serif font-bold mb-4">IJITEST</h3>
                        <p className="text-sm leading-relaxed mb-4">
                            International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed academic journal dedicated to publishing high-quality research.
                        </p>
                        <p className="text-sm font-medium text-secondary">ISSN: XXXX-XXXX</p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="/guidelines" className="hover:text-white transition-colors">Author Guidelines</Link></li>
                            <li><Link href="/ethics" className="hover:text-white transition-colors">Publication Ethics</Link></li>
                            <li><Link href="/archives" className="hover:text-white transition-colors">Archives</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm">
                            <li><Link href="/submit" className="hover:text-white transition-colors">Submit Paper</Link></li>
                            <li><Link href="/dashboard" className="hover:text-white transition-colors">Track Submission</Link></li>
                            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
                            <li><Link href="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="text-white font-bold mb-4">Contact Us</h4>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start space-x-3">
                                <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>editor@ijitest.com</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <Phone className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>+91 XXXXXXXXXX</span>
                            </li>
                            <li className="flex items-start space-x-3">
                                <MapPin className="w-5 h-5 text-secondary flex-shrink-0" />
                                <span>India</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-xs">
                    <p>© {new Date().getFullYear()} IJITEST. All rights reserved. Managed by IJITEST Editorial Board.</p>
                </div>
            </div>
        </footer>
    );
}

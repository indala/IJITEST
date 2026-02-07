import { Mail, Phone, MapPin, ShieldAlert, ChevronRight } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import ContactForm from '@/features/contact/components/ContactForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function Contact() {

    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Contact Us"
                description="Our editorial team is available to assist you with technical support and general inquiries regarding your manuscript."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Contact', href: '/contact' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Support Info & Form */}
                    <div className="lg:col-span-2 space-y-16">
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 group">
                                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-primary transition-colors">
                                    <Mail className="w-6 h-6 text-primary group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-serif font-black mb-1 text-gray-900 italic">Editorial Email</h3>
                                <p className="text-lg font-black text-primary mb-2">editor@ijitest.org</p>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">24/7 Author Support</p>
                            </div>

                            <div className="bg-gray-50 p-10 rounded-[2.5rem] border border-gray-100 group">
                                <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-gray-100 group-hover:bg-secondary transition-colors">
                                    <Phone className="w-6 h-6 text-secondary group-hover:text-white" />
                                </div>
                                <h3 className="text-xl font-serif font-black mb-1 text-gray-900 italic">WhatsApp Line</h3>
                                <p className="text-lg font-black text-gray-900 mb-2">+91 8919643590</p>
                                <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Immediate Response</p>
                            </div>
                        </section>

                        <section className="bg-white p-12 rounded-[3.5rem] border-2 border-gray-100 shadow-2xl shadow-gray-200/50 relative overflow-hidden">
                            <ContactForm />
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* HQ Address Widget */}
                        <div className="bg-gray-900 p-10 rounded-[2.5rem] text-white overflow-hidden relative shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <MapPin className="w-10 h-10 text-secondary mb-8" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Editorial HQ</h3>
                            <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em] mb-6">Felix Academic Publications</p>
                            <div className="text-sm text-white/60 leading-relaxed font-medium italic space-y-1">
                                <p>IJITEST Journal Office,</p>
                                <p>Madhurawada, Visakhapatnam,</p>
                                <p>Andhra Pradesh, India</p>
                            </div>
                        </div>

                        {/* Ethics Statements */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Policy</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE guidelines to ensure scientific integrity.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Policy <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Track Widget */}
                        <TrackManuscriptWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { Mail, Phone, MapPin, Send, CheckCircle, Search, ChevronRight, ShieldAlert } from 'lucide-react';
import { submitContactMessage } from '@/actions/messages';
import { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import Link from 'next/link';

export default function Contact() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [paperId, setPaperId] = useState('');

    async function handleSubmit(formData: FormData) {
        setStatus('loading');
        const result = await submitContactMessage(formData);
        if (result.success) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 5000);
        } else {
            setStatus('error');
        }
    }

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
                            {status === 'success' ? (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 py-12">
                                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-10 h-10" />
                                    </div>
                                    <h3 className="text-3xl font-serif font-black text-gray-900 italic">Message Transmitted</h3>
                                    <p className="text-gray-500 font-medium max-w-sm italic">Our editorial team will get back to you within 24-48 hours via email.</p>
                                    <button onClick={() => setStatus('idle')} className="text-primary font-black uppercase text-xs tracking-widest hover:underline">New Message</button>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-3xl font-serif font-black mb-12 text-gray-900 italic">Direct Inquiry Form</h3>
                                    <form action={handleSubmit} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Full Name</label>
                                                <input name="name" required className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-gray-400" placeholder="Author Name" />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Email Address</label>
                                                <input name="email" type="email" required className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-gray-400" placeholder="researcher@university.edu" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Subject</label>
                                            <input name="subject" required className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold placeholder:text-gray-400" placeholder="e.g., Status Inquiry for Paper ID: IJITEST-X" />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Message Content</label>
                                            <textarea name="message" rows={6} required className="w-full px-8 py-5 rounded-2xl bg-gray-50 border-2 border-gray-200 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold resize-none placeholder:text-gray-400" placeholder="Provide details of your inquiry here..."></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={status === 'loading'}
                                            className="w-full bg-primary text-white py-6 rounded-2xl flex items-center justify-center gap-4 text-xs font-black uppercase tracking-[0.3em] shadow-xl shadow-primary/20 hover:shadow-2xl transition-all disabled:opacity-50"
                                        >
                                            {status === 'loading' ? 'Transmitting...' : 'Transmit Message'} <Send className="w-5 h-5" />
                                        </button>
                                        {status === 'error' && <p className="text-red-600 text-center font-bold text-sm">Failed to transmit. Please try again.</p>}
                                    </form>
                                </>
                            )}
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
                        <div className="bg-white p-8 rounded-[2.5rem] border-2 border-gray-100 shadow-xl shadow-primary/5">
                            <h3 className="text-xl font-serif font-black mb-6 italic text-gray-900">Quick Track</h3>
                            <input
                                type="text"
                                placeholder="Manuscript ID"
                                value={paperId}
                                onChange={(e) => setPaperId(e.target.value)}
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:border-primary focus:bg-white transition-all text-sm font-bold outline-none mb-4"
                            />
                            <Link
                                href={paperId ? `/track?id=${paperId}` : '#'}
                                className="w-full py-4 bg-primary text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-3"
                            >
                                <Search className="w-4 h-4" /> Track
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

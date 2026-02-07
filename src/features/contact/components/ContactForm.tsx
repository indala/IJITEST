"use client";

import { Send, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { submitContactMessage } from '@/actions/messages';

export default function ContactForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

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

    if (status === 'success') {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 animate-in fade-in zoom-in duration-500 py-12">
                <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif font-black text-gray-900 italic">Message Transmitted</h3>
                <p className="text-gray-500 font-medium max-w-sm italic">Our editorial team will get back to you within 24-48 hours via email.</p>
                <button onClick={() => setStatus('idle')} className="text-primary font-black uppercase text-xs tracking-widest hover:underline">New Message</button>
            </div>
        );
    }

    return (
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
    );
}

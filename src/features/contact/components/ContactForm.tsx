"use client";

import { Send, CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { submitContactMessage } from '@/actions/messages';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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
            <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center space-y-4 sm:space-y-6 animate-in fade-in zoom-in duration-500 bg-white rounded-3xl border border-primary/5 shadow-sm">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-primary tracking-tighter">Message <span className="text-emerald-600">Transmitted</span></h3>
                    <p className="text-primary/60 font-medium max-w-xs mx-auto text-xs sm:text-sm leading-relaxed">Our editorial team will get back to you within 24-48 hours via email.</p>
                </div>
                <Button variant="outline" onClick={() => setStatus('idle')} className="rounded-xl border-primary/20 text-primary hover:bg-primary/5 font-black uppercase text-[10px] tracking-widest mt-4">Send Another Message</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            <div>
                <h3 className="text-xl sm:text-2xl font-black text-primary tracking-tight">Direct Inquiry Form</h3>
                <p className="text-primary/60 text-[11px] sm:text-xs font-medium mt-1">Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <form action={handleSubmit} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2 text-left">
                        <Label className="text-[9px] sm:text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">Full Name</Label>
                        <Input name="name" required className="h-12 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Author Name" />
                    </div>
                    <div className="space-y-2 text-left">
                        <Label className="text-[9px] sm:text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">Email Address</Label>
                        <Input name="email" type="email" required className="h-12 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="researcher@university.edu" />
                    </div>
                </div>
                <div className="space-y-2 text-left">
                    <Label className="text-[9px] sm:text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">Subject</Label>
                    <Input name="subject" required className="h-12 bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm px-4" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                </div>
                <div className="space-y-2 text-left">
                    <Label className="text-[9px] sm:text-[10px] font-black text-primary/70 uppercase tracking-widest pl-1">Message Content</Label>
                    <Textarea name="message" rows={5} required className="bg-white border-slate-200 rounded-xl font-bold text-primary focus-visible:ring-primary/20 shadow-sm p-4 resize-none" placeholder="Provide details of your inquiry here..." />
                </div>

                <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 sm:h-14 bg-primary text-white rounded-xl font-black text-[10px] sm:text-xs uppercase tracking-widest sm:tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                    {status === 'loading' ? (
                        <>Transmitting <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                    ) : (
                        <>Transmit Message <Send className="w-4 h-4 ml-2" /></>
                    )}
                </Button>

                {status === 'error' && (
                    <p className="text-secondary text-center font-bold text-[10px] uppercase tracking-wider">Failed to transmit. Please try again.</p>
                )}
            </form>
        </div>
    );
}

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
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in duration-500">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-foreground">Message Transmitted</h3>
                <p className="text-muted-foreground font-medium max-w-sm text-xs leading-relaxed">Our editorial team will get back to you within 24-48 hours via email.</p>
                <Button variant="link" onClick={() => setStatus('idle')} className="text-primary font-black uppercase text-[10px] tracking-widest">New Message</Button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Direct Inquiry Form</h3>
                <p className="text-muted-foreground text-xs font-medium mt-1">Fill out the form below and we'll get back to you shortly.</p>
            </div>

            <form action={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Full Name</Label>
                        <Input name="name" required className="bg-muted/30 border-border/50 font-bold" placeholder="Author Name" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Email Address</Label>
                        <Input name="email" type="email" required className="bg-muted/30 border-border/50 font-bold" placeholder="researcher@university.edu" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Subject</Label>
                    <Input name="subject" required className="bg-muted/30 border-border/50 font-bold" placeholder="Status Inquiry for Paper ID: IJITEST-X" />
                </div>
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Message Content</Label>
                    <Textarea name="message" rows={5} required className="bg-muted/30 border-border/50 font-bold resize-none" placeholder="Provide details of your inquiry here..." />
                </div>

                <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20"
                >
                    {status === 'loading' ? (
                        <>Transmitting <Loader2 className="w-4 h-4 ml-2 animate-spin" /></>
                    ) : (
                        <>Transmit Message <Send className="w-4 h-4 ml-2" /></>
                    )}
                </Button>

                {status === 'error' && (
                    <p className="text-destructive text-center font-bold text-[10px] uppercase tracking-wider">Failed to transmit. Please try again.</p>
                )}
            </form>
        </div>
    );
}

"use client";

import { Save, Globe, DollarSign, Mail, CheckCircle2, FileText, Upload, ExternalLink, Shield, Building, CreditCard, Headphones } from 'lucide-react';
import { getSettings, updateSettings } from '@/actions/settings';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SystemSettings() {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

    useEffect(() => {
        async function load() {
            const data = await getSettings();
            setSettings(data);
            setLoading(false);
        }
        load();
    }, []);

    async function handleSave(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('saving');
        const formData = new FormData(e.currentTarget);
        const result = await updateSettings(formData);

        if (result.success) {
            setStatus('success');
            // Reload settings to get new URLs
            const updated = await getSettings();
            setSettings(updated);
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
        }
    }

    if (loading) return (
        <div className="p-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="font-black text-primary/40 uppercase tracking-[0.4em] text-[10px] italic animate-pulse">Accessing System Core...</p>
        </div>
    );

    return (
        <form onSubmit={handleSave} className="space-y-8 pb-24">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter italic">System Configuration</h1>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mt-1 italic">Core environment & Asset management</p>
                </div>
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={status === 'saving'}
                        className="h-16 px-10 gap-3 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all italic"
                    >
                        {status === 'saving' ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {status === 'saving' ? "Synchronizing..." : "Commit Protocol"}
                    </Button>
                </div>
            </div>

            {status === 'success' && (
                <div className="p-6 bg-emerald-500/10 text-emerald-600 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-4 border border-emerald-500/20 animate-in fade-in slide-in-from-top-2 italic shadow-inner">
                    <CheckCircle2 className="w-6 h-6" /> Core environment successfully synchronized & architectural assets locked.
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Journal Identity */}
                <Card className="border-primary/5 shadow-vip bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/20" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary shadow-inner">
                                <Globe className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic">Journal Identity</CardTitle>
                        </div>
                        <CardDescription className="text-[10px] font-medium text-primary/40 italic">Global branding & verification metadata.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Journal Designation</Label>
                            <Input
                                name="journal_name"
                                defaultValue={settings.journal_name}
                                className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">Publishing Syndicate</Label>
                            <Input
                                name="publisher_name"
                                defaultValue={settings.publisher_name}
                                placeholder="Felix Academic Publications"
                                className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">SEO Cipher</Label>
                                <Input
                                    name="journal_short_name"
                                    defaultValue={settings.journal_short_name}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] px-1 italic">ISSN Protocol</Label>
                                <Input
                                    name="issn_number"
                                    defaultValue={settings.issn_number}
                                    className="h-14 bg-primary/5 border-primary/5 focus-visible:ring-1 focus-visible:ring-primary/20 font-black text-xs font-mono shadow-inner rounded-2xl italic"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Financial Settings */}
                <Card className="border-primary/5 shadow-vip bg-white overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/20" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-center text-emerald-600 shadow-inner">
                                <CreditCard className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic text-emerald-600">Article Transmission Fees</CardTitle>
                        </div>
                        <CardDescription className="text-[10px] font-medium text-emerald-600/40 italic">Economic parameters for manuscript processing.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] px-1 italic text-emerald-600">Domestic (INR)</Label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600/40 text-sm italic">₹</span>
                                    <Input
                                        name="apc_inr"
                                        defaultValue={settings.apc_inr}
                                        className="h-14 bg-emerald-500/5 border-emerald-500/5 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-500/20 font-black text-sm text-emerald-600 shadow-inner rounded-2xl italic"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] px-1 italic text-emerald-600">International (USD)</Label>
                                <div className="relative">
                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-emerald-600/40 text-sm italic">$</span>
                                    <Input
                                        name="apc_usd"
                                        defaultValue={settings.apc_usd}
                                        className="h-14 bg-emerald-500/5 border-emerald-500/5 pl-10 focus-visible:ring-1 focus-visible:ring-emerald-500/20 font-black text-sm text-emerald-600 shadow-inner rounded-2xl italic"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-emerald-600/60 uppercase tracking-[0.2em] px-1 italic text-emerald-600">Financial Disclosure</Label>
                            <Textarea
                                name="apc_description"
                                defaultValue={settings.apc_description}
                                rows={3}
                                className="bg-emerald-500/5 border-emerald-500/5 focus-visible:ring-1 focus-visible:ring-emerald-500/20 font-medium text-xs text-emerald-900/60 resize-none shadow-inner rounded-3xl p-6 italic"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Manuscript Assets */}
                <Card className="border-primary/5 shadow-vip bg-white lg:col-span-2 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-blue-600/20" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-blue-600 shadow-inner">
                                <Upload className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic text-blue-600">Resource Architecture</CardTitle>
                        </div>
                        <CardDescription className="text-[10px] font-medium text-blue-600/40 italic">Downloadable templates & technical dossiers for stakeholders.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            {/* Manuscript Template */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black text-blue-600/60 uppercase tracking-[0.2em] px-1 italic">Journal Blueprint Dossier (.DOCX / .PDF)</Label>
                                <div className="flex items-center gap-6">
                                    <div className="relative flex-1 group/upload">
                                        <input
                                            type="file"
                                            name="template_url"
                                            accept=".docx,.doc,.pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        />
                                        <div className="w-full bg-blue-600/5 border-2 border-dashed border-blue-600/10 p-10 rounded-[2.5rem] group-hover/upload:bg-blue-600/10 group-hover/upload:border-blue-600/30 transition-all flex flex-col items-center justify-center gap-3 shadow-inner relative overflow-hidden">
                                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                            <Upload className="w-8 h-8 text-blue-600 relative z-10" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] relative z-10 italic">Modify Asset Profile</span>
                                        </div>
                                    </div>
                                    {settings.template_url && (
                                        <div className="flex flex-col gap-3 shrink-0 items-center">
                                            <Button asChild variant="outline" size="icon" className="w-20 h-20 rounded-[1.5rem] bg-white border-blue-600/10 text-blue-600 hover:bg-blue-600/5 shadow-xl transition-all hover:scale-105">
                                                <a href={settings.template_url} target="_blank">
                                                    <FileText className="w-10 h-10" />
                                                </a>
                                            </Button>
                                            <p className="text-[9px] font-black text-blue-600/40 uppercase tracking-tighter text-center max-w-[80px] truncate italic">
                                                {settings.template_url.split('/').pop()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Copyright Form */}
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black text-indigo-600/60 uppercase tracking-[0.2em] px-1 italic">Intellectual Covenant Protocol</Label>
                                <div className="flex items-center gap-6">
                                    <div className="relative flex-1 group/upload">
                                        <input
                                            type="file"
                                            name="copyright_url"
                                            accept=".docx,.doc,.pdf"
                                            className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                        />
                                        <div className="w-full bg-indigo-600/5 border-2 border-dashed border-indigo-600/10 p-10 rounded-[2.5rem] group-hover/upload:bg-indigo-600/10 group-hover/upload:border-indigo-600/30 transition-all flex flex-col items-center justify-center gap-3 shadow-inner relative overflow-hidden">
                                            <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover/upload:opacity-100 transition-opacity" />
                                            <Upload className="w-8 h-8 text-indigo-600 relative z-10" />
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] relative z-10 italic">Modify Asset Profile</span>
                                        </div>
                                    </div>
                                    {settings.copyright_url && (
                                        <div className="flex flex-col gap-3 shrink-0 items-center">
                                            <Button asChild variant="outline" size="icon" className="w-20 h-20 rounded-[1.5rem] bg-white border-indigo-600/10 text-indigo-600 hover:bg-indigo-600/5 shadow-xl transition-all hover:scale-105">
                                                <a href={settings.copyright_url} target="_blank">
                                                    <FileText className="w-10 h-10" />
                                                </a>
                                            </Button>
                                            <p className="text-[9px] font-black text-indigo-600/40 uppercase tracking-tighter text-center max-w-[80px] truncate italic">
                                                {settings.copyright_url.split('/').pop()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Support Infrastructure */}
                <Card className="border-primary/5 shadow-vip bg-white lg:col-span-2 overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500/20" />
                    <CardHeader className="p-8 pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/5 border border-amber-500/10 flex items-center justify-center text-amber-600 shadow-inner">
                                <Headphones className="w-5 h-5" />
                            </div>
                            <CardTitle className="text-xs font-black uppercase tracking-[0.3em] italic text-amber-600">Engagement & Operations</CardTitle>
                        </div>
                        <CardDescription className="text-[10px] font-medium text-amber-600/40 italic">Secure communication channels & logistical center.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-4 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] px-1 italic text-amber-600">Editorial Council Inbox</Label>
                                <Input
                                    name="support_email"
                                    defaultValue={settings.support_email}
                                    placeholder="editor@journal.org"
                                    className="h-14 bg-amber-500/5 border-amber-500/5 focus-visible:ring-1 focus-visible:ring-amber-500/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] px-1 italic text-amber-600">Operations Reference Phone</Label>
                                <Input
                                    name="support_phone"
                                    defaultValue={settings.support_phone}
                                    placeholder="+91 XXXX"
                                    className="h-14 bg-amber-500/5 border-amber-500/5 focus-visible:ring-1 focus-visible:ring-amber-500/20 font-bold text-xs shadow-inner rounded-2xl italic"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black text-amber-600/60 uppercase tracking-[0.2em] px-1 italic text-amber-600">Physical Logistics Center</Label>
                            <Textarea
                                name="office_address"
                                defaultValue={settings.office_address}
                                rows={2}
                                className="bg-amber-500/5 border-amber-500/5 focus-visible:ring-1 focus-visible:ring-amber-500/20 font-bold text-xs resize-none shadow-inner rounded-3xl p-6 italic"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </form>
    );
}

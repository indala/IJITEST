"use client";

import { Save, Globe, DollarSign, Mail, CheckCircle2, ShieldAlert } from 'lucide-react';
import { getSettings, updateSettings } from '@/actions/settings';
import { useState, useEffect } from 'react';

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
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
        }
    }

    if (loading) return <div className="p-20 text-center font-bold text-gray-400 uppercase tracking-widest">Loading Settings...</div>;

    return (
        <form onSubmit={handleSave} className="max-w-4xl space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">System Settings</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Configure journal-wide parameters and automation rules.</p>
                </div>
                <button
                    disabled={status === 'saving'}
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-3 hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                    {status === 'saving' ? 'Saving...' : (
                        <>
                            <Save className="w-5 h-5" /> Save Changes
                        </>
                    )}
                </button>
            </div>

            {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-600 rounded-2xl font-bold flex items-center gap-3 border border-green-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="w-5 h-5" /> Settings updated successfully!
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                {/* Journal Branding */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest border-b border-gray-50 pb-6">
                        <Globe className="w-5 h-5 text-primary" /> Journal Identity
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2 lg:col-span-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Journal Full Name</label>
                            <input
                                name="journal_name"
                                defaultValue={settings.journal_name}
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Short Name / SEO Title</label>
                            <input
                                name="journal_short_name"
                                defaultValue={settings.journal_short_name}
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">ISSN Number</label>
                            <input
                                name="issn_number"
                                defaultValue={settings.issn_number}
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold font-mono"
                            />
                        </div>
                    </div>
                </div>

                {/* Financial Settings */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest border-b border-gray-50 pb-6">
                        <DollarSign className="w-5 h-5 text-secondary" /> Publication Fees (APC)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Indian Authors (INR)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">₹</span>
                                <input
                                    name="apc_inr"
                                    defaultValue={settings.apc_inr}
                                    className="w-full bg-gray-50 border-transparent pl-10 pr-4 py-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-xl text-secondary"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">International Authors (USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-gray-400">$</span>
                                <input
                                    name="apc_usd"
                                    defaultValue={settings.apc_usd}
                                    className="w-full bg-gray-50 border-transparent pl-10 pr-4 py-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-xl text-secondary"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* support Infrastructure */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest border-b border-gray-50 pb-6">
                        <Mail className="w-5 h-5 text-gray-400" /> Support & Office
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Editorial Email</label>
                            <input
                                name="support_email"
                                defaultValue={settings.support_email}
                                placeholder="editor@journal.org"
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Contact Phone</label>
                            <input
                                name="support_phone"
                                defaultValue={settings.support_phone}
                                placeholder="+91 XXXX"
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-500 pl-2">Office Address</label>
                            <textarea
                                name="office_address"
                                defaultValue={settings.office_address}
                                rows={2}
                                className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}

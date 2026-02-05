import { Settings, Save, Mail, Globe, ShieldCheck, DollarSign } from 'lucide-react';

export default function SystemSettings() {
    return (
        <div className="max-w-4xl space-y-12 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-black text-gray-900 mb-2">System Settings</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Configure journal-wide parameters and automation rules.</p>
                </div>
                <button className="bg-primary text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-primary/20 flex items-center gap-3">
                    <Save className="w-5 h-5" /> Save Changes
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {/* Journal Branding */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest border-b border-gray-50 pb-6">
                        <Globe className="w-5 h-5 text-primary" /> Journal Identity
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500">Journal Full Name</label>
                            <input className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold" defaultValue="International Journal of Innovative Trends in Engineering Science and Technology" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500">Short Name / SEO Title</label>
                            <input className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold" defaultValue="IJITEST" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500">ISSN Number</label>
                            <input className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-bold font-mono" defaultValue="XXXX-XXXX" />
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
                            <label className="text-sm font-bold text-gray-500">Indian Authors (INR)</label>
                            <input className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-xl" defaultValue="2500" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-500">International Authors (USD)</label>
                            <input className="w-full bg-gray-50 border-transparent p-4 rounded-xl focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-xl" defaultValue="50" />
                        </div>
                    </div>
                </div>

                {/* Email / SMTP */}
                <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8 opacity-60 grayscale cursor-not-allowed">
                    <div className="flex items-center gap-3 text-gray-900 font-black uppercase text-xs tracking-widest border-b border-gray-50 pb-6">
                        <Mail className="w-5 h-5 text-gray-400" /> SMTP / Email Configuration
                    </div>
                    <p className="text-xs font-bold text-orange-500 bg-orange-50 p-4 rounded-xl">RESEND API INTEGRATION ACTIVE. Manually editing SMTP is disabled in trial mode.</p>
                </div>
            </div>
        </div>
    );
}

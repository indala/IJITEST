import { Scale, FileText, Copyright, ShieldAlert, ChevronRight, Gavel } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function TermsAndConditions() {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Terms & Conditions"
                description="The legal framework governing your academic interactions, submissions, and usage of the IJITEST platform."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Terms & Conditions', href: '/terms' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                By accessing and using the IJITEST platform, you agree to abide by the following terms and conditions. These terms ensure a professional and ethical environment for scientific dissemination.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary/5">
                                <Copyright className="w-24 h-24" />
                            </div>
                            <h2 className="text-3xl font-serif font-black text-primary mb-8 italic">Intellectual Property</h2>
                            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
                                <p>
                                    All content published on this website is the property of Felix Academic Publications. Authors retain the copyright to their work while granting IJITEST a license to publish and distribute the material.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {[
                                        "Open Access Publishing Model",
                                        "Creative Commons Attribution",
                                        "Author Rights Retention",
                                        "Strict Anti-Plagiarism Standards"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="p-1.5 bg-secondary/10 rounded-lg">
                                                <Scale className="w-4 h-4 text-secondary" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-widest leading-snug">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Gavel className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 italic">User Conduct & Libaility</h2>
                            </div>
                            <div className="space-y-6 text-gray-600 font-medium leading-relaxed">
                                <p>
                                    Users are expected to interact with the platform with professional integrity. Any attempt to compromise website security or provide fraudulent data will result in immediate termination of the user account.
                                </p>
                                <p className="italic border-l-4 border-secondary/10 pl-6 text-sm">
                                    IJITEST and its editorial board are not responsible for the opinions expressed in published articles. Scientific accuracy remains the primary responsibility of the contributing authors.
                                </p>
                            </div>
                        </section>

                        <section className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                                <FileText className="w-10 h-10" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-serif font-black text-primary italic">Modifications to Terms</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    Felix Academic Publications reserves the right to modify these terms at any time. Significant changes will be announced on the journal homepage. Continued use of the service implies acceptance of the revised terms.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <TrackManuscriptWidget />

                        {/* Legal Navigation */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic text-white">Legal Framework</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">Explore related policies and author standards.</p>
                            <div className="space-y-4">
                                <Link href="/privacy" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group/link">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Privacy Policy</span>
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </Link>
                                <Link href="/guidelines" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group/link">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Author Guidelines</span>
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </Link>
                            </div>
                        </div>

                        {/* Call for Papers Widget */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Call for Papers</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Submit your manuscript for our inaugural 2026 edition.</p>
                            <Link href="/submit" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">Submit Now</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

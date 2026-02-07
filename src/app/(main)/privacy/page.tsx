import { ShieldCheck, Lock, UserCheck, Eye, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function PrivacyPolicy() {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Privacy Policy"
                description="Our commitment to safeguarding the personal data and scholarly contributions of our global academic community."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Privacy Policy', href: '/privacy' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                IJITEST and Felix Academic Publications respect your privacy. This policy outlines how we collect, use, and protect the information provided by authors, reviewers, and visitors to our platform.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary/5">
                                <Lock className="w-24 h-24" />
                            </div>
                            <h2 className="text-3xl font-serif font-black text-primary mb-8 italic">Information Collection</h2>
                            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
                                <p>
                                    We collect necessary personal data to facilitate the peer-review and publication process, including:
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {[
                                        "Author names and affiliations",
                                        "Contact email addresses",
                                        "Biographical information",
                                        "Orcid IDs and professional links"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <div className="w-2 h-2 bg-secondary rounded-full" />
                                            <span className="text-xs font-black uppercase tracking-widest leading-snug">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                                    <Eye className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 italic">Data Usage & Sharing</h2>
                            </div>
                            <div className="space-y-6 text-gray-600 font-medium">
                                <p>
                                    Your personal information is used exclusively for the administration of the journal. We do not sell or trade your data to third parties. Sharing occurs only in the following contexts:
                                </p>
                                <ul className="space-y-4 list-disc pl-6 italic">
                                    <li>Facilitating communication between authors and the editorial office.</li>
                                    <li>Indexing services (e.g., CrossRef, Google Scholar) upon publication.</li>
                                    <li>Internal administrative reporting for Felix Academic Publications.</li>
                                </ul>
                            </div>
                        </section>

                        <section className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row gap-10 items-center">
                            <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                                <ShieldCheck className="w-10 h-10" />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-xl font-serif font-black text-primary italic">Security Commitment</h3>
                                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                    We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. All submission data is stored on secure, encrypted servers.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <TrackManuscriptWidget />

                        {/* Related Policies */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Legal Links</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">Read our full terms and ethical standards.</p>
                            <div className="space-y-4">
                                <Link href="/terms" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group/link">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Terms & Conditions</span>
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </Link>
                                <Link href="/ethics" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all group/link">
                                    <span className="text-[10px] font-black uppercase text-white tracking-widest">Publication Ethics</span>
                                    <ChevronRight className="w-4 h-4 text-white" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Support */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Need Help?</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">For any privacy-related queries, reach out to our desk.</p>
                            <Link href="/contact" className="w-full py-4 bg-white border border-primary/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center">
                                Contact Privacy Officer
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

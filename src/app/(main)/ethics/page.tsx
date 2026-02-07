import { ShieldCheck, Scale, AlertOctagon, Info, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function PublicationEthics() {

    return (
        <div className="bg-white">
            <PageHeader
                title="Publication Ethics"
                description="Our commitment to scientific integrity, ethical conduct, and the highest standards of academic publishing."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Publication Ethics', href: '/ethics' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                IJITEST follows a rigorous peer-review process and adheres to ethical publishing standards. We are committed to ensuring that all published articles meet the highest academic quality and ethical benchmarks.
                            </p>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 text-primary/5">
                                <AlertOctagon className="w-24 h-24" />
                            </div>
                            <h2 className="text-3xl font-serif font-black text-primary mb-8 italic">Plagiarism Policy</h2>
                            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
                                <p>
                                    IJITEST has a **zero-tolerance policy** towards plagiarism. All submitted manuscripts are checked for originality using advanced anti-plagiarism tools before entering the review phase.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {[
                                        "Strict prohibition of self-plagiarism",
                                        "Mandatory proper citation of sources",
                                        "Immediate rejection for ethical breach",
                                        "Rigorous tool-based verification"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <span className="text-xs font-black uppercase tracking-widest leading-snug">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-serif font-black text-gray-900 mb-8 italic">COPE Compliance</h2>
                            <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10 flex flex-col md:flex-row gap-10 items-center">
                                <div className="w-24 h-24 bg-primary rounded-3xl flex items-center justify-center text-white shrink-0 shadow-xl shadow-primary/20">
                                    <Scale className="w-10 h-10" />
                                </div>
                                <div className="space-y-4">
                                    <p className="text-lg text-gray-600 font-medium italic">
                                        IJITEST strives to follow the guidelines and best practices set by the **Committee on Publication Ethics (COPE)**.
                                    </p>
                                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                                        We handle retractions, professional corrections, and ethical disputes in accordance with these international standards to maintain a clean record of scientific discourse.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <TrackManuscriptWidget />

                        {/* Quick Guidelines */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Author Resources</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Read our full formatting instructions and download templates.</p>
                            <Link href="/guidelines" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">Author Guidelines</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

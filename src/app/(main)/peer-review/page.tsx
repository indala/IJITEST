import { ShieldCheck, Clock, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function PeerReview() {

    return (
        <div className="bg-white">
            <PageHeader
                title="Peer Review Process"
                description="Our rigorous double-blind evaluation system ensures technical accuracy, originality, and scientific impact."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Peer Review', href: '/peer-review' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <div className="bg-primary p-12 rounded-[3.5rem] text-white flex flex-col md:flex-row items-center gap-10 shadow-2xl shadow-primary/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                                <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-12 h-12" />
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-3xl font-serif font-black italic">Double-Blind Policy</h2>
                                    <p className="text-lg text-white/70 font-medium leading-relaxed italic">
                                        IJITEST follows a strict **double-blind peer-review policy**. identities of both authors and reviewers are concealed throughout the process to guarantee an unbiased, objective evaluation.
                                    </p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="text-3xl font-serif font-black text-gray-900 mb-12 italic">Review Stages</h2>
                            <div className="space-y-10">
                                {[
                                    { step: "01", title: "Initial Screening", desc: "The editorial office performs a rapid check for formatting, scope alignment, and plagiarism verification." },
                                    { step: "02", title: "Expert Evaluation", desc: "Manuscripts are distributed to a minimum of two domain experts for deep technical and scientific scrutiny." },
                                    { step: "03", title: "Editorial Decision", desc: "Based on expert recommendations, the Editor-in-Chief issues a final verdict: Accept, Revise, or Reject." }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center font-black text-primary text-xl shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            {item.step}
                                        </div>
                                        <div className="pt-2">
                                            <h3 className="text-xl font-serif font-black text-gray-900 mb-2 italic">{item.title}</h3>
                                            <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col md:flex-row items-center gap-8">
                            <div className="p-5 bg-secondary/10 rounded-2xl text-secondary">
                                <Clock className="w-10 h-10" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-black text-primary mb-2 italic">Rapid Review Timeline</h2>
                                <p className="text-gray-600 font-medium italic italic">
                                    IJITEST is committed to professional velocity. We aim to deliver an initial peer-review decision **within 3-5 Working Days** from the date of submission.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <TrackManuscriptWidget />

                        {/* Reviewer Resources */}
                        <div className="bg-gray-900 p-8 rounded-[2.5rem] text-white group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <h3 className="text-xl font-serif font-black mb-4 italic">Reviewer Panel</h3>
                            <p className="text-xs text-white/50 mb-8 font-medium leading-relaxed uppercase tracking-widest">Global Standards</p>
                            <Link href="/reviewer-guidelines" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all group/link">
                                <span className="text-[10px] font-black uppercase text-white/60 group-hover/link:text-white transition-colors">Reviewer Guides</span>
                                <ChevronRight className="w-4 h-4 text-secondary" />
                            </Link>
                        </div>

                        {/* Quick Guidelines */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic text-white">Ethics Policy</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">Read our full COPE ethical guidelines before reviewing.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Ethics <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

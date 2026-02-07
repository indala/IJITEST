import { ShieldCheck, Info, ChevronRight, Gavel } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function SubmitPaper() {
    return (
        <div className="bg-white min-h-screen">
            <PageHeader
                title="Manuscript Submission"
                description="Join our global community of researchers and innovators. Submit your technical research for world-class indexing and impact."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Submit Paper', href: '/submit' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[3.5rem] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                            <div className="bg-gray-900 p-12 text-white relative overflow-hidden">
                                <div className="relative z-10 space-y-2">
                                    <h2 className="text-3xl font-serif font-black italic">Ready to Publish?</h2>
                                    <p className="text-white/50 text-xs font-black uppercase tracking-[0.3em]">Scientific Excellence Starts Here</p>
                                </div>
                                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                            </div>

                            <div className="p-12">
                                <SubmissionForm />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Status Check */}
                        <TrackManuscriptWidget />

                        {/* Submission Checklist */}
                        <div className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
                            <h3 className="text-xl font-serif font-black text-primary mb-8 italic">Submission Guide</h3>
                            <div className="space-y-6">
                                {[
                                    { title: "Formatting", desc: "Follow IEEE standards" },
                                    { title: "Originality", desc: "Zero-tolerance plagiarism" },
                                    { title: "Ethics", desc: "COPE compliance required" },
                                    { title: "Copyright", desc: "Include signed form" }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-primary/10 flex items-center justify-center shrink-0 shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                            <ShieldCheck className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-900 mb-1">{item.title}</h4>
                                            <p className="text-xs text-gray-500 font-medium italic">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/guidelines" className="mt-10 block w-full py-4 bg-white border border-primary/10 rounded-2xl text-center text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                                Full Author Guidelines
                            </Link>
                        </div>

                        {/* Related Policy Widget */}
                        <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                            <div className="flex items-center gap-3 text-gray-900 font-black mb-6">
                                <Info className="w-6 h-6 text-secondary" />
                                <span className="uppercase tracking-[0.2em] text-xs">Policy Links</span>
                            </div>
                            <div className="space-y-4">
                                <Link href="/ethics" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-secondary group transition-all">
                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Publication Ethics</span>
                                    <ChevronRight className="w-4 h-4 text-secondary" />
                                </Link>
                                <Link href="/terms" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-secondary group transition-all">
                                    <span className="text-[10px] font-black text-gray-400 group-hover:text-gray-900 uppercase tracking-widest transition-colors">Copyright Policy</span>
                                    <ChevronRight className="w-4 h-4 text-secondary" />
                                </Link>
                            </div>
                        </div>

                        {/* Quick Contact */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <h3 className="text-xl font-serif font-black mb-1 italic">Technical Issue?</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium italic mb-8">Reach our support desk for immediate assistance with submissions.</p>
                            <Link href="/contact" className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all group/link">
                                <span className="text-[10px] font-black uppercase text-white tracking-widest">Contact Support</span>
                                <ChevronRight className="w-4 h-4 text-white" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { ChevronRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import SubmissionForm from '@/features/submissions/components/SubmissionForm';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import { Button } from "@/components/ui/button";

const REQUIREMENTS = [
    { title: "Formatting", desc: "Manuscripts must follow the IEEE standard format." },
    { title: "Originality", desc: "Submissions must be original and not published elsewhere." },
    { title: "Ethics", desc: "Full adherence to COPE ethical standards is mandatory." },
    { title: "Copyright", desc: "A signed copyright transfer form is required upon acceptance." }
];

export default function SubmitClient() {

    return (
        <section className="container-responsive py-6 sm:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
                {/* Main Submission Form */}
                <div className="lg:col-span-2 space-y-6">
                    <section className="bg-card border border-border/70 rounded-xl overflow-hidden shadow-2xs">
                        <div className="bg-[#000066] p-4 sm:p-6 text-white relative overflow-hidden">
                            <div className="relative z-10 space-y-1.5">
                                <h2 className="m-0 text-white">Submit Research Manuscript</h2>
                                <p className="text-white/70 m-0 border-l-2 border-white/30 pl-3.5">
                                    Fill in the manuscript details below to submit your research for double-blind peer review.
                                </p>
                            </div>
                        </div>
                        <div className="p-4 sm:p-6">
                            <SubmissionForm />
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-4 sm:space-y-5 lg:sticky lg:top-24">
                    <div className="bg-card p-1 rounded-2xl border border-border/70 shadow-2xs">
                        <TrackManuscriptWidget />
                    </div>

                    <div className="p-4 bg-card border border-border/70 rounded-xl shadow-2xs space-y-3">
                        <h3 className="m-0">Submission Checklist</h3>
                        <div className="space-y-2.5">
                            {REQUIREMENTS.map((item, idx) => (
                                <div key={idx} className="flex gap-2.5 items-start">
                                    <div className="w-4 h-4 rounded-md bg-secondary/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <CheckCircle2 className="w-3 h-3 text-secondary" />
                                    </div>
                                    <div>
                                        <h4 className="text-primary m-0">{item.title}</h4>
                                        <p className="text-muted-foreground m-0 leading-snug">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button asChild size="sm" className="w-full h-8 bg-[#000066] hover:bg-[#000088] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-all">
                            <Link href="/guidelines">View Author Guidelines</Link>
                        </Button>
                    </div>

                    <div className="p-4 bg-[#000066] rounded-xl shadow-md text-white space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                <HelpCircle className="w-4 h-4" />
                            </div>
                            <h3 className="m-0 text-white">Need Support?</h3>
                        </div>
                        <p className="text-white/70 leading-relaxed m-0">
                            Encountering technical issues? Our editorial desk is available to assist you.
                        </p>
                        <Link href="/contact" className="text-xs font-bold text-secondary hover:text-white inline-flex items-center gap-1 m-0 transition-colors pt-1">
                            <span>Contact Support</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                    </div>
                </aside>
            </div>
        </section>
    );
}


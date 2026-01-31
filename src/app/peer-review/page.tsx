import { ShieldCheck, UserCheck, Clock, CheckCircle } from 'lucide-react';

export default function PeerReview() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Peer Review Process</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
                    <section>
                        <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10 flex items-start gap-6">
                            <ShieldCheck className="w-12 h-12 text-primary shrink-0" />
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-primary mb-2">Double-Blind Review Policy</h2>
                                <p className="mb-0">
                                    IJITEST follows a <strong>double-blind peer-review policy</strong>. This means that both the reviewer and author identities are concealed from each other throughout the review process to ensure unbiased and objective evaluation.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-6 underline decoration-secondary decoration-4 underline-offset-8">Review Stages</h2>
                        <div className="space-y-8">
                            <div className="flex gap-6">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Initial Screening</h3>
                                    <p className="text-sm">The editorial office performs a basic check for formatting, scope, and plagiarism.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Expert Review</h3>
                                    <p className="text-sm">Manuscripts are sent to a minimum of two expert reviewers in the relevant field.</p>
                                </div>
                            </div>
                            <div className="flex gap-6">
                                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">3</div>
                                <div>
                                    <h3 className="font-bold text-lg mb-1">Editorial Decision</h3>
                                    <p className="text-sm">Based on the reviewers' feedback, the Editor-in-Chief makes a final decision (Accept, Reject, or Revisions Required).</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4 flex items-center gap-3">
                            <Clock className="text-secondary" /> Review Timeline
                        </h2>
                        <p>
                            IJITEST is committed to a fast-track publication process. We aim to complete the review and provide an initial decision <strong>within 3 Days</strong> of submission.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Reviewer Responsibilities</h2>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Provide honest and constructive feedback.</li>
                            <li>Maintain strict confidentiality of the manuscript.</li>
                            <li>Declare any potential conflicts of interest immediately.</li>
                            <li>Ensure that the research is original and contributes to the field.</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

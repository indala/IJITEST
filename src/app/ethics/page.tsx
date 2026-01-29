import { ShieldCheck, BookOpen, AlertTriangle, Users, Scale, FileText } from 'lucide-react';

export default function EthicsPolicy() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6 text-gray-900">Ethics & Publication Policy</h1>
                <p className="text-gray-500 mb-12 text-lg">
                    IJITEST is committed to maintaining the highest standards of publication ethics. This policy applies to all authors, reviewers, and editors.
                </p>

                <div className="space-y-16">
                    {/* 1. Publication Ethics Statement */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-8 h-8 text-primary" />
                            <h2 className="text-2xl font-bold font-serif text-gray-900">1. Publication Ethics Statement</h2>
                        </div>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            The journal strictly prohibits unethical practices such as plagiarism, data fabrication, falsification, and duplicate submission. We adhere to internationally accepted ethical guidelines for scholarly publishing to ensure integrity and trust.
                        </p>
                    </section>

                    {/* 2. Author Responsibilities */}
                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <div className="flex items-center gap-3 mb-6">
                            <Users className="w-8 h-8 text-primary" />
                            <h2 className="text-2xl font-bold font-serif text-gray-900">2. Author Responsibilities</h2>
                        </div>
                        <ul className="grid gap-4 mt-4">
                            {[
                                "Submission of original and unpublished work.",
                                "Proper citation of all referenced sources.",
                                "Disclosure of any conflicts of interest.",
                                "Ensuring accuracy of data and research results.",
                                "Obtaining ethical approval where required (human/animal studies).",
                                "Agreement that the manuscript is not under review elsewhere."
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-start gap-3 text-gray-700">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2.5"></div>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* 3. Plagiarism Policy */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                            <h2 className="text-2xl font-bold font-serif text-gray-900">3. Plagiarism Policy</h2>
                        </div>
                        <div className="prose prose-gray max-w-none text-gray-600">
                            <p className="mb-4">
                                All submitted manuscripts are screened using industry-standard plagiarism detection software. Manuscripts found violating these standards will be rejected or retracted immediately.
                            </p>
                            <h4 className="font-bold text-gray-900 mb-2">We strictly penalize:</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                <li><strong>Minor Plagiarism:</strong> Copying short phrases without citation (Requires revision).</li>
                                <li><strong>Self-Plagiarism:</strong> Reusing one's own extensive previous work without attribution.</li>
                                <li><strong>Major Plagiarism:</strong> Copying entire concepts, data, or text from other sources.</li>
                            </ul>
                        </div>
                    </section>

                    {/* 4. Peer Review Ethics */}
                    <section>
                        <div className="flex items-center gap-3 mb-6">
                            <Scale className="w-8 h-8 text-primary" />
                            <h2 className="text-2xl font-bold font-serif text-gray-900">4. Peer Review Ethics</h2>
                        </div>
                        <p className="text-gray-600 mb-4">Reviewers are expected to:</p>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-primary/5 rounded-xl text-sm font-medium text-gray-800">Maintain strict confidentiality of manuscripts.</div>
                            <div className="p-4 bg-primary/5 rounded-xl text-sm font-medium text-gray-800">Provide unbiased and constructive feedback.</div>
                            <div className="p-4 bg-primary/5 rounded-xl text-sm font-medium text-gray-800">Declare any conflicts of interest immediately.</div>
                            <div className="p-4 bg-primary/5 rounded-xl text-sm font-medium text-gray-800">Complete reviews within the specified timeframe.</div>
                        </div>
                    </section>

                    {/* Remaining Sections (Grouped for Brevity) */}
                    <div className="space-y-10 border-t border-gray-100 pt-10">
                        {[
                            { title: "5. Editorial Responsibilities", text: "Editors must ensure fair evaluation based solely on academic merit, maintaining confidentiality and managing conflicts of interest transparently." },
                            { title: "6. Data Integrity & Misconduct", text: "Any form of data fabrication, image manipulation, or misleading results will lead to immediate rejection or retraction." },
                            { title: "7. Corrections & Retractions", text: "We facilitate errata for minor errors and formal retractions for serious misconduct. All updates are documented publicly." },
                            { title: "8. Conflict of Interest", text: "All participants (authors, reviewers, editors) must disclose financial, institutional, or personal relationships that may influence the process." },
                            { title: "9. Copyright & Licensing", text: "Authors retain copyright of their work while granting the journal the right to first publication. All articles are open-access." },
                            { title: "10. Open Access & Fees", text: "IJITEST operates on an Open Access model. A transparent Article Processing Charge (APC) applies only upon acceptance." }
                        ].map((section, idx) => (
                            <section key={idx}>
                                <h3 className="text-xl font-bold font-serif text-gray-900 mb-3">{section.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{section.text}</p>
                            </section>
                        ))}
                    </div>

                    {/* Footer Note */}
                    <div className="bg-secondary/5 border border-secondary/10 p-8 rounded-2xl text-center">
                        <FileText className="w-8 h-8 text-secondary mx-auto mb-4" />
                        <p className="text-sm text-gray-600 font-medium italic">
                            "By submitting a manuscript, authors acknowledge that they have read, understood, and agreed to abide by the journal’s Ethics & Publication Policy."
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

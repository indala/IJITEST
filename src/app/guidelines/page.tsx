import { Download, CheckCircle2 } from 'lucide-react';

export default function Guidelines() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6">Author Guidelines</h1>
                <p className="text-gray-500 mb-12">Please read the following instructions carefully before submitting your paper.</p>

                <div className="space-y-12">
                    {/* Download Templates */}
                    <section className="bg-primary/5 p-8 rounded-2xl border border-primary/10">
                        <h2 className="text-2xl font-bold font-serif text-primary mb-4">Paper Templates</h2>
                        <p className="text-gray-600 mb-6">To ensure uniformity, authors must use the IJITEST paper template for formatting.</p>
                        <div className="flex flex-wrap gap-4">
                            <button className="flex items-center gap-2 bg-white border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-all font-bold">
                                <Download className="w-5 h-5" /> Download MS Word Template
                            </button>
                            <button className="flex items-center gap-2 bg-white border border-primary text-primary px-6 py-3 rounded-md hover:bg-primary hover:text-white transition-all font-bold">
                                <Download className="w-5 h-5" /> Copyright Form
                            </button>
                        </div>
                    </section>

                    {/* Submission Steps */}
                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary mb-6">Submission Checklist</h2>
                        <div className="grid gap-4">
                            {[
                                "Manuscript prepared in IIJTEST template format.",
                                "Abstract is within 150-250 words.",
                                "Minimum 5-7 keywords provided.",
                                "Proper citations and references (IEEE/APA style).",
                                "High-quality figures and tables included.",
                                "Plagiarism report is below 15%.",
                                "Author biographies included at the end."
                            ].map((step, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                                    <span className="text-gray-700">{step}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Paper Structure */}
                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary mb-6">Structure of Paper</h2>
                        <div className="prose prose-primary max-w-none text-gray-600">
                            <p>The manuscript should be organized in the following order:</p>
                            <ol className="list-decimal pl-5 space-y-2 mt-4">
                                <li><strong>Title:</strong> Concise and informative.</li>
                                <li><strong>Authors:</strong> Names, affiliations, and email addresses.</li>
                                <li><strong>Abstract:</strong> Summary of research objectives and results.</li>
                                <li><strong>Keywords:</strong> Relevant terms for indexing.</li>
                                <li><strong>Introduction:</strong> Background and problem definition.</li>
                                <li><strong>Literature Review:</strong> Previous research in the field.</li>
                                <li><strong>Methodology:</strong> Technical approach and materials.</li>
                                <li><strong>Results & Discussion:</strong> Analysis and interpretation.</li>
                                <li><strong>Conclusion:</strong> Final summary and future scope.</li>
                                <li><strong>References:</strong> List of all sources cited.</li>
                            </ol>
                        </div>
                    </section>

                    {/* Fees */}
                    <section className="border-t border-gray-100 pt-12">
                        <h2 className="text-2xl font-bold font-serif text-primary mb-4">Publication Charges</h2>
                        <p className="text-gray-600 mb-4">
                            IJITEST is an open-access journal. To cover the cost of publication, peer-review, and indexing, authors are required to pay a processing fee after the paper is accepted.
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="p-6 border border-gray-200 rounded-xl text-center">
                                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest block mb-2">Indian Authors</span>
                                <span className="text-3xl font-black text-gray-900">₹ 2500</span>
                                <span className="text-gray-400 text-sm block mt-1">Per Paper</span>
                            </div>
                            <div className="p-6 border border-gray-200 rounded-xl text-center">
                                <span className="text-gray-500 uppercase text-xs font-bold tracking-widest block mb-2">International Authors</span>
                                <span className="text-3xl font-black text-gray-900">$ 50</span>
                                <span className="text-gray-400 text-sm block mt-1">Per Paper</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

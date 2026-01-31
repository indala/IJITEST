import { Download, FileText, CheckCircle } from 'lucide-react';

export default function AuthorGuidelines() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Author Guidelines</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
                    <section className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-6">Manuscript Preparation</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h3 className="font-bold text-gray-900 border-b pb-2">Paper Format</h3>
                                <ul className="text-sm space-y-2">
                                    <li>• Font: Times New Roman</li>
                                    <li>• Font Size: 10 (Main text), 9 (Abstract)</li>
                                    <li>• Minimum Keywords: 4</li>
                                    <li>• Sections: Intro, Related Work, Method, Results, Conclusion</li>
                                </ul>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-primary/10 flex flex-col items-center text-center">
                                <FileText className="w-12 h-12 text-primary mb-4" />
                                <h4 className="font-bold mb-2">Paper Template</h4>
                                <p className="text-xs text-gray-500 mb-6">Download the official IJITEST word template to prepare your manuscript.</p>
                                <a
                                    href="/docs/template.docx"
                                    download
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                >
                                    <Download className="w-4 h-4" /> Download Template
                                </a>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-6 underline decoration-secondary decoration-4 underline-offset-8">Submission Process</h2>
                        <div className="space-y-6">
                            <p>Authors can submit their original research articles, review papers, and survey papers through our online submission portal or via email.</p>
                            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Email Submission</p>
                                    <p className="font-bold text-primary">support@ijitest.com</p>
                                </div>
                                <a href="mailto:support@ijitest.com" className="btn-outline px-6 py-2 text-sm">Send Email</a>
                            </div>
                        </div>
                    </section>

                    <section className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-xl">
                        <h2 className="text-2xl font-serif font-bold mb-8">Article Publication Fee (APC)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-secondary font-black text-2xl">₹2000</p>
                                <p className="text-xs font-bold uppercase tracking-widest mt-2">India</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-secondary font-black text-2xl">$52</p>
                                <p className="text-xs font-bold uppercase tracking-widest mt-2">Africa</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <p className="text-secondary font-black text-2xl">$59</p>
                                <p className="text-xs font-bold uppercase tracking-widest mt-2">Global / Others</p>
                            </div>
                        </div>
                        <p className="text-xs text-white/50 mt-8 text-center italic">
                            * APC includes crossref DOI, e-certificates for all authors, and open-access hosting.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Copyright Transfer</h2>
                        <p>
                            Once the paper is accepted, authors must transfer the copyright form to the IJITEST journal office.
                        </p>
                        <a
                            href="/docs/copyright form.pdf"
                            download
                            className="inline-flex items-center gap-2 text-primary font-bold hover:underline mt-4"
                        >
                            <Download className="w-5 h-5" /> Download Copyright Form
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

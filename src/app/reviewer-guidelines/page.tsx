export default function ReviewerGuidelines() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Reviewer Guidelines</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4 underline decoration-secondary decoration-4 underline-offset-8">Reviewer Roles</h2>
                        <p>
                            Reviewers play a critical role in maintaining the academic integrity and quality of the research published in IJITEST. Their primary responsibility is to provide an objective, critical, and constructive evaluation of the submitted manuscripts.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Review Criteria</h2>
                        <ul className="list-disc pl-5 mt-4 space-y-3 text-sm font-medium">
                            <li><strong>Originality:</strong> Does the work contain significant new research or innovative ideas?</li>
                            <li><strong>Methodology:</strong> Is the research design and methodology sound and appropriate?</li>
                            <li><strong>Clarity:</strong> Is the paper well-written and easy to understand?</li>
                            <li><strong>Contribution:</strong> Does it provide value to the field of Engineering, Science, Technology, or Management?</li>
                            <li><strong>Ethical Standards:</strong> Are there any ethical concerns regarding the research or authorship?</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Confidentiality Policy</h2>
                        <p>
                            Reviewers must treat manuscripts as confidential documents. They should not share, discuss, or use the content of the manuscript for their own benefit or for the benefit of others before it is published.
                        </p>
                    </section>

                    <section className="bg-primary p-10 rounded-3xl text-white">
                        <h3 className="text-xl font-bold mb-4">Interested in Reviewing?</h3>
                        <p className="mb-6 opacity-90">We are always looking for experts to join our reviewer panel. Please share your profile/resume to:</p>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <a href="mailto:support@ijitest.com" className="bg-white text-primary px-6 py-3 rounded-xl font-bold text-center">support@ijitest.com</a>
                            <a href="https://wa.me/918919643590" className="bg-green-500 text-white px-6 py-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                                WhatsApp: +91 8919643590
                            </a>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

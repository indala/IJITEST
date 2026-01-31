export default function PublicationEthics() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Publication Ethics</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4 underline decoration-secondary decoration-4 underline-offset-8">Ethics Statement</h2>
                        <p>
                            IJITEST follows a rigorous peer-review process and adheres to ethical publishing standards. We are committed to ensuring that all published articles meet the highest academic quality and ethical benchmarks.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-3xl border border-gray-100">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Plagiarism Policy</h2>
                        <p>
                            IJITEST has a zero-tolerance policy towards plagiarism. All submitted manuscripts are checked for originality using advanced anti-plagiarism software.
                        </p>
                        <ul className="list-disc pl-5 mt-4 space-y-2 text-sm font-medium">
                            <li>Self-plagiarism and redundant publication are strictly prohibited.</li>
                            <li>Proper citation and attribution are required for all references.</li>
                            <li>If plagiarism is detected at any stage of the review or publication process, the manuscript will be rejected immediately.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4">Conflict of Interest</h2>
                        <p>
                            Authors must disclose any financial or personal relationships that could be perceived as influencing their research. Reviewers and editors are also required to declare any conflicts of interest before handling a manuscript.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-4 underline decoration-secondary decoration-4 underline-offset-8">COPE Compliance</h2>
                        <p>
                            IJITEST strives to follow the guidelines and best practices set by the <strong>Committee on Publication Ethics (COPE)</strong>. We handle retractions, corrections, and ethical disputes in accordance with these international standards.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

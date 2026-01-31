export default function Indexing() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6 text-primary uppercase">Indexing & Abstracting</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-12">
                    <section>
                        <p className="text-lg">
                            IJITEST is committed to high visibility and global accessibility of our published research. We are continuously working on indexing our content in major academic databases.
                        </p>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Indexing Status</p>
                            <h3 className="text-xl font-bold font-serif mb-2">Applied For</h3>
                            <p className="text-sm text-gray-500 max-w-[200px]">We are in the process of indexing with major platforms like Google Scholar, CrossRef, and more.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex flex-col items-center justify-center text-center">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Article Identifier</p>
                            <h3 className="text-xl font-bold font-serif mb-2">CrossRef DOI</h3>
                            <p className="text-sm text-gray-500 max-w-[200px]">A unique CrossRef DOI is assigned to every article published in IJITEST.</p>
                        </div>
                    </section>

                    <section className="bg-primary/5 p-10 rounded-[3rem] border border-primary/10">
                        <h2 className="text-2xl font-serif font-bold text-primary mb-6">Future Indexing Goals</h2>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                "Google Scholar",
                                "CrossRef",
                                "ROAD (ISSN Directory)",
                                "UGC CARE (Future Objective)",
                                "OpenAIRE",
                                "ResearchGate"
                            ].map((item, idx) => (
                                <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
}

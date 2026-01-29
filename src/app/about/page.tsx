export default function About() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6">About the Journal</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary">Overview</h2>
                        <p>
                            The <strong>International Journal of Innovative Trends in Engineering Science and Technology (IJITEST)</strong> is an international, open-access, peer-reviewed academic journal.
                            Our mission is to provide a dedicated platform for researchers, academicians, and professionals to share innovative ideas and significant research findings across various disciplines of engineering and science.
                        </p>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                        <h2 className="text-2xl font-bold font-serif text-primary">Aim and Objectives</h2>
                        <ul className="list-disc pl-5 space-y-2 mt-4 text-gray-600">
                            <li>To provide a platform for high-quality research publication.</li>
                            <li>To promote interdisciplinary research in engineering and technology.</li>
                            <li>To ensure academic excellence through a rigorous peer-review process.</li>
                            <li>To make research findings freely accessible to the global scientific community.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary">Research Disciplines Covered</h2>
                        <p>IJITEST covers a wide range of topics, including but not limited to:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            {[
                                "Computer Science and Engineering",
                                "Information Technology",
                                "Electronics and Communication",
                                "Electrical Engineering",
                                "Mechanical Engineering",
                                "Civil Engineering",
                                "Applied Sciences",
                                "Innovative Technology Trends"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-gray-600">
                                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary">Publication Frequency</h2>
                        <p>IJITEST is published <strong>Bi-Monthly</strong> (6 issues per year), ensuring timely dissemination of research work.</p>
                    </section>

                    <section className="border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-bold font-serif text-primary">Ethics and Originality</h2>
                        <p>
                            We maintain strict standards for originality. Every submission undergoes a plagiarism check.
                            Authors are expected to submit original work that has not been previously published or is under consideration elsewhere.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}

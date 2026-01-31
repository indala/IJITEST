export default function About() {
    return (
        <div className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-8 border-l-4 border-secondary pl-6">About the Journal</h1>

                <div className="prose prose-lg max-w-none text-gray-700 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary">Overview</h2>
                        <div className="space-y-6">
                            <p>
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles in Engineering, Science, Technology, and Management. The journal encourages interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and managerial practices across emerging and established domains.
                            </p>
                            <p>
                                International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management. The journal covers fundamental and applied research, interdisciplinary studies, and emerging technologies that contribute to academic knowledge, industrial growth, and sustainable development. IJITEST follows a rigorous peer-review process and adheres to ethical publishing standards.
                            </p>
                        </div>
                    </section>

                    <section className="bg-gray-50 p-8 rounded-xl border border-gray-100">
                        <h2 className="text-2xl font-bold font-serif text-primary">Journal Details</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">Year of Commencement</h4>
                                <p className="text-gray-600">2026</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">Publication Frequency</h4>
                                <p className="text-gray-600">Monthly (One volume with 12 issues per year)</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">E-ISSN</h4>
                                <p className="text-gray-600 font-serif italic text-xs">applied for</p>
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">Publication Format</h4>
                                <p className="text-gray-600">Online, Open Access</p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold font-serif text-primary">Aim and Scope</h2>
                        <p className="italic">
                            The International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) invites original research articles, review papers, and survey papers from researchers, academicians, and industry professionals.
                        </p>
                        <p className="font-bold text-sm mb-4 uppercase tracking-wide">Areas of interest include, but are not limited to:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "All Engineering Disciplines",
                                "Science and Applied Sciences",
                                "Technology and Innovation",
                                "Computer Science and Information Technology",
                                "Artificial Intelligence, Machine Learning, and Data Science",
                                "Electronics, Electrical, and Communication Engineering",
                                "Mechanical and Civil Engineering",
                                "Internet of Things (IoT), Robotics, and Automation",
                                "Renewable Energy and Sustainable Technologies",
                                "Management Studies, Business Administration, and Technology Management"
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-gray-600">
                                    <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>
                                    <span className="text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-sm italic font-medium text-primary">
                            Interdisciplinary and innovative research across Engineering, Science, Technology, and Management is highly encouraged.
                        </p>
                    </section>

                    <section className="border-t border-gray-100 pt-8">
                        <h2 className="text-2xl font-bold font-serif text-primary">About Publisher</h2>
                        <div className="space-y-4">
                            <p className="font-bold text-gray-900 text-xl tracking-tight">Felix Academic Publications</p>
                            <p className="text-sm text-gray-500 italic font-serif">
                                (Foundation for Education, Learning, Innovation & Excellence)
                            </p>
                            <p className="text-sm leading-relaxed">
                                IJITEST is an international, peer-reviewed scholarly journal that publishes original research articles, review papers, and survey articles in the fields of engineering, science, technology, and management. The journal promotes innovative research, academic excellence, and global knowledge dissemination among academicians, researchers, and industry professionals.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

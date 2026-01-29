import { Download, Calendar, User, FileText } from 'lucide-react';
import Link from 'next/link';

const volumes = [
    {
        volume: 10,
        issue: 5,
        year: 2025,
        month: "Oct - Dec",
        papers: [
            {
                id: "IJITEST-V10-I5-01",
                title: "Advancements in Machine Learning for Renewable Energy Optimization",
                authors: "A. Sharma, R. Kumar",
                pages: "12-25",
                doi: "10.1234/ijitest.2025.1051"
            },
            {
                id: "IJITEST-V10-I5-02",
                title: "A Comparative Study of Blockchain Protocol Security in Decentralized Finance",
                authors: "Sarah Jenkins, Michael Zhang",
                pages: "26-40",
                doi: "10.1234/ijitest.2025.1052"
            }
        ]
    },
    {
        volume: 10,
        issue: 4,
        year: 2025,
        month: "July - Sep",
        papers: [
            {
                id: "IJITEST-V10-I4-12",
                title: "Smart Grid Integration using IoT and Edge Computing: A Review",
                authors: "P. V. Reddy",
                pages: "105-118",
                doi: "10.1234/ijitest.2025.10412"
            }
        ]
    }
];

export default function Archives() {
    return (
        <div className="py-20 bg-gray-50/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6">Journal Archives</h1>
                <p className="text-gray-500 mb-12 text-lg">Browse through all published research papers and issues.</p>

                <div className="space-y-16">
                    {volumes.map((vol, idx) => (
                        <section key={idx}>
                            <div className="flex items-center gap-4 mb-8 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                                <div className="bg-primary/10 p-4 rounded-xl">
                                    <Calendar className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold font-serif text-gray-900">Volume {vol.volume}, Issue {vol.issue}</h2>
                                    <p className="text-gray-500 font-medium">{vol.month} {vol.year}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {vol.papers.map((paper) => (
                                    <div key={paper.id} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                            <div className="flex-1">
                                                <span className="inline-block bg-primary/5 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest mb-3">Research Article</span>
                                                <h3 className="text-xl font-bold font-serif leading-snug mb-3 hover:text-primary cursor-pointer transition-colors">
                                                    {paper.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4" />
                                                        <span>{paper.authors}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="w-4 h-4" />
                                                        <span>Pages: {paper.pages}</span>
                                                    </div>
                                                    <div className="font-mono text-[10px] bg-gray-100 px-2 py-0.5 rounded uppercase tracking-tighter">
                                                        ID: {paper.id}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-400 font-medium">
                                                    DOI: <Link href={`https://doi.org/${paper.doi}`} className="hover:text-primary underline">{paper.doi}</Link>
                                                </div>
                                            </div>
                                            <div className="flex flex-row md:flex-col gap-3">
                                                <button className="flex items-center justify-center gap-2 bg-primary text-white text-sm font-bold px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-sm">
                                                    <Download className="w-4 h-4" /> Full PDF
                                                </button>
                                                <button className="flex items-center justify-center gap-2 border border-gray-200 text-gray-700 text-sm font-bold px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                                    View Abstract
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </div>
        </div>
    );
}

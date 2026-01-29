import { Search, Globe, Database, Award } from 'lucide-react';

const indexingServices = [
    {
        name: "Google Scholar",
        description: "Wide indexing for broader academic citations and reach.",
        icon: <Globe className="w-10 h-10 text-blue-600" />
    },
    {
        name: "CrossRef (DOI)",
        description: "Every published paper is assigned a unique Digital Object Identifier.",
        icon: <Search className="w-10 h-10 text-orange-600" />
    },
    {
        name: "ROAD",
        description: "Directory of Open Access Scholarly Resources.",
        icon: <Database className="w-10 h-10 text-green-600" />
    },
    {
        name: "ResearchGate",
        description: "Connected with a global network of scientists and researchers.",
        icon: <Award className="w-10 h-10 text-blue-400" />
    }
];

export default function Indexing() {
    return (
        <div className="py-20 bg-gray-50/30">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-serif font-black mb-4 border-l-4 border-secondary pl-6 text-primary">Indexing & Abstracting</h1>
                <p className="text-gray-500 mb-16 text-lg">Demonstrating visibility and academic recognition across global platforms.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {indexingServices.map((service, idx) => (
                        <div key={idx} className="bg-white p-10 rounded-3xl border border-gray-100 flex items-start gap-8 hover:shadow-lg transition-all">
                            <div className="bg-gray-50 p-5 rounded-2xl flex-shrink-0">
                                {service.icon}
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold font-serif mb-3">{service.name}</h3>
                                <p className="text-gray-600 leading-relaxed">{service.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 bg-primary text-white p-12 rounded-[3rem] text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-serif font-bold mb-6">Want to check our indexing status?</h2>
                        <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg">
                            We are constantly working to expand our indexing presence in major databases like Scopus and Web of Science.
                        </p>
                        <button className="bg-white text-primary px-10 py-4 rounded-xl font-bold hover:shadow-xl transition-all">
                            View Journal Metrics
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-24 translate-x-24"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
                </div>
            </div>
        </div>
    );
}

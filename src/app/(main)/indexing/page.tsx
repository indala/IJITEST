import { Search, Database } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import RoadmapSection from '@/features/indexing/components/RoadmapSection';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';
import EthicsWidget from '@/features/shared/widgets/EthicsWidget';
import ResourceDeskWidget from '@/features/shared/widgets/ResourceDeskWidget';

export default function Indexing() {
    return (
        <div className="bg-white">
            <PageHeader
                title="Indexing & Abstracting"
                description="Ensuring high visibility, global accessibility, and permanent digital archiving for all research published in IJITEST."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'Indexing', href: '/indexing' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <p className="text-xl font-medium leading-relaxed text-gray-600 italic border-l-4 border-primary/20 pl-8">
                                IJITEST is committed to maximizing the reach and impact of your research. We ensure that every published article is easily discoverable through major academic engines and permanent digital repositories.
                            </p>
                        </section>

                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                <div className="p-4 bg-primary/5 rounded-2xl text-primary mb-6 group-hover:rotate-12 transition-transform">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Live Discovery</h3>
                                <p className="text-2xl font-serif font-black text-gray-900 italic mb-4">Applied & Verified</p>
                                <p className="text-sm font-medium text-gray-500 max-w-[240px]">We are actively indexing with Google Scholar, CrossRef, and OpenAIRE for immediate visibility.</p>
                            </div>

                            <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100 flex flex-col items-center text-center group hover:bg-white hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                <div className="p-4 bg-secondary/5 rounded-2xl text-secondary mb-6 group-hover:-rotate-12 transition-transform">
                                    <Database className="w-8 h-8" />
                                </div>
                                <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Permanent ID</h3>
                                <p className="text-2xl font-serif font-black text-gray-900 italic mb-4">CrossRef DOI</p>
                                <p className="text-sm font-medium text-gray-500 max-w-[240px]">A unique digital identifier is assigned to every manuscript to ensure permanent citation tracking.</p>
                            </div>
                        </section>

                        <RoadmapSection />
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        <TrackManuscriptWidget />
                        <EthicsWidget />
                        <ResourceDeskWidget />
                    </div>
                </div>
            </div>
        </div>
    );
}

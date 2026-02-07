import { BookOpen, Target, Building2, ChevronRight, ShieldAlert } from 'lucide-react';
import PageHeader from "@/components/layout/PageHeader";
import Link from 'next/link';
import TrackManuscriptWidget from '@/features/shared/widgets/TrackManuscriptWidget';

export default function About() {

    return (
        <div className="bg-white">
            <PageHeader
                title="About the Journal"
                description="International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a pioneer in global academic dissemination."
                breadcrumbs={[
                    { name: 'Home', href: '/' },
                    { name: 'About', href: '/about' },
                ]}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-16">
                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-secondary/10 rounded-2xl text-secondary">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 italic">Journal Overview</h2>
                            </div>
                            <div className="prose prose-lg max-w-none text-gray-600 space-y-6 font-medium">
                                <p>
                                    International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles in Engineering, Science, Technology, and Management.
                                </p>
                                <p>
                                    The journal encourages interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and managerial practices. IJITEST follows a rigorous peer-review process and adheres to the highest ethical publishing standards.
                                </p>
                            </div>
                        </section>

                        <section className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
                            <h2 className="text-2xl font-serif font-black text-primary mb-10 italic">Technical Specifications</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                {[
                                    { label: "Commencement", value: "2026" },
                                    { label: "Frequency", value: "Regularly Published" },
                                    { label: "E-ISSN", value: "Applied For" },
                                    { label: "Format", value: "Online, Open Access" }
                                ].map((item, i) => (
                                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                        <h4 className="font-black text-[10px] text-gray-400 uppercase tracking-widest mb-1">{item.label}</h4>
                                        <p className="text-lg font-bold text-gray-900">{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Target className="w-6 h-6" />
                                </div>
                                <h2 className="text-3xl font-serif font-black text-gray-900 italic">Aim & Scope</h2>
                            </div>
                            <p className="text-lg text-gray-600 font-medium italic mb-8 border-l-4 border-secondary/20 pl-8">
                                We invite original research from academicians and industry professionals across all established and emerging scientific domains.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Electronic & Communication Engineering",
                                    "AI, Machine Learning & Data Science",
                                    "Renewable Energy Systems",
                                    "Sustainable Management Practices",
                                    "IoT and Robotics Engineering",
                                    "Civil and Structural Innovation"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <div className="w-2 h-2 bg-secondary rounded-full" />
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-700">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-gray-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                            <div className="flex items-center gap-4 mb-8">
                                <Building2 className="w-10 h-10 text-secondary" />
                                <h2 className="text-3xl font-serif font-black italic">About Publisher</h2>
                            </div>
                            <div className="space-y-6">
                                <p className="text-2xl font-black text-white italic">Felix Academic Publications</p>
                                <p className="text-sm text-white/50 font-medium uppercase tracking-[0.2em]">Foundation for Education, Learning, Innovation & Excellence</p>
                                <p className="text-lg text-white/70 leading-relaxed font-medium italic">
                                    IJITEST is mentored by Felix Academic Publications, a global leader in academic excellence and scientific dissemination. We promote innovative research and global knowledge sharing.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Utilities */}
                    <div className="space-y-10">
                        {/* Quick Track Widget */}
                        <TrackManuscriptWidget />

                        {/* Ethics Statements */}
                        <div className="bg-secondary p-8 rounded-[2.5rem] text-white shadow-xl shadow-secondary/20 group">
                            <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 transition-transform" />
                            <h3 className="text-xl font-serif font-black mb-2 italic">Ethics Policy</h3>
                            <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed italic">IJITEST follows COPE guidelines to ensure scientific integrity.</p>
                            <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                                View Policy <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Quick Guidelines */}
                        <div className="bg-primary/5 p-8 rounded-[2.5rem] border-2 border-primary/10 group">
                            <h4 className="text-lg font-black text-primary mb-2 italic tracking-tight">Call for Papers</h4>
                            <p className="text-xs text-gray-500 mb-6 font-medium">Submit your manuscript for our inaugural 2026 edition.</p>
                            <Link href="/submit" className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/10 hover:border-primary transition-all group/link shadow-sm">
                                <span className="text-[10px] font-black uppercase text-gray-400 group-hover/link:text-primary transition-colors">Submit Now</span>
                                <ChevronRight className="w-4 h-4 text-primary" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

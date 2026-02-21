'use client'

import { BookOpen, Target, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutClient() {
    return (
        <div className="lg:col-span-2 space-y-12 sm:space-y-16">
            <section className="relative group">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-secondary/5 rounded-2xl text-secondary border border-secondary/10 shadow-vip group-hover:scale-110 transition-transform duration-500">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black text-primary tracking-tighter">Journal <span>Overview</span></h2>
                </div>
                <div className="text-base sm:text-lg text-primary/80 space-y-6 font-medium leading-relaxed border-l-[3px] border-primary/10 pl-8">
                    <p>
                        International Journal of Innovative Trends in Engineering Science and Technology (IJITEST) is a prestigious international, peer-reviewed journal focusing on rapid yet rigorous peer review for application-oriented research.
                    </p>
                    <p>
                        IJITEST follows a rigorous process and adheres to the highest ethical publishing standards guided by COPE principles, ensuring every manuscript receives elite editorial attention.
                    </p>
                </div>
            </section>

            <section className="bg-white p-8 sm:p-10 rounded-[3rem] border border-primary/5 shadow-vip relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                <h2 className="text-2xl font-black text-primary mb-8 tracking-tighter flex items-center gap-2">
                    <div className="w-8 h-[2px] bg-secondary" />
                    Technical Specifications
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {[
                        { label: "Commencement", value: "2026" },
                        { label: "Frequency", value: "Monthly" },
                        { label: "E-ISSN", value: "Applied For" },
                        { label: "Format", value: "Online, Open Access" }
                    ].map((item, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-background border border-primary/5 shadow-sm group/spec hover:border-secondary/20 transition-all duration-500">
                            <h4 className="font-black text-[9px] text-primary/40 uppercase tracking-[0.2em] mb-2 group-hover/spec:text-secondary transition-colors">{item.label}</h4>
                            <p className="text-lg font-black text-primary tracking-tight">{item.value}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-8">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-3 bg-primary/5 rounded-2xl text-primary border border-primary/10 shadow-vip">
                        <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-black text-primary tracking-tighter">Aim & <span>Scope</span></h2>
                </div>

                <div className="p-6 bg-slate-50 border-l-4 border-secondary rounded-r-2xl shadow-sm">
                    <p className="text-base sm:text-lg text-primary/70 font-bold leading-relaxed">
                        "Interdisciplinary work combining engineering with management, sustainability, and data-driven innovation."
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { title: "AI, ML & Data Science", desc: "prediction models, optimization, explainable AI" },
                        { title: "Renewable Energy", desc: "solar, wind, smart grids, storage" },
                        { title: "Electronic & Comm.", desc: "VLSI, signal processing, networks" },
                        { title: "IoT and Robotics", desc: "automation, humanoid robotics, sensors" },
                        { title: "Sustainable Mgmt.", desc: "green business, circular economy" },
                        { title: "Civil Innovation", desc: "structural health, smart materials" }
                    ].map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex flex-col gap-1 p-5 bg-white rounded-2xl border border-primary/5 shadow-vip hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-500 group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-secondary rounded-full group-hover:scale-150 transition-transform" />
                                <span className="text-[11px] font-black uppercase tracking-[0.15em] text-primary/70 group-hover:text-primary transition-colors">{item.title}</span>
                            </div>
                            <p className="text-[11px] text-primary/50 font-medium ml-5">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            <section className="bg-primary p-10 sm:p-12 mt-4 rounded-[2rem] text-white relative overflow-hidden shadow-lg border border-white/5 group/publisher">
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[120px] group-hover/publisher:bg-white/10 transition-colors duration-1000 pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-[90px] group-hover/publisher:bg-white/10 transition-colors duration-1000 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20">
                            <Building2 className="w-9 h-9 text-secondary" />
                        </div>
                        <h2 className="text-3xl text-white font-black tracking-tighter">About <span className="text-secondary ps-2">Publisher</span></h2>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <p className="text-2xl font-black text-white tracking-tight mb-1">Felix Academic Publications</p>
                            <p className="text-[10px] text-white/60 font-black uppercase tracking-[0.3em]">Foundation for Education, Innovation & Excellence</p>
                        </div>
                        <div className="text-base sm:text-lg text-white/70 leading-relaxed font-medium space-y-6 max-w-2xl border-l-2 border-white/10 pl-8">
                            <p>
                                Felix Academic Publications is a mission-driven organization dedicated to bridging the gap between theoretical research and industrial application.
                            </p>
                            <p>
                                Support for IJITEST ensures a stable, high-impact platform for researchers, backed by professional editorial handling and global visibility.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

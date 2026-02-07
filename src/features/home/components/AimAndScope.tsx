"use client";
import { motion } from 'framer-motion';
import { BookOpen, History } from 'lucide-react';
import { memo } from 'react';

const disciplines = [
    "Engineering",
    "Science & Applied Sciences",
    "Technology & Innovation",
    "Computer Science & IT",
    "AI, ML & Data Science",
    "Electronics & Communication",
    "Mechanical & Civil",
    "IoT, Robotics & Automation",
    "Renewable Energy",
    "Management Studies"
];

function AimAndScope({ journalShortName }: { journalShortName?: string }) {
    const shortName = journalShortName || "IJITEST";

    return (
        <div className="space-y-20">
            {/* Aim & Scope */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-10"
            >
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-serif font-black text-gray-900 italic">Aim and Scope</h2>
                </div>

                <div className="prose prose-lg text-slate-950 font-medium space-y-8">
                    <p>{shortName} covers all major fields of Engineering Disciplines and Modern Technology. Our scope includes, but is not limited to:</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {disciplines.map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary transition-all group">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary group-hover:scale-150 transition-transform" />
                                <span className="text-xs font-black uppercase tracking-widest text-slate-950">{item}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-sm italic text-primary/60 font-bold border-t border-gray-100 pt-8">
                        * Interdisciplinary research merging engineering with managerial sciences is highly prioritized.
                    </p>
                </div>
            </motion.div>

            {/* Publication Process */}
            <section className="bg-gray-900 p-12 rounded-[3.5rem] text-white overflow-hidden relative shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-secondary opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                    <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shrink-0">
                        <History className="w-12 h-12 text-secondary" />
                    </div>
                    <div className="space-y-4">
                        <h3 className="text-3xl font-serif font-black italic">Publication Process</h3>
                        <p className="text-lg text-white font-medium leading-relaxed italic">
                            Accepted papers will be published online, upon receiving the final version from the authors in the recent upcoming issue. Our streamlined workflow minimizes time-to-publication while maintaining elite peer-review standards.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default memo(AimAndScope);

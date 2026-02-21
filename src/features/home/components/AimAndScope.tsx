"use client";
import { motion } from 'framer-motion';
import { BookOpen, History, ChevronRight } from 'lucide-react';
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
        <div className="space-y-12">
            {/* Aim & Scope */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
            >
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-primary/5 rounded-[2rem] text-primary border border-primary/10 shadow-vip">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-sans font-black text-primary tracking-tighter">Aim and Scope</h2>
                </div>

                <div className="space-y-10">
                    <p className="text-base sm:text-lg text-primary/80 font-medium leading-relaxed max-w-3xl">
                        {shortName} covers all major fields of Engineering Disciplines and Modern Technology. Our scope includes, but is not limited to:
                    </p>

                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={{
                            hidden: {},
                            visible: {
                                transition: {
                                    staggerChildren: 0.1
                                }
                            }
                        }}
                    >
                        {disciplines.map((item, i) => (
                            <motion.div
                                key={i}
                                variants={{
                                    hidden: { opacity: 0, x: -20, scale: 0.95 },
                                    visible: { opacity: 1, x: 0, scale: 1, transition: { type: "spring", stiffness: 100 } }
                                }}
                                whileHover={{ scale: 1.02 }}
                                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-primary/5 shadow-sm hover:shadow-vip-hover hover:border-secondary/20 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-2 h-2 rounded-full bg-secondary group-hover:scale-150 transition-transform" />
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary/70 group-hover:text-primary transition-colors">{item}</span>
                                </div>
                                <ChevronRight className="w-4 h-4 text-primary/20 group-hover:text-secondary group-hover:translate-x-1 transition-all" />
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 rounded-[2rem] shadow-vip">
                            <p className="text-xs sm:text-sm text-primary/80 font-black mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 bg-secondary rounded-full" />
                                Mission Priority
                            </p>
                            <p className="text-sm sm:text-base text-primary/70 font-medium leading-relaxed">
                                "Interdisciplinary research merging engineering with managerial sciences is highly prioritized."
                            </p>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-secondary/5 to-transparent border border-secondary/10 rounded-[2rem] shadow-vip">
                            <p className="text-sm sm:text-base text-primary/70 font-medium leading-relaxed">
                                We particularly welcome interdisciplinary work combining engineering with management, sustainability, and data-driven innovation, especially with direct industrial or societal impact.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Publication Process */}
            <section className="bg-primary p-10 rounded-[3rem] text-white overflow-hidden relative shadow-vip border border-white/5 group/proc">
                <div className="absolute top-0 right-0 w-80 h-80 bg-secondary opacity-20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 animate-blob pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent opacity-20 rounded-full blur-[80px] animate-blob pointer-events-none" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                    <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center shrink-0 border border-white/20 group-hover/proc:rotate-6 group-hover/proc:animate-bounce transition-all duration-500">
                        <History className="w-14 h-14 text-secondary" />
                    </div>
                    <div className="space-y-6">
                        <h3 className="text-3xl sm:text-4xl font-sans font-black text-white tracking-tighter">Publication Process</h3>
                        <p className="text-lg sm:text-xl text-white/80 font-medium leading-relaxed max-w-2xl">
                            Accepted papers will be published online, upon receiving the final version from the authors in the recent upcoming issue. Our streamlined workflow minimizes time-to-publication while maintaining elite peer-review standards.
                        </p>
                        <div className="flex items-center gap-3 text-secondary font-black text-xs uppercase tracking-[0.2em]">
                            <span className="w-8 h-[2px] bg-secondary" />
                            Excellence in Motion
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default memo(AimAndScope);

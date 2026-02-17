"use client";

import { memo } from 'react';
import { motion } from 'framer-motion';

const indexingPartners = [
    'Google Scholar',
    'CrossRef',
    'ROAD',
    'Digital Object ID',
    'ORCID',
    'OpenAIRE',
    'ResearchGate'
];

function IndexingLogos() {
    return (
        <section className="py-32 bg-gray-50 border-y border-gray-100 overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col items-center mb-16">
                    <p className="text-[10px] font-black uppercase text-secondary tracking-[0.6em] mb-4">Scientific Visibility</p>
                    <h2 className="text-3xl font-sans font-black text-gray-900 border-b-4 border-secondary/20 pb-2">Planned discovery hubs</h2>
                    <p className="text-[10px] text-gray-400 font-bold mt-4 uppercase tracking-widest">Indexing is in progress for the inaugural 2026 volume.</p>
                </div>

                <div className="relative group">
                    {/* Cinematic Spotlight Masking */}
                    <div
                        className="overflow-hidden"
                        style={{
                            maskImage: 'linear-gradient(to right, transparent, black 30%, black 70%, transparent)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent, black 30%, black 70%, transparent)'
                        }}
                    >
                        <motion.div
                            className="flex whitespace-nowrap gap-24 md:gap-48 items-center py-8"
                            animate={{
                                x: [0, -1800], // Adjust for longer text/gaps
                            }}
                            transition={{
                                x: {
                                    repeat: Infinity,
                                    repeatType: "loop",
                                    duration: 60, // Slower for "prestige" feel
                                    ease: "linear",
                                },
                            }}
                        >
                            {/* Recursive loop items for infinite scroll */}
                            {[...indexingPartners, ...indexingPartners, ...indexingPartners].map((index, i) => (
                                <div
                                    key={`${index}-${i}`}
                                    className="text-center font-sans font-black text-4xl md:text-7xl text-gray-950 lowercase tracking-tighter hover:text-secondary opacity-100 transition-all duration-700 cursor-default select-none"
                                >
                                    {index}
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Central Focal Point Shadow (The "Darker Center" feel) */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[150px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
                </div>
            </div>
        </section>
    );
}

export default memo(IndexingLogos);

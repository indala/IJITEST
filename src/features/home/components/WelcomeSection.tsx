'use client';
import { motion } from 'framer-motion';
import { memo } from 'react';

interface WelcomeSectionProps {
    journalName?: string;
    journalShortName?: string;
    settings: Record<string, string>;
}

function WelcomeSection({ journalName, journalShortName, settings }: WelcomeSectionProps) {
    const name = journalName || "International Journal of Innovative Trends in Engineering Science and Technology";
    const shortName = journalShortName || "IJITEST";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
        >
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/5 to-transparent rounded-[2rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black text-primary mb-4 tracking-tighter leading-tight">
                Welcome to <span className="text-secondary inline-block hover:scale-105 transition-transform cursor-default">{shortName}</span>
            </h1>

            <div className="prose prose-sm sm:prose-base text-primary/80 font-medium leading-relaxed border-l-4 border-secondary/30 pl-6 space-y-4">
                <p className="text-lg text-primary/70 leading-snug font-bold">
                    {name}
                </p>
                <p>
                    {shortName} is a scholarly open access online international journal, which aims to publish peer-reviewed original research papers in the field of various Engineering disciplines. Backed by {settings.publisher_name || 'Felix Academic Publications'} and guided by COPE-compliant ethics, {shortName} accelerates high-quality research from submission to global indexing.
                </p>

                <div className="flex items-center gap-4 pt-4">
                    <div className="px-4 py-2 bg-gradient-to-r from-primary/10 to-transparent border-l-2 border-primary rounded-r-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Rapid Decision</p>
                        <p className="text-sm font-black text-primary">3&ndash;5 Working Days</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default memo(WelcomeSection);

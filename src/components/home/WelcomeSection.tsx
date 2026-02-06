"use client";
import { motion } from 'framer-motion';
import { memo } from 'react';

function WelcomeSection({ journalName, journalShortName }: { journalName?: string, journalShortName?: string }) {
    const name = journalName || "International Journal of Innovative Trends in Engineering Science and Technology";
    const shortName = journalShortName || "IJITEST";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
        >
            <h1 className="text-4xl md:text-5xl font-serif font-black text-primary mb-8 tracking-tight italic">
                Welcome to <span className="text-secondary">{shortName}</span>
            </h1>
            <div className="prose prose-lg text-gray-600 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-8 space-y-6">
                <p>
                    {name} ({shortName}) is a scholarly open access online international journal, which aims to publish peer-reviewed original research papers in the field of various Engineering disciplines.
                </p>
                <p>
                    {shortName} aims to bring the new application developments among the researchers and academicians, laying the foundation of sharing research knowledge among the global scientific community. All submitted papers are peer-reviewed by experts in the relevant field, ensuring that accepted papers are published online immediately after final manuscript verification.
                </p>
            </div>
        </motion.div>
    );
}

export default memo(WelcomeSection);

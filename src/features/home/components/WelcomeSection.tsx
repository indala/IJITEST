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
            className="relative"
        >
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-black text-primary mb-8 tracking-tight leading-tight uppercase">
                About the <span className="text-secondary">{shortName}</span>
            </h1>

            <div className="prose prose-sm sm:prose-base text-primary/80 font-medium leading-relaxed border-l-4 border-secondary/30 pl-6 space-y-6 text-justify">
                <p>
                    {name} ({shortName}) is an international, peer-reviewed journal that publishes original research articles, review papers, and survey articles in Engineering, Science, Technology, and Management. The journal encourages interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and managerial practices across emerging and established domains.
                </p>
                <p>
                    {name} ({shortName}) is a peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management. The journal covers fundamental and applied research, interdisciplinary studies, and emerging technologies that contribute to academic knowledge, industrial growth, and sustainable development. {shortName} follows a rigorous peer-review process and adheres to ethical publishing standards.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-primary/5">
                    <div className="px-4 py-3 bg-slate-50 border-l-2 border-primary rounded-r-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50 mb-1">Year of Commencement</p>
                        <p className="text-base font-black text-primary">2026</p>
                    </div>
                    <div className="px-4 py-3 bg-slate-50 border-l-2 border-secondary rounded-r-xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/50 mb-1">Publication Frequency</p>
                        <p className="text-base font-black text-primary">Monthly (12 Issues per Year)</p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default memo(WelcomeSection);

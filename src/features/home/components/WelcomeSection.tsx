'use client';
import { motion } from 'framer-motion';
import { memo } from 'react';

import { useSettingsContext } from '@/components/providers/SettingsContext';

function WelcomeSection() {
    const settings = useSettingsContext();
    const name = settings['journalName'] || '';
    const shortName = settings['journalShortName'] || '';

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group"
            aria-labelledby="welcome-heading"
        >
            <h2 id="welcome-heading" className="text-2xl sm:text-3xl xl:text-4xl font-serif font-bold text-primary mb-6 sm:mb-8">
                Welcome to {shortName}
            </h2>

            <div className="opacity-80 border-l-4 border-secondary/30 group-hover:border-secondary transition-colors duration-300 pl-6 sm:pl-10 space-y-6 text-left text-pretty max-w-none">
                <p title='welcome description' className='text-justify'>
                    {name} ({shortName}) is an elite international, peer-reviewed scholarly journal dedicated to the dissemination of high-quality research in Engineering, Science, Technology, and Management. The journal encourages fundamental, interdisciplinary, theoretical, and applied research that advances innovation, industrial development, and sustainable practices across emerging and established domains. {shortName} follows a rigorous double-blind peer-review process and adheres strictly to global ethical publishing standards.
                </p>
                <p className="font-semibold text-primary/80 text-sm xl:text-base border-t border-primary/5 pt-4">
                    Subject: {settings['journalSubject'] || 'Multidisciplinary'} • Language: English
                </p>
            </div>
        </motion.section>
    );
}

export default memo(WelcomeSection);

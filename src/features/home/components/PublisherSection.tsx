"use client";

import { Mail } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

import { useSettingsContext } from '@/components/providers/SettingsContext';

function PublisherSection() {
    const settings = useSettingsContext();
    const publisherName = settings['publisherName'] || "Felix Academic Publications";
    const supportEmail = settings['supportEmail'] || "support@ijitest.org";

    return (
        <section className="section-padding bg-background relative overflow-hidden border-t border-primary/5 my-2">
            <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"
            />

            <div className="container-responsive text-center sm:text-left relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="max-w-3xl 2xl:max-w-5xl space-y-2.5 2xl:space-y-4"
                >
                    <h2 className="m-0">About the Publisher</h2>
                    <p className="border-l-4 border-secondary/30 pl-3.5 text-muted-foreground m-0">
                        {settings['journalShortName'] || 'IJITEST'} is published by <span className="font-semibold text-primary">{publisherName}</span>, dedicated to providing a high-quality global bedrock for research sharing and open scientific excellence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                        <div className="p-2.5 2xl:p-3.5 bg-card border border-border/70 rounded-xl flex items-center gap-3 shadow-2xs">
                            <div className="w-8 h-8 2xl:w-10 2xl:h-10 bg-primary/5 rounded-lg flex items-center justify-center text-primary shrink-0">
                                <Mail className="w-4 h-4 2xl:w-5 2xl:h-5" />
                            </div>
                            <div className="text-left text-xs 2xl:text-sm">
                                <p className="text-label text-muted-foreground mb-0.5 m-0">Support Desk</p>
                                <p className="text-primary font-semibold m-0">{supportEmail}</p>
                            </div>
                        </div>
                        <Link href="/guidelines" className="text-xs 2xl:text-sm font-semibold text-primary hover:text-secondary flex items-center gap-2 transition-all">
                            <span className="h-[2px] w-5 bg-secondary" />
                            Author Submission Guidelines
                        </Link>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

export default memo(PublisherSection);

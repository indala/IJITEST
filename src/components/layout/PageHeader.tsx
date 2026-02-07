"use client";

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs: { name: string; href: string }[];
}

export default function PageHeader({ title, description, breadcrumbs }: PageHeaderProps) {
    return (
        <section className="relative py-24 bg-gray-900 border-b border-white/10 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-2 mb-6"
                >
                    {breadcrumbs.map((crumb, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <Link
                                href={crumb.href}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-secondary transition-colors"
                            >
                                {crumb.name}
                            </Link>
                            {idx < breadcrumbs.length - 1 && (
                                <ChevronRight className="w-3 h-3 text-white/20" />
                            )}
                        </div>
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight mb-6">
                        {title.split(' ').map((word, i) => (
                            <span key={i} className={i === title.split(' ').length - 1 ? "text-secondary italic" : ""}>
                                {word}{' '}
                            </span>
                        ))}
                    </h1>
                    {description && (
                        <p className="max-w-2xl text-lg text-white/60 font-medium italic border-l-2 border-secondary/30 pl-8 leading-relaxed">
                            {description}
                        </p>
                    )}
                </motion.div>
            </div>
        </section>
    );
}

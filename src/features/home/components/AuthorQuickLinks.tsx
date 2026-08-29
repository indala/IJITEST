"use client";

import { BookOpen, ShieldCheck, UserCheck, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

function AuthorQuickLinks() {
    const links = [
        {
            label: "Guidelines",
            href: "/guidelines",
            description: "Formatting instructions & templates",
            icon: BookOpen,
            color: "text-blue-500",
            bgColor: "bg-blue-50"
        },
        {
            label: "Ethics",
            href: "/ethics",
            description: "Publication ethics & COPE policy",
            icon: ShieldCheck,
            color: "text-emerald-500",
            bgColor: "bg-emerald-50"
        },
        {
            label: "Peer Review",
            href: "/peer-review",
            description: "Our double-blind review process",
            icon: UserCheck,
            color: "text-amber-500",
            bgColor: "bg-amber-50"
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <div className="bg-card p-3.5 sm:p-4 2xl:p-5 rounded-xl border border-border/70 shadow-2xs space-y-3 2xl:space-y-4">
                <h3 className="text-xs sm:text-sm 2xl:text-base font-bold text-primary m-0">Author Resources</h3>
                <div className="space-y-2">
                    {links.map((link, i) => (
                        <Link
                            key={i}
                            href={link.href}
                            className="flex items-center gap-3 p-2.5 2xl:p-3 rounded-lg bg-muted/40 hover:bg-muted/70 transition-all border border-border/40 group"
                        >
                            <div className={`p-2 2xl:p-2.5 rounded-md ${link.bgColor} ${link.color} shrink-0`}>
                                <link.icon className="w-4 h-4 2xl:w-5 2xl:h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs 2xl:text-sm font-bold text-primary group-hover:text-secondary transition-colors m-0 truncate">
                                    {link.label}
                                </p>
                                <p className="text-[11px] 2xl:text-xs text-muted-foreground line-clamp-1 m-0">
                                    {link.description}
                                </p>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

export default memo(AuthorQuickLinks);

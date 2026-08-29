"use client";

import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

function EthicsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
        >
            <div className="bg-primary p-3.5 sm:p-4 rounded-xl text-white shadow-md space-y-2 group">
                <h3 className="text-xs sm:text-sm font-bold text-white m-0">Publication Ethics</h3>
                <p className="text-xs text-white/80 leading-relaxed m-0">
                    IJITEST adheres strictly to COPE (Committee on Publication Ethics) international standards.
                </p>
                <Link href="/ethics" className="text-xs font-bold text-secondary hover:text-white transition-colors inline-flex items-center gap-1 pt-1">
                    <span>Read Policy & Guidelines</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                </Link>
            </div>
        </motion.div>
    );
}

export default memo(EthicsWidget);

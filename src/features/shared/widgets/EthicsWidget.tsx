"use client";

import { ShieldAlert, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { motion } from 'framer-motion';

function EthicsWidget() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <div className="bg-secondary p-8 rounded-[3rem] text-white shadow-xl shadow-secondary/20 group">
                <ShieldAlert className="w-8 h-8 mb-6 group-hover:rotate-12 animate-pulse transition-transform" />
                <h3 className="text-xl font-sans font-black mb-2">Ethics Statement</h3>
                <p className="text-xs text-white/70 mb-8 font-medium leading-relaxed">IJITEST follows COPE (Committee on Publication Ethics) guidelines for research integrity.</p>
                <Link href="/ethics" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-white/20 hover:border-white transition-all pb-1">
                    View Ethics <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}

export default memo(EthicsWidget);

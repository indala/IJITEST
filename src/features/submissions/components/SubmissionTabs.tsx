'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

const statuses = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'Pending', value: 'pending' },
    { label: 'Paid / Waive Free', value: 'paid' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
];

export default function SubmissionTabs({ currentStatus = 'all' }: { currentStatus?: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleTabClick = (status: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (status === 'all') {
            params.delete('status');
        } else {
            params.set('status', status);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
            {statuses.map((tab) => {
                const isActive = currentStatus === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => handleTabClick(tab.value)}
                        className={`relative px-8 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${isActive
                            ? 'text-white'
                            : 'text-slate-500 hover:text-slate-900 bg-white border border-slate-100 hover:border-slate-200 shadow-sm'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-[#1e293b] rounded-2xl shadow-lg shadow-slate-200"
                                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}

"use client";

import { motion } from 'framer-motion';
import { useCallback } from 'react';
import { type SubmissionStatus } from '@/db/types';

export type SubmissionTabValue = 'all' | Extract<SubmissionStatus, 'submitted' | 'underReview' | 'revisionRequested' | 'accepted' | 'paymentPending' | 'published' | 'rejected'>;

interface TabDefinition {
    label: string;
    value: SubmissionTabValue;
}

const statuses: readonly TabDefinition[] = [
    { label: 'All', value: 'all' },
    { label: 'Submitted', value: 'submitted' },
    { label: 'In Review', value: 'underReview' },
    { label: 'Revisions', value: 'revisionRequested' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Payment Pending', value: 'paymentPending' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
];

export default function SubmissionTabs({
    currentStatus = 'all',
    onStatusChange,
}: {
    currentStatus?: SubmissionTabValue | string;
    onStatusChange: (status: SubmissionTabValue) => void;
}) {
    const handleTabClick = useCallback((status: SubmissionTabValue) => {
        onStatusChange(status);
    }, [onStatusChange]);

    return (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {statuses.map((tab) => {
                const isActive = currentStatus === tab.value;
                return (
                    <button
                        key={tab.value}
                        onClick={() => handleTabClick(tab.value)}
                        className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all whitespace-nowrap uppercase cursor-pointer ${isActive
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                            }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute inset-0 bg-primary rounded-lg shadow-xs"
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

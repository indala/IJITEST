'use client';

import { useSettingsStore } from '@/store/useSettingsStore';

interface FooterDynamicProps {
    field: 'supportPhone' | 'officeAddress' | 'copyright';
    className?: string;
}

export function FooterDynamic({ field, className }: FooterDynamicProps) {
    const settings = useSettingsStore((state) => state.settings);

    if (field === 'copyright') {
        const year = new Date().getFullYear();
        return (
            <p className={`text-white/80 m-0 ${className ?? ''}`}>
                &copy; {year} <span className="text-white font-bold">{settings.publisherName}</span>
            </p>
        );
    }

    return (
        <p className={`text-white m-0 font-semibold ${className ?? ''}`}>
            {settings[field]}
        </p>
    );
}

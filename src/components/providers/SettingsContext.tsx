'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { JournalSettings } from '@/db/types';

const SettingsContext = createContext<JournalSettings | null>(null);

export function SettingsProvider({
    settings,
    children,
}: {
    settings: JournalSettings;
    children: ReactNode;
}) {
    return (
        <SettingsContext.Provider value={settings}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettingsContext(): JournalSettings {
    const ctx = useContext(SettingsContext);
    if (!ctx) {
        throw new Error('useSettingsContext must be used within a SettingsProvider');
    }
    return ctx;
}

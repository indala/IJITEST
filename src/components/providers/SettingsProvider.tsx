'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import type { JournalSettings } from '@/store/useSettingsStore';

interface SettingsProviderProps {
    initialSettings: JournalSettings;
    children: ReactNode;
}

export function SettingsProvider({ initialSettings, children }: SettingsProviderProps) {
    const setSettings = useSettingsStore((state) => state.setSettings);

    // Hydrate the store with initial settings from the server
    useEffect(() => {
        if (initialSettings) {
            setSettings(initialSettings);
        }
    }, [initialSettings, setSettings]);

    return <>{children}</>;
}

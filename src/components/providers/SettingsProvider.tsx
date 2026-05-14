'use client';

import { useEffect, ReactNode } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface SettingsProviderProps {
    initialSettings: Record<string, string>;
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

import { create } from 'zustand';

export interface JournalSettings {
    journalName?: string;
    journalShortName?: string;
    publisherName?: string;
    issnNumber?: string;
    apcInr?: string;
    apcUsd?: string;
    apcDescription?: string;
    startingYear?: string;
    publicationFrequency?: string;
    journalLanguage?: string;
    udyamRegistration?: string;
    journalSubject?: string;
    supportEmail?: string;
    supportPhone?: string;
    officeAddress?: string;
    templateUrl?: string;
    copyrightUrl?: string;
    isPromotionActive?: string;
    [key: string]: string | undefined;
}

interface SettingsState {
    settings: JournalSettings;
    setSettings: (settings: JournalSettings) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
    settings: {},
    setSettings: (settings) => set({ settings }),
}));


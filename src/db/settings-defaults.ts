/**
 * Canonical Default Journal Settings
 * Single source of truth for all journal configuration keys, default values, and derived types.
 */
export const DEFAULT_JOURNAL_SETTINGS = {
    journalName: 'International Journal of Innovative Trends in Engineering, Science and Technology',
    journalShortName: 'IJITEST',
    issnNumber: '3139-6887',
    apcInr: '2500',
    apcUsd: '50',
    supportEmail: 'support@ijitest.org',
    supportPhone: '+91 8919643590',
    officeAddress: 'Dr. Ravibabu T.\nAssociate Professor\nDepartment of Electronics and Communication Engineering\nMES Group of Institutions, Vizianagaram,\nAndhra Pradesh, India - 530048',
    publisherName: 'Felix Academic Publications',
    journalWebsite: 'ijitest.org',
    apcDescription: 'APC covers SJIF impact evaluation, long-term hosting, indexing maintenance, and editorial handling. There are no submission or processing charges before acceptance.',
    templateUrl: '/docs/template.docx',
    copyrightUrl: '/docs/copyright-form.docx',
    isPromotionActive: 'true',
    publicationFrequency: 'Monthly (12 Issues per year)',
    startingYear: '2026',
    publicationFormat: 'Online',
    journalLanguage: 'English',
    journalSubject: 'Multidisciplinary (Engineering, Science and Technology, Healthcare, Management Sciences)',
    udyamRegistration: 'UDYAM-AP-10-0125617',
    doiPrefix: '10.68139',
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    licenseName: 'Creative Commons Attribution 4.0 International (CC BY 4.0)',
    sushiPlatformId: 'ijitest',
    sushiCustomerId: '0'
} as const;

export type JournalSettingKey = keyof typeof DEFAULT_JOURNAL_SETTINGS;

export type JournalSettings = Record<JournalSettingKey, string>;

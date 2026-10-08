export const CREDIT_ROLES = [
    'Conceptualization',
    'Data Curation',
    'Formal Analysis',
    'Funding Acquisition',
    'Investigation',
    'Methodology',
    'Project Administration',
    'Resources',
    'Software',
    'Supervision',
    'Validation',
    'Visualization',
    'Writing – Original Draft',
    'Writing – Review & Editing',
] as const;

export type CreditRole = (typeof CREDIT_ROLES)[number];

const ORCID_PATTERN = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/i;
const ORCID_URL_PREFIX = /^(?:https?:\/\/)?orcid\.org\//i;

export function normalizeOrcid(value: string): string {
    return value.trim().replace(ORCID_URL_PREFIX, "").toUpperCase();
}

export function isValidOrcid(value: string): boolean {
    const orcid = normalizeOrcid(value);
    if (!ORCID_PATTERN.test(orcid)) return false;

    const digits = orcid.replace(/-/g, "");
    let total = 0;
    for (const digit of digits.slice(0, 15)) {
        total = (total + Number(digit)) * 2;
    }

    const remainder = (12 - (total % 11)) % 11;
    const checkDigit = remainder === 10 ? "X" : String(remainder);
    return digits[15] === checkDigit;
}

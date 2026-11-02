export function normalizeDoi(value: string, provider?: 'crossref' | 'zenodo' | 'custom' | 'none'): string {
    let cleaned = value
        .trim()
        .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "")
        .replace(/^doi:\s*/i, "");

    // Strip accidental double prefixes (e.g. 10.68139/10.5281/zenodo.23882713 -> 10.5281/zenodo.23882713)
    if (/^10\.\d{4,9}\/(10\.\d{4,9}\/\S+)$/i.test(cleaned)) {
        cleaned = cleaned.replace(/^10\.\d{4,9}\//i, "");
    }

    // Handle full Zenodo record URLs (e.g. https://zenodo.org/records/23882713 or /record/23882713)
    const zenodoUrlMatch = cleaned.match(/zenodo\.org\/records?\/(\d+)/i);
    if (zenodoUrlMatch?.[1]) {
        return `10.5281/zenodo.${zenodoUrlMatch[1]}`;
    }

    // Handle Zenodo shorthand (e.g. zenodo.23882713 -> 10.5281/zenodo.23882713)
    if (/^zenodo\.(\d+)$/i.test(cleaned)) {
        return `10.5281/${cleaned.toLowerCase()}`;
    }

    // Handle pure Zenodo record digits (e.g. 23882713) when provider is 'zenodo'
    if (/^\d{7,10}$/.test(cleaned) && provider === 'zenodo') {
        return `10.5281/zenodo.${cleaned}`;
    }

    return cleaned;
}

export function isValidDoi(value: string): boolean {
    return /^10\.\d{4,9}\/\S+$/i.test(value);
}

export interface JackDoiResult {
    fullDoi: string;
    suffix: string;
    jackPattern: string;
    year2: string;
    vol: string;
    paperNum: string;
}

/**
 * Generates the "JACK" DOI pattern:
 * Interleaves the letters "jack" with Year (2 digits), Volume, and Paper Sequence Number.
 * Example: Year 2026 (26) + Vol 1 + Paper 11 -> j2a6c1k11 -> /ijitest.j2a6c1k11
 */
export function generateJackDoi(
    doiPrefix: string,
    paperId: string,
    volume?: number | null,
    year?: number | null
): JackDoiResult {
    // 1. Resolve 2-digit year (e.g. 2026 -> 26)
    let yStr = year ? String(year) : "";
    if (!yStr) {
        const yearMatch = paperId.match(/-(20\d{2})-/i);
        yStr = yearMatch ? yearMatch[1]! : String(new Date().getFullYear());
    }
    const year2 = yStr.slice(-2);
    const y1 = year2[0] || "2";
    const y2 = year2[1] || "6";

    // 2. Resolve volume (default to 1)
    const vol = volume ? String(volume) : "1";

    // 3. Resolve paper sequence number (e.g. "IJITEST-2026-011" -> "11")
    const numMatch = paperId.match(/(\d+)$/);
    const paperNum = numMatch ? String(parseInt(numMatch[1]!, 10)) : "1";

    // Interleave "jack" with 26, 1, and paperNum: j{y1}a{y2}c{vol}k{paperNum}
    const jackPattern = `j${y1}a${y2}c${vol}k${paperNum}`;
    const suffix = `ijitest.${jackPattern}`;
    const cleanPrefix = (doiPrefix || "10.68139").trim().replace(/\/$/, "");

    return {
        fullDoi: `${cleanPrefix}/${suffix}`,
        suffix,
        jackPattern,
        year2,
        vol,
        paperNum,
    };
}

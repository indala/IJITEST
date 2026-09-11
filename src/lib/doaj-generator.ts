import type { PublishedPaperUI, Author } from "@/db/types";
import { escapeXml } from "@/lib/crossref-generator";

interface GenerateDoajXmlOptions {
    settings: Record<string, string>;
    papers: PublishedPaperUI[];
    issue?: {
        volumeNumber: number;
        issueNumber: number;
        year: number;
        monthRange?: string | null;
    };
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDateIso(dateVal: Date | string | null | undefined, fallbackYear?: number): string {
    const d = dateVal ? new Date(dateVal) : (fallbackYear ? new Date(fallbackYear, 0, 1) : new Date());
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    return validDate.toISOString().split('T')[0] ?? '2026-01-01';
}

/**
 * Generate standard DOAJ XML (Schema 1.3 / 0.2) batch export for accepted and published articles
 */
export function generateDoajXml({ settings, papers, issue }: GenerateDoajXmlOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const publisher = settings['publisherName'] || 'IJITEST Publication';
    const issn = (settings['issnNumber'] || '3139-6887').replace(/[^0-9X-]/gi, '');
    const baseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');

    if (!papers || papers.length === 0) {
        throw new Error("Cannot generate DOAJ XML: No papers provided.");
    }

    const recordsXml = papers.map((paper) => {
        const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
        const volNum = issue?.volumeNumber ?? paper.volumeNumber ?? 1;
        const issNum = issue?.issueNumber ?? paper.issueNumber ?? 1;
        const pubDateIso = formatDateIso(paper.publishedAt, issue?.year ?? paper.publicationYear ?? undefined);

        // Authors & Affiliations
        const rawAuthors: Author[] = (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0)
            ? paper.coAuthors
            : [{
                name: paper.authorName,
                email: paper.authorEmail || '',
                institution: paper.affiliation || '',
                orcidId: null,
            } as unknown as Author];

        // Gather affiliations
        const affList: string[] = [];
        rawAuthors.forEach((a) => {
            const inst = (a.institution || '').trim();
            if (inst && !affList.includes(inst)) {
                affList.push(inst);
            }
        });

        const authorsXml = rawAuthors.map((author) => {
            const inst = (author.institution || '').trim();
            const affIdx = inst ? affList.indexOf(inst) : -1;
            const affTag = affIdx >= 0 ? `\n        <affiliationId>${affIdx}</affiliationId>` : '';
            const emailTag = author.email ? `\n        <email>${escapeXml(author.email)}</email>` : '';
            const orcidTag = author.orcidId
                ? `\n        <orcid_id>https://orcid.org/${escapeXml(author.orcidId.replace(/^https?:\/\/orcid\.org\//, ''))}</orcid_id>`
                : '';

            return `      <author>
        <name>${escapeXml(author.name)}</name>${emailTag}${affTag}${orcidTag}
      </author>`;
        }).join('\n');

        const affiliationsXml = affList.length > 0
            ? `\n    <affiliationsList>
${affList.map((affName, idx) => `      <affiliationName affiliationId="${idx}">${escapeXml(affName)}</affiliationName>`).join('\n')}
    </affiliationsList>`
            : '';

        // Pages
        const startPageXml = (paper.startPage !== null && paper.startPage !== undefined)
            ? `\n    <startPage>${paper.startPage}</startPage>`
            : '';
        const endPageXml = (paper.endPage !== null && paper.endPage !== undefined)
            ? `\n    <endPage>${paper.endPage}</endPage>`
            : '';

        // DOI
        const doiXml = paper.doi
            ? `\n    <doi>${escapeXml(paper.doi)}</doi>`
            : '';

        // Abstract
        const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();
        const abstractXml = cleanAbstract
            ? `\n    <abstract language="eng">${escapeXml(cleanAbstract)}</abstract>`
            : '';

        // Keywords
        const rawKeywords = (paper.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
        const keywordsXml = rawKeywords.length > 0
            ? `\n    <keywords language="eng">
${rawKeywords.map(k => `      <keyword>${escapeXml(k)}</keyword>`).join('\n')}
    </keywords>`
            : '';

        return `  <record>
    <language>eng</language>
    <publisher>${escapeXml(publisher)}</publisher>
    <journalTitle>${escapeXml(journalTitle)}</journalTitle>
    <eissn>${escapeXml(issn)}</eissn>
    <publicationDate>${pubDateIso}</publicationDate>
    <volume>${volNum}</volume>
    <issue>${issNum}</issue>${startPageXml}${endPageXml}${doiXml}
    <publisherRecordId>${escapeXml(paper.paperId)}</publisherRecordId>
    <documentType>Research Article</documentType>
    <title language="eng">${escapeXml(paper.title)}</title>
    <authors>
${authorsXml}
    </authors>${affiliationsXml}${abstractXml}
    <fullTextUrl format="html">${escapeXml(canonicalUrl)}</fullTextUrl>${keywordsXml}
  </record>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<records xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://doaj.org/static/doaj/doajArticles.xsd">
${recordsXml}
</records>`;
}

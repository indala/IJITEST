import type { PublishedPaperUI, Author } from "@/db/types";

/**
 * Utility to escape XML special characters
 */
export function escapeXml(unsafe: string | null | undefined): string {
    if (!unsafe) return "";
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/**
 * Split author full name into givenName and surname for CrossRef <person_name>
 */
export function splitAuthorName(fullName: string): { givenName: string; surname: string } {
    const cleaned = (fullName || "").trim();
    if (!cleaned) return { givenName: "", surname: "Unknown" };

    const parts = cleaned.split(/\s+/);
    if (parts.length === 1) {
        return { givenName: "", surname: parts[0] ?? "" };
    }
    const surname = parts[parts.length - 1] ?? "";
    const givenName = parts.slice(0, -1).join(" ");
    return { givenName, surname };
}

interface GenerateCrossRefXmlOptions {
    settings: Record<string, string>;
    papers: PublishedPaperUI[];
    batchId?: string;
    issue?: {
        volumeNumber: number;
        issueNumber: number;
        year: number;
        monthRange?: string | null;
    };
}

/**
 * Generate standard CrossRef Schema 5.3.1 XML batch for one or more published papers
 */
export function generateCrossRefXml({
    settings,
    papers,
    batchId,
    issue,
}: GenerateCrossRefXmlOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalAbbrev = settings['journalShortName'] || 'IJITEST';
    const issn = (settings['issnNumber'] || '3139-6887').replace(/[^0-9X-]/gi, '');
    const publisher = settings['publisherName'] || 'IJITEST Publication';
    const depositorName = settings['depositorName'] || settings['journalName'] || 'IJITEST Editorial Office';
    const depositorEmail = settings['depositorEmail'] || settings['contactEmail'] || 'editor@ijitest.org';
    const baseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const resolvedBatchId = batchId || `${journalAbbrev}_${timestamp}_${papers[0]?.paperId || 'deposit'}`;

    // Filter to only papers that have DOIs
    const validPapers = papers.filter(p => Boolean(p.doi));

    if (validPapers.length === 0) {
        throw new Error("Cannot generate CrossRef XML: None of the selected papers have a DOI assigned.");
    }

    // Determine issue details from either the issue parameter or the first paper
    const volNum = issue?.volumeNumber ?? validPapers[0]?.volumeNumber ?? 1;
    const issNum = issue?.issueNumber ?? validPapers[0]?.issueNumber ?? 1;
    const issueYear = issue?.year ?? validPapers[0]?.publicationYear ?? now.getFullYear();
    const issueMonth = String(now.getMonth() + 1).padStart(2, '0');

    // Build articles XML
    const articlesXml = validPapers.map((paper) => {
        const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
        const pdfUrl = paper.pdfUrl
            ? (paper.pdfUrl.startsWith('http') ? paper.pdfUrl : `${baseUrl}${paper.pdfUrl}`)
            : '';

        // Authors
        const authors: Array<{ name: string; institution?: string | null }> = [];
        if (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0) {
            paper.coAuthors.forEach((ca: Author) => {
                authors.push({
                    name: ca.name,
                    institution: ca.institution,
                });
            });
        } else {
            authors.push({
                name: paper.authorName,
                institution: paper.affiliation,
            });
        }

        const contributorsXml = authors.map((author, index) => {
            const sequence = index === 0 ? 'first' : 'additional';
            const { givenName, surname } = splitAuthorName(author.name);

            const givenNameTag = givenName ? `\n            <given_name>${escapeXml(givenName)}</given_name>` : '';
            const institutionTag = author.institution ? `\n            <affiliations>
              <institution>
                <institution_name>${escapeXml(author.institution)}</institution_name>
              </institution>
            </affiliations>` : '';

            return `          <person_name sequence="${sequence}" contributor_role="author">${givenNameTag}
            <surname>${escapeXml(surname)}</surname>${institutionTag}
          </person_name>`;
        }).join('\n');

        // Abstract
        const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();
        const abstractXml = cleanAbstract
            ? `\n        <jats:abstract xml:lang="en">
          <jats:p>${escapeXml(cleanAbstract)}</jats:p>
        </jats:abstract>`
            : '';

        // Publication date - prioritize paper.publishedAt, then paper.issueDatePublished
        const resolvedPubDate = paper.publishedAt || paper.issueDatePublished;
        const pubDate = resolvedPubDate ? new Date(resolvedPubDate) : now;
        const pubYear = pubDate.getFullYear();
        const pubMonth = String(pubDate.getMonth() + 1).padStart(2, '0');
        const pubDay = String(pubDate.getDate()).padStart(2, '0');

        // Pages
        const pagesXml = (paper.startPage !== null && paper.startPage !== undefined)
            ? `\n        <pages>
          <first_page>${paper.startPage}</first_page>
          ${paper.endPage !== null && paper.endPage !== undefined ? `\n          <last_page>${paper.endPage}</last_page>` : ''}
        </pages>`
            : '';

        // Crawler collection (iParadigms / Turnitin / Similarity Check)
        const crawlerCollectionXml = pdfUrl
            ? `\n          <collection property="crawler-based">
            <item crawler="iParadigms">
              <resource>${escapeXml(pdfUrl)}</resource>
            </item>
          </collection>`
            : '';

        return `      <journal_article publication_type="full_text">
        <titles>
          <title>${escapeXml(paper.title)}</title>
        </titles>
        <contributors>
${contributorsXml}
        </contributors>${abstractXml}
        <publication_date media_type="online">
          <month>${pubMonth}</month>
          <day>${pubDay}</day>
          <year>${pubYear}</year>
        </publication_date>${pagesXml}
        <ai:program name="AccessIndicators">
          <ai:license_ref>https://creativecommons.org/licenses/by/4.0/</ai:license_ref>
        </ai:program>
        <doi_data>
          <doi>${escapeXml(paper.doi)}</doi>
          <resource>${escapeXml(canonicalUrl)}</resource>${crawlerCollectionXml}
        </doi_data>
      </journal_article>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch xmlns="http://www.crossref.org/schema/5.3.1"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xmlns:jats="http://www.ncbi.nlm.nih.gov/JATS1"
           xmlns:ai="http://www.crossref.org/AccessIndicators.xsd"
           version="5.3.1"
           xsi:schemaLocation="http://www.crossref.org/schema/5.3.1 https://www.crossref.org/schemas/crossref5.3.1.xsd">
  <head>
    <doi_batch_id>${escapeXml(resolvedBatchId)}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${escapeXml(depositorName)}</depositor_name>
      <email_address>${escapeXml(depositorEmail)}</email_address>
    </depositor>
    <registrant>${escapeXml(publisher)}</registrant>
  </head>
  <body>
    <journal>
      <journal_metadata>
        <full_title>${escapeXml(journalTitle)}</full_title>
        <abbrev_title>${escapeXml(journalAbbrev)}</abbrev_title>
        <issn media_type="electronic">${escapeXml(issn)}</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          <month>${issueMonth}</month>
          <year>${issueYear}</year>
        </publication_date>
        <journal_volume>
          <volume>${volNum}</volume>
        </journal_volume>
        <issue>${issNum}</issue>
      </journal_issue>
${articlesXml}
    </journal>
  </body>
</doi_batch>
`;
}

import type { PublishedPaperUI, Author } from "@/db/types";
import { escapeXml, splitAuthorName } from "@/lib/crossref-generator";

interface GenerateJatsXmlOptions {
    settings: Record<string, string>;
    paper: PublishedPaperUI;
}

/**
 * Format a Date or date string to { year, month, day, iso }
 */
function parseDateParts(dateVal: Date | string | null | undefined, fallbackYear?: number): {
    year: string;
    month: string;
    day: string;
    iso: string;
} {
    const d = dateVal ? new Date(dateVal) : (fallbackYear ? new Date(fallbackYear, 0, 1) : new Date());
    const validDate = isNaN(d.getTime()) ? new Date() : d;

    const year = String(validDate.getFullYear());
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');
    const iso = `${year}-${month}-${day}`;

    return { year, month, day, iso };
}

/**
 * Generate standard NISO JATS 1.3 Publishing XML document for a single published article
 */
export function generateJatsXml({ settings, paper }: GenerateJatsXmlOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalAbbrev = settings['journalShortName'] || 'IJITEST';
    const issn = (settings['issnNumber'] || '3139-6887').replace(/[^0-9X-]/gi, '');
    const publisher = settings['publisherName'] || 'IJITEST Publication';
    const baseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');

    const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
    const pdfUrl = paper.pdfUrl
        ? (paper.pdfUrl.startsWith('http') ? paper.pdfUrl : `${baseUrl}${paper.pdfUrl}`)
        : '';

    // Extract all authors with affiliations
    const rawAuthors: Author[] = (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0)
        ? paper.coAuthors
        : [{
            id: 0,
            submissionId: paper.id,
            name: paper.authorName,
            email: paper.authorEmail || '',
            phone: null,
            designation: null,
            institution: paper.affiliation || '',
            orderIndex: 0,
            isCorresponding: true,
            orcidId: null,
            creditRoles: null,
        } as Author];

    // Collect unique affiliations to construct <aff id="aff1"> mappings
    const affMap = new Map<string, { id: string; name: string; country?: string | null }>();
    rawAuthors.forEach((author) => {
        const inst = (author.institution || '').trim();
        if (inst && !affMap.has(inst)) {
            const affId = `aff${affMap.size + 1}`;
            affMap.set(inst, { id: affId, name: inst, country: (author as unknown as { country?: string }).country || null });
        }
    });

    // Build <contrib-group>
    const contribsXml = rawAuthors.map((author, index) => {
        const { givenName, surname } = splitAuthorName(author.name);
        const isCorresp = author.isCorresponding || index === 0;
        const affEntry = author.institution ? affMap.get(author.institution.trim()) : null;

        const orcidTag = author.orcidId
            ? `\n        <contrib-id contrib-id-type="orcid">https://orcid.org/${escapeXml(author.orcidId.replace(/^https?:\/\/orcid\.org\//, ''))}</contrib-id>`
            : '';

        const emailTag = author.email
            ? `\n        <email>${escapeXml(author.email)}</email>`
            : '';

        const xrefTag = affEntry
            ? `\n        <xref ref-type="aff" rid="${escapeXml(affEntry.id)}"/>`
            : '';

        // CRediT roles
        const rolesXml = Array.isArray(author.creditRoles) && author.creditRoles.length > 0
            ? author.creditRoles.map(role => `\n        <role vocab="CRediT" vocab-identifier="https://credit.niso.org/">${escapeXml(role)}</role>`).join('')
            : '';

        return `      <contrib contrib-type="author"${isCorresp ? ' corresp="yes"' : ''}>${orcidTag}
        <name>
          <surname>${escapeXml(surname)}</surname>
          <given-names>${escapeXml(givenName)}</given-names>
        </name>${emailTag}${xrefTag}${rolesXml}
      </contrib>`;
    }).join('\n');

    // Build <aff> elements
    const affsXml = Array.from(affMap.values()).map(aff => {
        const countryTag = aff.country ? `\n      <country>${escapeXml(aff.country)}</country>` : '';
        return `    <aff id="${escapeXml(aff.id)}">
      <institution-wrap>
        <institution content-type="orgname">${escapeXml(aff.name)}</institution>
      </institution-wrap>${countryTag}
    </aff>`;
    }).join('\n');

    // Dates
    const pubDateParts = parseDateParts(paper.publishedAt || paper.issueDatePublished, paper.publicationYear || undefined);
    const subDateParts = parseDateParts(paper.submittedAt, paper.publicationYear || undefined);
    const accDateParts = parseDateParts(paper.acceptedAt || paper.publishedAt || paper.issueDatePublished, paper.publicationYear || undefined);

    // Dynamic JATS Article Type from section identifyType
    const rawGenre = (paper.sectionIdentifyType || '').toLowerCase();
    let jatsArticleType = 'research-article';
    if (rawGenre.includes('review')) jatsArticleType = 'review-article';
    else if (rawGenre.includes('case')) jatsArticleType = 'case-report';
    else if (rawGenre.includes('short') || rawGenre.includes('brief') || rawGenre.includes('note')) jatsArticleType = 'brief-report';
    else if (rawGenre.includes('editorial')) jatsArticleType = 'editorial';

    // Keywords
    const rawKeywords = (paper.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const keywordsXml = rawKeywords.length > 0
        ? `\n      <kwd-group kwd-group-type="author-keywords">
${rawKeywords.map(k => `        <kwd>${escapeXml(k)}</kwd>`).join('\n')}
      </kwd-group>`
        : '';

    // Abstract
    const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();

    // Author string for copyright
    const authorString = rawAuthors.map(a => a.name).join(', ') || 'IJITEST Authors';

    // Disclosures in <back>
    const hasDisclosures = Boolean(paper.fundingStatement || paper.competingInterests || paper.ethicalApproval);
    const disclosuresXml = hasDisclosures ? `
  <back>
    <sec sec-type="declarations">
      <title>Declarations &amp; Ethics</title>
      ${paper.fundingStatement ? `<sec sec-type="funding"><title>Funding</title><p>${escapeXml(paper.fundingStatement)}</p></sec>` : ''}
      ${paper.competingInterests ? `<sec sec-type="conflict-of-interest"><title>Conflict of Interest</title><p>${escapeXml(paper.competingInterests)}</p></sec>` : ''}
      ${paper.ethicalApproval ? `<sec sec-type="ethical-approval"><title>Ethical Approval</title><p>${escapeXml(paper.ethicalApproval)}</p></sec>` : ''}
    </sec>
  </back>` : `
  <back>
    <sec sec-type="declarations">
      <title>Declarations</title>
      <p>The authors declare that no competing interests exist in relation to this published work.</p>
    </sec>
  </back>`;

    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE article PUBLIC "-//NLM//DTD JATS (Z39.96) Journal Publishing DTD v1.3 20210610//EN" "https://jats.nlm.nih.gov/publishing/1.3/JATS-journalpublishing1-3.dtd">
<article xmlns:xlink="http://www.w3.org/1999/xlink"
         xmlns:mml="http://www.w3.org/1998/Math/MathML"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         article-type="${jatsArticleType}"
         dtd-version="1.3"
         xml:lang="en">
  <front>
    <journal-meta>
      <journal-id journal-id-type="publisher-id">${escapeXml(journalAbbrev)}</journal-id>
      <journal-title-group>
        <journal-title>${escapeXml(journalTitle)}</journal-title>
        <abbrev-journal-title abbrev-type="publisher">${escapeXml(journalAbbrev)}</abbrev-journal-title>
      </journal-title-group>
      <issn pub-type="epub">${escapeXml(issn)}</issn>
      <publisher>
        <publisher-name>${escapeXml(publisher)}</publisher-name>
      </publisher>
      <self-uri xlink:href="${escapeXml(baseUrl)}"/>
    </journal-meta>
    <article-meta>
      <article-id pub-id-type="publisher-id">${escapeXml(paper.paperId)}</article-id>${paper.doi ? `\n      <article-id pub-id-type="doi">${escapeXml(paper.doi)}</article-id>` : ''}
      <article-categories>
        <subj-group subj-group-type="heading">
          <subject>${escapeXml(paper.sectionTitle || 'Original Research Articles')}</subject>
        </subj-group>${paper.sectionIdentifyType ? `
        <subj-group subj-group-type="article-type">
          <subject>${escapeXml(paper.sectionIdentifyType)}</subject>
        </subj-group>` : ''}
      </article-categories>
      <title-group>
        <article-title>${escapeXml(paper.title)}</article-title>
      </title-group>
      <contrib-group>
${contribsXml}
      </contrib-group>
${affsXml}
      <pub-date date-type="pub" publication-format="electronic">
        <day>${pubDateParts.day}</day>
        <month>${pubDateParts.month}</month>
        <year>${pubDateParts.year}</year>
      </pub-date>
      <volume>${paper.volumeNumber || 1}</volume>
      <issue>${paper.issueNumber || 1}</issue>${paper.startPage !== null && paper.startPage !== undefined ? `\n      <fpage>${paper.startPage}</fpage>` : ''}${paper.endPage !== null && paper.endPage !== undefined ? `\n      <lpage>${paper.endPage}</lpage>` : ''}
      <history>
        <date date-type="received" iso-8601-date="${subDateParts.iso}">
          <day>${subDateParts.day}</day>
          <month>${subDateParts.month}</month>
          <year>${subDateParts.year}</year>
        </date>
        <date date-type="accepted" iso-8601-date="${accDateParts.iso}">
          <day>${accDateParts.day}</day>
          <month>${accDateParts.month}</month>
          <year>${accDateParts.year}</year>
        </date>
      </history>
      <permissions>
        <copyright-statement>Copyright &#169; ${pubDateParts.year} ${escapeXml(authorString)}. Published by ${escapeXml(publisher)}.</copyright-statement>
        <copyright-year>${pubDateParts.year}</copyright-year>
        <copyright-holder>${escapeXml(authorString)}</copyright-holder>
        <license xlink:href="https://creativecommons.org/licenses/by/4.0/">
          <license-p>This is an open-access article distributed under the terms of the Creative Commons Attribution 4.0 International License (CC BY 4.0), which permits unrestricted use, distribution, and reproduction in any medium, provided the original author and source are properly credited.</license-p>
        </license>
      </permissions>
      <self-uri content-type="html" xlink:href="${escapeXml(canonicalUrl)}"/>${pdfUrl ? `\n      <self-uri content-type="pdf" xlink:href="${escapeXml(pdfUrl)}"/>` : ''}
      <abstract xml:lang="en">
        <p>${escapeXml(cleanAbstract)}</p>
      </abstract>${keywordsXml}
    </article-meta>
  </front>
  <body>
    <sec id="sec-summary">
      <title>Article Overview</title>
      <p>${escapeXml(cleanAbstract)}</p>
    </sec>
  </body>${disclosuresXml}
</article>`;
}

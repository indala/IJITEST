import { escapeXml } from "@/lib/crossref-generator";
import type { PublishedPaperUI, Issue } from "@/db/types";

export interface OaiParams {
    verb?: string | null;
    identifier?: string | null;
    metadataPrefix?: string | null;
    from?: string | null;
    until?: string | null;
    set?: string | null;
    resumptionToken?: string | null;
}

export interface OaiRepositoryConfig {
    repositoryName: string;
    baseURL: string;
    protocolVersion: string;
    adminEmail: string;
    earliestDatestamp: string;
    deletedRecord: "no" | "transient" | "persistent";
    granularity: string;
    repositoryIdentifier: string; // e.g., 'ijitest.org'
}

/**
 * Format date to OAI-PMH compliant UTC ISO8601 datestamp (YYYY-MM-DDTHH:mm:ssZ)
 */
export function formatOaiDatestamp(date: Date | string | number | null | undefined): string {
    if (!date) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    const d = new Date(date);
    if (isNaN(d.getTime())) return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
    return d.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Convert paperId to canonical OAI identifier
 */
export function paperIdToOaiIdentifier(repoId: string, paperId: string): string {
    return `oai:${repoId}:article/${paperId}`;
}

/**
 * Extract paperId from canonical OAI identifier
 */
export function oaiIdentifierToPaperId(repoId: string, identifier: string): string | null {
    const prefix = `oai:${repoId}:article/`;
    if (identifier.startsWith(prefix)) {
        return identifier.slice(prefix.length).trim();
    }
    // Also support fallback without article/ prefix
    const altPrefix = `oai:${repoId}:`;
    if (identifier.startsWith(altPrefix)) {
        return identifier.slice(altPrefix.length).trim();
    }
    return null;
}

/**
 * Render standard OAI-PMH 2.0 XML Envelope
 */
export function renderOaiResponse({
    requestUrl,
    params,
    contentXml,
}: {
    requestUrl: string;
    params: OaiParams;
    contentXml: string;
}): string {
    const responseDate = formatOaiDatestamp(new Date());

    // Build attributes for <request> tag
    const requestAttrs: string[] = [];
    if (params.verb) requestAttrs.push(`verb="${escapeXml(params.verb)}"`);
    if (params.metadataPrefix) requestAttrs.push(`metadataPrefix="${escapeXml(params.metadataPrefix)}"`);
    if (params.identifier) requestAttrs.push(`identifier="${escapeXml(params.identifier)}"`);
    if (params.from) requestAttrs.push(`from="${escapeXml(params.from)}"`);
    if (params.until) requestAttrs.push(`until="${escapeXml(params.until)}"`);
    if (params.set) requestAttrs.push(`set="${escapeXml(params.set)}"`);
    if (params.resumptionToken) requestAttrs.push(`resumptionToken="${escapeXml(params.resumptionToken)}"`);

    const requestTag = requestAttrs.length > 0
        ? `<request ${requestAttrs.join(' ')}>${escapeXml(requestUrl)}</request>`
        : `<request>${escapeXml(requestUrl)}</request>`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<OAI-PMH xmlns="http://www.openarchives.org/OAI/2.0/"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/
         http://www.openarchives.org/OAI/2.0/OAI-PMH.xsd">
  <responseDate>${responseDate}</responseDate>
  ${requestTag}
  ${contentXml}
</OAI-PMH>
`;
}

/**
 * Render OAI-PMH Error XML
 */
export function renderOaiError(code: string, message: string): string {
    return `<error code="${escapeXml(code)}">${escapeXml(message)}</error>`;
}

/**
 * Verb: Identify
 */
export function renderOaiIdentify(config: OaiRepositoryConfig): string {
    return `<Identify>
    <repositoryName>${escapeXml(config.repositoryName)}</repositoryName>
    <baseURL>${escapeXml(config.baseURL)}</baseURL>
    <protocolVersion>${escapeXml(config.protocolVersion)}</protocolVersion>
    <adminEmail>${escapeXml(config.adminEmail)}</adminEmail>
    <earliestDatestamp>${escapeXml(config.earliestDatestamp)}</earliestDatestamp>
    <deletedRecord>${escapeXml(config.deletedRecord)}</deletedRecord>
    <granularity>${escapeXml(config.granularity)}</granularity>
  </Identify>`;
}

/**
 * Verb: ListMetadataFormats
 */
export function renderOaiListMetadataFormats(): string {
    return `<ListMetadataFormats>
    <metadataFormat>
      <metadataPrefix>oai_dc</metadataPrefix>
      <schema>http://www.openarchives.org/OAI/2.0/oai_dc.xsd</schema>
      <metadataNamespace>http://www.openarchives.org/OAI/2.0/oai_dc/</metadataNamespace>
    </metadataFormat>
  </ListMetadataFormats>`;
}

/**
 * Verb: ListSets
 */
export function renderOaiListSets(issues: Issue[]): string {
    const sets = issues.map((iss) => {
        const setSpec = `vol_${iss.volumeNumber}:iss_${iss.issueNumber}`;
        const setName = `Volume ${iss.volumeNumber}, Issue ${iss.issueNumber} (${iss.year})`;
        return `    <set>
      <setSpec>${escapeXml(setSpec)}</setSpec>
      <setName>${escapeXml(setName)}</setName>
    </set>`;
    }).join('\n');

    return `<ListSets>
${sets}
  </ListSets>`;
}

/**
 * Helper to render single Dublin Core metadata element for a paper
 */
export function renderPaperDublinCore(
    paper: PublishedPaperUI,
    settings: Record<string, string>,
    config: OaiRepositoryConfig
): string {
    const journalTitle = settings['journalName'] || config.repositoryName;
    const publisher = settings['publisherName'] || journalTitle;
    const baseUrl = config.baseURL.replace(/\/api\/oai\/?$/, '');
    const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
    const pdfUrl = paper.pdfUrl ? (paper.pdfUrl.startsWith('http') ? paper.pdfUrl : `${baseUrl}${paper.pdfUrl}`) : '';
    const pubDate = paper.publishedAt
        ? new Date(paper.publishedAt).toISOString().split('T')[0]
        : (paper.publicationYear ? String(paper.publicationYear) : '');

    // Authors as multiple dc:creator
    const authors: string[] = [];
    if (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0) {
        paper.coAuthors.forEach(a => authors.push(a.name));
    } else if (paper.authorName) {
        authors.push(paper.authorName);
    }
    const creatorsXml = authors.map(a => `        <dc:creator>${escapeXml(a)}</dc:creator>`).join('\n');

    // Keywords as dc:subject
    const subjects: string[] = (paper.keywords || '')
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);
    const subjectsXml = subjects.map(s => `        <dc:subject>${escapeXml(s)}</dc:subject>`).join('\n');

    const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();

    return `      <oai_dc:dc xmlns:oai_dc="http://www.openarchives.org/OAI/2.0/oai_dc/"
                 xmlns:dc="http://purl.org/dc/elements/1.1/"
                 xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xsi:schemaLocation="http://www.openarchives.org/OAI/2.0/oai_dc/
                 http://www.openarchives.org/OAI/2.0/oai_dc.xsd">
        <dc:title>${escapeXml(paper.title)}</dc:title>
${creatorsXml}
${subjectsXml}
        ${cleanAbstract ? `<dc:description>${escapeXml(cleanAbstract)}</dc:description>` : ''}
        <dc:publisher>${escapeXml(publisher)}</dc:publisher>
        <dc:date>${escapeXml(pubDate)}</dc:date>
        <dc:type>info:eu-repo/semantics/article</dc:type>
        <dc:type>publication-type/research-article</dc:type>
        <dc:format>application/pdf</dc:format>
        <dc:identifier>${escapeXml(canonicalUrl)}</dc:identifier>
        ${pdfUrl ? `<dc:identifier>${escapeXml(pdfUrl)}</dc:identifier>` : ''}
        ${paper.doi ? `<dc:identifier>doi:${escapeXml(paper.doi)}</dc:identifier>` : ''}
        <dc:source>${escapeXml(journalTitle)}; Vol. ${paper.volumeNumber} No. ${paper.issueNumber} (${paper.publicationYear})</dc:source>
        <dc:language>eng</dc:language>
        <dc:rights>https://creativecommons.org/licenses/by/4.0/</dc:rights>
      </oai_dc:dc>`;
}

/**
 * Verb: ListIdentifiers
 */
export function renderOaiListIdentifiers(
    papers: PublishedPaperUI[],
    config: OaiRepositoryConfig
): string {
    const headers = papers.map((paper) => {
        const identifier = paperIdToOaiIdentifier(config.repositoryIdentifier, paper.paperId);
        const datestamp = formatOaiDatestamp(paper.updatedAt || paper.publishedAt);
        const setSpec = `vol_${paper.volumeNumber}:iss_${paper.issueNumber}`;

        return `    <header>
      <identifier>${escapeXml(identifier)}</identifier>
      <datestamp>${datestamp}</datestamp>
      <setSpec>${escapeXml(setSpec)}</setSpec>
    </header>`;
    }).join('\n');

    return `<ListIdentifiers>
${headers}
  </ListIdentifiers>`;
}

/**
 * Verb: ListRecords
 */
export function renderOaiListRecords(
    papers: PublishedPaperUI[],
    settings: Record<string, string>,
    config: OaiRepositoryConfig
): string {
    const records = papers.map((paper) => {
        const identifier = paperIdToOaiIdentifier(config.repositoryIdentifier, paper.paperId);
        const datestamp = formatOaiDatestamp(paper.updatedAt || paper.publishedAt);
        const setSpec = `vol_${paper.volumeNumber}:iss_${paper.issueNumber}`;
        const dcXml = renderPaperDublinCore(paper, settings, config);

        return `    <record>
      <header>
        <identifier>${escapeXml(identifier)}</identifier>
        <datestamp>${datestamp}</datestamp>
        <setSpec>${escapeXml(setSpec)}</setSpec>
      </header>
      <metadata>
${dcXml}
      </metadata>
    </record>`;
    }).join('\n');

    return `<ListRecords>
${records}
  </ListRecords>`;
}

/**
 * Verb: GetRecord
 */
export function renderOaiGetRecord(
    paper: PublishedPaperUI,
    settings: Record<string, string>,
    config: OaiRepositoryConfig
): string {
    const identifier = paperIdToOaiIdentifier(config.repositoryIdentifier, paper.paperId);
    const datestamp = formatOaiDatestamp(paper.updatedAt || paper.publishedAt);
    const setSpec = `vol_${paper.volumeNumber}:iss_${paper.issueNumber}`;
    const dcXml = renderPaperDublinCore(paper, settings, config);

    return `<GetRecord>
    <record>
      <header>
        <identifier>${escapeXml(identifier)}</identifier>
        <datestamp>${datestamp}</datestamp>
        <setSpec>${escapeXml(setSpec)}</setSpec>
      </header>
      <metadata>
${dcXml}
      </metadata>
    </record>
  </GetRecord>`;
}

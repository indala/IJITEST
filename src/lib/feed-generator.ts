import type { PublishedPaperUI } from "@/db/types";
import { escapeXml } from "@/lib/crossref-generator";

interface GenerateFeedOptions {
    settings: Record<string, string>;
    papers: PublishedPaperUI[];
    feedUrl: string;
}

/**
 * Format a Date to RFC-822 (used in RSS 2.0)
 * Example: Fri, 11 Sep 2026 05:30:00 GMT
 */
function toRfc822(dateVal: Date | string | null | undefined, fallbackYear?: number): string {
    const d = dateVal ? new Date(dateVal) : (fallbackYear ? new Date(fallbackYear, 0, 1) : new Date());
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    return validDate.toUTCString();
}

/**
 * Format a Date to ISO 8601 (used in Atom)
 * Example: 2026-09-11T05:30:00Z
 */
function toIso8601(dateVal: Date | string | null | undefined, fallbackYear?: number): string {
    const d = dateVal ? new Date(dateVal) : (fallbackYear ? new Date(fallbackYear, 0, 1) : new Date());
    const validDate = isNaN(d.getTime()) ? new Date() : d;
    return validDate.toISOString();
}

/**
 * Generate RSS 2.0 XML Scholarly Feed
 */
export function generateRssFeed({ settings, papers, feedUrl }: GenerateFeedOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalDesc = settings['journalDescription'] || 'Elite International Peer-Reviewed Journal for High-Quality Research in Engineering, Science, and Technology.';
    const baseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');

    const latestPaper = papers[0];
    const latestDate = toRfc822(latestPaper?.publishedAt || latestPaper?.issueDatePublished, latestPaper?.publicationYear || undefined);

    const itemsXml = papers.map((paper) => {
        const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
        const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();
        const authorString = (Array.isArray(paper.authorsList) && paper.authorsList.length > 0)
            ? paper.authorsList.join(', ')
            : paper.authorName;

        const pubDate = toRfc822(paper.publishedAt || paper.issueDatePublished, paper.publicationYear || undefined);
        const sectionName = paper.sectionTitle || 'Original Research Articles';

        return `    <item>
      <title>${escapeXml(paper.title)}</title>
      <link>${escapeXml(canonicalUrl)}</link>
      <guid isPermaLink="true">${escapeXml(canonicalUrl)}</guid>
      <dc:creator>${escapeXml(authorString)}</dc:creator>
      <category>${escapeXml(sectionName)}</category>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(cleanAbstract)}</description>
      ${paper.doi ? `<dc:identifier>doi:${escapeXml(paper.doi)}</dc:identifier>` : ''}
      <dc:rights>Copyright &#169; ${new Date().getFullYear()} ${escapeXml(authorString)}. Licensed under CC-BY 4.0.</dc:rights>
    </item>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(journalTitle)}</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>${escapeXml(journalDesc)}</description>
    <language>en</language>
    <pubDate>${latestDate}</pubDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />
    <generator>IJITEST Scholarly Feed Engine</generator>
    <docs>https://www.rssboard.org/rss-specification</docs>
${itemsXml}
  </channel>
</rss>`;
}

/**
 * Generate Atom 1.0 XML Scholarly Feed
 */
export function generateAtomFeed({ settings, papers, feedUrl }: GenerateFeedOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const journalDesc = settings['journalDescription'] || 'Elite International Peer-Reviewed Journal for High-Quality Research in Engineering, Science, and Technology.';
    const baseUrl = (settings['journalWebsite'] || 'https://ijitest.org').replace(/\/$/, '');

    const latestPaper = papers[0];
    const latestDateIso = toIso8601(latestPaper?.publishedAt || latestPaper?.issueDatePublished, latestPaper?.publicationYear || undefined);

    const entriesXml = papers.map((paper) => {
        const canonicalUrl = `${baseUrl}/archives/volume${paper.volumeNumber}/issue${paper.issueNumber}/${paper.paperId}`;
        const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();

        const publishedIso = toIso8601(paper.publishedAt || paper.issueDatePublished, paper.publicationYear || undefined);
        const updatedIso = toIso8601(paper.updatedAt || paper.publishedAt, paper.publicationYear || undefined);
        const sectionName = paper.sectionTitle || 'Original Research Articles';

        const rawAuthors = (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0)
            ? paper.coAuthors
            : [{ name: paper.authorName }];

        const authorsXml = rawAuthors.map(a => `      <author>\n        <name>${escapeXml(a.name)}</name>\n      </author>`).join('\n');
        const authorString = rawAuthors.map(a => a.name).join(', ') || paper.authorName;

        return `  <entry>
    <id>${escapeXml(canonicalUrl)}</id>
    <title>${escapeXml(paper.title)}</title>
    <link rel="alternate" href="${escapeXml(canonicalUrl)}" />
    <published>${publishedIso}</published>
    <updated>${updatedIso}</updated>
${authorsXml}
    <category term="${escapeXml(sectionName)}" label="${escapeXml(sectionName)}" />
    <summary type="html">${escapeXml(cleanAbstract)}</summary>
    <rights>Copyright &#169; ${new Date().getFullYear()} ${escapeXml(authorString)}. Licensed under CC-BY 4.0.</rights>
  </entry>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${escapeXml(feedUrl)}</id>
  <title>${escapeXml(journalTitle)}</title>
  <subtitle>${escapeXml(journalDesc)}</subtitle>
  <updated>${latestDateIso}</updated>
  <link rel="alternate" href="${escapeXml(baseUrl)}" />
  <link rel="self" type="application/atom+xml" href="${escapeXml(feedUrl)}" />
  <generator uri="${escapeXml(baseUrl)}" version="1.0">IJITEST Scholarly Feed Engine</generator>
${entriesXml}
</feed>`;
}

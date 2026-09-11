import type { PublishedPaperUI, Author } from "@/db/types";
import { escapeXml, splitAuthorName } from "@/lib/crossref-generator";

interface GeneratePubMedXmlOptions {
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
 * Format Date to { year, month, day }
 */
function parseDateParts(dateVal: Date | string | null | undefined, fallbackYear?: number): {
    year: string;
    month: string;
    day: string;
} {
    const d = dateVal ? new Date(dateVal) : (fallbackYear ? new Date(fallbackYear, 0, 1) : new Date());
    const validDate = isNaN(d.getTime()) ? new Date() : d;

    const year = String(validDate.getFullYear());
    const month = String(validDate.getMonth() + 1).padStart(2, '0');
    const day = String(validDate.getDate()).padStart(2, '0');

    return { year, month, day };
}

/**
 * Generate standard NLM PubMed 2.8 DTD XML for one or more published articles
 */
export function generatePubMedXml({ settings, papers, issue }: GeneratePubMedXmlOptions): string {
    const journalTitle = settings['journalName'] || 'International Journal of Innovative Trends in Engineering Science and Technology';
    const issn = (settings['issnNumber'] || '3139-6887').replace(/[^0-9X-]/gi, '');
    const publisher = settings['publisherName'] || 'IJITEST Publication';

    if (!papers || papers.length === 0) {
        throw new Error("Cannot generate PubMed XML: No papers provided.");
    }

    const articlesXml = papers.map((paper) => {
        const volNum = issue?.volumeNumber ?? paper.volumeNumber ?? 1;
        const issNum = issue?.issueNumber ?? paper.issueNumber ?? 1;

        const resolvedPubDate = paper.publishedAt || paper.issueDatePublished || (issue as any)?.datePublished;
        const pubDate = parseDateParts(resolvedPubDate, issue?.year ?? paper.publicationYear ?? undefined);
        const subDate = parseDateParts(paper.submittedAt, issue?.year ?? paper.publicationYear ?? undefined);
        const accDate = parseDateParts(paper.acceptedAt || resolvedPubDate, issue?.year ?? paper.publicationYear ?? undefined);

        // Authors
        const rawAuthors: Author[] = (Array.isArray(paper.coAuthors) && paper.coAuthors.length > 0)
            ? paper.coAuthors
            : [{
                name: paper.authorName,
                email: paper.authorEmail,
                institution: paper.affiliation,
                orcidId: null,
            } as unknown as Author];

        const authorsXml = rawAuthors.map((author) => {
            const { givenName, surname } = splitAuthorName(author.name);
            const affiliationXml = author.institution
                ? `\n        <AffiliationInfo>\n          <Affiliation>${escapeXml(author.institution)}</Affiliation>\n        </AffiliationInfo>`
                : '';
            const orcidXml = author.orcidId
                ? `\n        <Identifier Source="ORCID">${escapeXml(author.orcidId.replace(/^https?:\/\/orcid\.org\//, ''))}</Identifier>`
                : '';

            return `      <Author>
        <FirstName>${escapeXml(givenName || surname)}</FirstName>
        <LastName>${escapeXml(surname)}</LastName>${affiliationXml}${orcidXml}
      </Author>`;
        }).join('\n');

        // Pages
        const firstPageXml = (paper.startPage !== null && paper.startPage !== undefined)
            ? `\n    <FirstPage>${paper.startPage}</FirstPage>`
            : '';
        const lastPageXml = (paper.endPage !== null && paper.endPage !== undefined)
            ? `\n    <LastPage>${paper.endPage}</LastPage>`
            : '';

        // DOI
        const elocationDoi = paper.doi
            ? `\n    <ELocationID EIdType="doi">${escapeXml(paper.doi)}</ELocationID>`
            : '';
        const articleIdDoi = paper.doi
            ? `\n      <ArticleId IdType="doi">${escapeXml(paper.doi)}</ArticleId>`
            : '';

        // Abstract
        const cleanAbstract = (paper.abstract || '').replace(/<[^>]*>?/gm, '').trim();
        const abstractXml = cleanAbstract
            ? `\n    <Abstract>${escapeXml(cleanAbstract)}</Abstract>`
            : '';

        // Keywords
        const rawKeywords = (paper.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
        const keywordsXml = rawKeywords.length > 0
            ? `\n    <ObjectList>
${rawKeywords.map(k => `      <Object Type="keyword">\n        <Param Name="value">${escapeXml(k)}</Param>\n      </Object>`).join('\n')}
    </ObjectList>`
            : '';

        return `  <Article>
    <Journal>
      <PublisherName>${escapeXml(publisher)}</PublisherName>
      <JournalTitle>${escapeXml(journalTitle)}</JournalTitle>
      <Issn>${escapeXml(issn)}</Issn>
      <Volume>${volNum}</Volume>
      <Issue>${issNum}</Issue>
      <PubDate PubStatus="epublish">
        <Year>${pubDate.year}</Year>
        <Month>${pubDate.month}</Month>
        <Day>${pubDate.day}</Day>
      </PubDate>
    </Journal>
    <ArticleTitle>${escapeXml(paper.title)}</ArticleTitle>${firstPageXml}${lastPageXml}${elocationDoi}
    <Language>eng</Language>
    <AuthorList>
${authorsXml}
    </AuthorList>
    <ArticleIdList>
      <ArticleId IdType="pii">${escapeXml(paper.paperId)}</ArticleId>${articleIdDoi}
    </ArticleIdList>
    <History>
      <PubDate PubStatus="received">
        <Year>${subDate.year}</Year>
        <Month>${subDate.month}</Month>
        <Day>${subDate.day}</Day>
      </PubDate>
      <PubDate PubStatus="accepted">
        <Year>${accDate.year}</Year>
        <Month>${accDate.month}</Month>
        <Day>${accDate.day}</Day>
      </PubDate>
    </History>${abstractXml}${keywordsXml}
  </Article>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE ArticleSet PUBLIC "-//NLM//DTD PubMed 2.8//EN" "https://dtd.nlm.nih.gov/ncbi/pubmed/in/PubMed.dtd">
<ArticleSet>
${articlesXml}
</ArticleSet>`;
}

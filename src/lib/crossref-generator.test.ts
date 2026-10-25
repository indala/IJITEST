import assert from "node:assert/strict";
import test from "node:test";
import type { PublishedPaperUI } from "@/db/types";
import { generateCrossRefXml } from "./crossref-generator";

function paper(overrides: Partial<PublishedPaperUI> = {}): PublishedPaperUI {
    return {
        paperId: "IJITEST-2026-001",
        title: "A test paper",
        doi: "10.68139/ijitest.2026.001",
        authorName: "Ada Lovelace",
        abstract: "Test abstract",
        coAuthors: [],
        issueDatePublished: "2026-03-26",
        publicationYear: 2026,
        volumeNumber: 1,
        issueNumber: 1,
        ...overrides,
    } as PublishedPaperUI;
}

test("uses the issue publication date rather than the export date", () => {
    const xml = generateCrossRefXml({
        settings: {},
        papers: [paper()],
    });

    assert.match(xml, /<journal_issue>[\s\S]*?<publication_date media_type="online">\s*<month>03<\/month>\s*<year>2026<\/year>/);
    assert.match(xml, /<publication_date media_type="online">\s*<month>03<\/month>\s*<day>26<\/day>\s*<year>2026<\/year>/);
});

test("requires a real issue publication date instead of inventing one", () => {
    assert.throws(
        () => generateCrossRefXml({
            settings: {},
            papers: [paper({ issueDatePublished: null })],
        }),
        /valid issue publication date is required/
    );
});

test("includes Crossref best-practice Version of Record (VOR) and similarity-check crawler resources", () => {
    const xml = generateCrossRefXml({
        settings: {},
        papers: [paper({ pdfUrl: "/api/files/publications/paper_001.pdf" })],
    });

    assert.match(xml, /<resource content_version="vor">https:\/\/ijitest\.org\/article\/ijitest-2026-001<\/resource>/);
    assert.match(xml, /<ai:license_ref applies_to="vor">https:\/\/creativecommons\.org\/licenses\/by\/4\.0\/<\/ai:license_ref>/);
    assert.match(xml, /<item crawler="iParadigms">\s*<resource>https:\/\/ijitest\.org\/api\/files\/publications\/paper_001\.pdf<\/resource>\s*<\/item>/);
    assert.match(xml, /<item crawler="similarity-check">\s*<resource>https:\/\/ijitest\.org\/api\/files\/publications\/paper_001\.pdf<\/resource>\s*<\/item>/);
});

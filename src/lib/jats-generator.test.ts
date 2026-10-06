import assert from "node:assert/strict";
import test from "node:test";
import type { PublishedPaperUI } from "@/db/types";
import { generateJatsXml } from "./jats-generator";

function paper(overrides: Partial<PublishedPaperUI> = {}): PublishedPaperUI {
    return {
        paperId: "IJITEST-2026-001",
        title: "A test paper",
        authorName: "Ada Lovelace",
        abstract: "Test abstract",
        coAuthors: [],
        issueDatePublished: "2026-03-26",
        publicationYear: 2026,
        volumeNumber: 1,
        issueNumber: 1,
        submittedAt: "2026-03-01",
        ...overrides,
    } as PublishedPaperUI;
}

test("does not infer a no-conflict declaration when disclosure fields are empty", () => {
    const xml = generateJatsXml({ settings: {}, paper: paper() });

    assert.doesNotMatch(xml, /no competing interests exist/i);
    assert.doesNotMatch(xml, /<sec sec-type="declarations">/);
});

test("exports only declarations supplied for the article", () => {
    const xml = generateJatsXml({
        settings: {},
        paper: paper({ fundingStatement: "Supported by Research Fund X" }),
    });

    assert.match(xml, /<sec sec-type="funding"><title>Funding<\/title><p>Supported by Research Fund X<\/p><\/sec>/);
    assert.doesNotMatch(xml, /<sec sec-type="conflict-of-interest">/);
    assert.doesNotMatch(xml, /<sec sec-type="ethical-approval">/);
});

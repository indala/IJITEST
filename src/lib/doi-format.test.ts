import assert from "node:assert/strict";
import test from "node:test";
import { isValidDoi, normalizeDoi, generateJackDoi } from "./doi-format";

test("normalizes DOI URLs and labels", () => {
    assert.equal(normalizeDoi(" https://doi.org/10.68139/abc-1 "), "10.68139/abc-1");
    assert.equal(normalizeDoi("http://dx.doi.org/10.68139/abc-1"), "10.68139/abc-1");
    assert.equal(normalizeDoi("DOI: 10.68139/abc-1"), "10.68139/abc-1");
});

test("strips accidental double-prefixed DOIs", () => {
    assert.equal(normalizeDoi("10.68139/10.5281/zenodo.23882713"), "10.5281/zenodo.23882713");
});

test("normalizes Zenodo record numbers and URLs", () => {
    assert.equal(normalizeDoi("23882713", "zenodo"), "10.5281/zenodo.23882713");
    assert.equal(normalizeDoi("zenodo.23882713"), "10.5281/zenodo.23882713");
    assert.equal(normalizeDoi("https://zenodo.org/records/23882713"), "10.5281/zenodo.23882713");
    assert.equal(normalizeDoi("https://zenodo.org/record/23882713"), "10.5281/zenodo.23882713");
});

test("generates JACK tricky DOI pattern correctly", () => {
    // Exact user requirement: jack + 26 (year) + 1 (volume) + 11 (paperId) -> /ijitest.j2a6c1k11
    const res = generateJackDoi("10.68139", "IJITEST-2026-011", 1, 2026);
    assert.equal(res.suffix, "ijitest.j2a6c1k11");
    assert.equal(res.fullDoi, "10.68139/ijitest.j2a6c1k11");
    assert.equal(res.jackPattern, "j2a6c1k11");
    assert.equal(isValidDoi(res.fullDoi), true);

    // Another example: Issue 2, Paper 25
    const res2 = generateJackDoi("10.68139", "IJITEST-2026-025", 1, 2026);
    assert.equal(res2.suffix, "ijitest.j2a6c1k25");
    assert.equal(res2.fullDoi, "10.68139/ijitest.j2a6c1k25");
});

test("validates DOI syntax", () => {
    assert.equal(isValidDoi("10.68139/abc-1"), true);
    assert.equal(isValidDoi("10.5281/zenodo.23882713"), true);
    assert.equal(isValidDoi("10.68139/ijitest.j2a6c1k11"), true);
    assert.equal(isValidDoi("10.1234/"), false);
    assert.equal(isValidDoi("doi:10.68139/abc-1"), false);
});

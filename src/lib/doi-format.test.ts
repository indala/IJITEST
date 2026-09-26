import assert from "node:assert/strict";
import test from "node:test";
import { isValidDoi, normalizeDoi } from "./doi-format";

test("normalizes DOI URLs and labels", () => {
    assert.equal(normalizeDoi(" https://doi.org/10.68139/abc-1 "), "10.68139/abc-1");
    assert.equal(normalizeDoi("http://dx.doi.org/10.68139/abc-1"), "10.68139/abc-1");
    assert.equal(normalizeDoi("DOI: 10.68139/abc-1"), "10.68139/abc-1");
});

test("validates DOI syntax", () => {
    assert.equal(isValidDoi("10.68139/abc-1"), true);
    assert.equal(isValidDoi("10.1234/"), false);
    assert.equal(isValidDoi("doi:10.68139/abc-1"), false);
});

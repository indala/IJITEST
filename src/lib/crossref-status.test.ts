import assert from "node:assert/strict";
import test from "node:test";
import { isCrossrefWorkForDoi } from "./crossref-status";

test("confirms only the exact DOI returned by Crossref", () => {
    assert.equal(
        isCrossrefWorkForDoi({ message: { DOI: "10.68139/ijitest.j2a6c1k2" } }, "10.68139/ijitest.j2a6c1k2"),
        true
    );
    assert.equal(
        isCrossrefWorkForDoi({ message: { DOI: "10.68139/other-doi" } }, "10.68139/ijitest.j2a6c1k2"),
        false
    );
    assert.equal(isCrossrefWorkForDoi({ message: {} }, "10.68139/ijitest.j2a6c1k2"), false);
    assert.equal(isCrossrefWorkForDoi(null, "10.68139/ijitest.j2a6c1k2"), false);
});

test("requires a matching Crossref title when verifying an assigned DOI", () => {
    const record = { message: { DOI: "10.68139/ijitest.j2a6c1k2", title: ["A Test: Paper!"] } };
    assert.equal(isCrossrefWorkForDoi(record, "10.68139/ijitest.j2a6c1k2", "A test paper"), true);
    assert.equal(isCrossrefWorkForDoi(record, "10.68139/ijitest.j2a6c1k2", "A different paper"), false);
});

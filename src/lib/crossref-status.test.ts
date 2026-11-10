import assert from "node:assert/strict";
import test from "node:test";
import { isCrossrefWorkForDoi, parseCrossrefSubmissionReport } from "./crossref-status";

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

test("parses successful Crossref submission diagnostic report", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch_diagnostic status="completed">
   <submission_id>123456</submission_id>
   <batch_id>cr-17000000-001</batch_id>
   <record_diagnostic status="Success">
      <doi>10.68139/ijitest.j2a6c1k11</doi>
      <msg>Successfully added</msg>
   </record_diagnostic>
   <batch_data>
      <record_count>1</record_count>
      <success_count>1</success_count>
      <warning_count>0</warning_count>
      <failure_count>0</failure_count>
   </batch_data>
</doi_batch_diagnostic>`;

    const result = parseCrossrefSubmissionReport(xml);
    assert.equal(result.status, "registered");
    assert.equal(result.successCount, 1);
    assert.equal(result.failureCount, 0);
});

test("parses failed Crossref submission diagnostic report", () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch_diagnostic status="completed">
   <submission_id>123456</submission_id>
   <batch_id>cr-17000000-001</batch_id>
   <record_diagnostic status="Failure">
      <doi>10.68139/ijitest.j2a6c1k11</doi>
      <msg>Record contains invalid ISSN or duplicate publication date</msg>
   </record_diagnostic>
   <batch_data>
      <record_count>1</record_count>
      <success_count>0</success_count>
      <warning_count>0</warning_count>
      <failure_count>1</failure_count>
   </batch_data>
</doi_batch_diagnostic>`;

    const result = parseCrossrefSubmissionReport(xml);
    assert.equal(result.status, "failed");
    assert.equal(result.failureCount, 1);
    assert.match(result.message || "", /invalid ISSN or duplicate/);
});


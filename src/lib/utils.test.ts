import test from "node:test";
import assert from "node:assert/strict";
import { cn, getSecureUrl, formatDate, renderTemplateText, getErrorMessage } from "./utils";

test("cn merges class names properly", () => {
    assert.equal(cn("px-4", "py-2"), "px-4 py-2");
    assert.equal(cn("px-4", false && "hidden", "py-2"), "px-4 py-2");
    // Tailwind merge override
    assert.equal(cn("p-4", "p-2"), "p-2");
});

test("getSecureUrl protects and normalizes asset paths", () => {
    assert.equal(getSecureUrl(null), "");
    assert.equal(getSecureUrl(undefined), "");
    assert.equal(getSecureUrl(""), "");

    // Already routed through api
    assert.equal(getSecureUrl("/api/files/uploads/file.pdf"), "/api/files/uploads/file.pdf");

    // Standard uploads route prefixing
    assert.equal(getSecureUrl("/uploads/submissions/manuscript.pdf"), "/api/files/uploads/submissions/manuscript.pdf");

    // Remote or external URLs are preserved
    assert.equal(getSecureUrl("https://example.com/paper.pdf"), "https://example.com/paper.pdf");
});

test("formatDate renders deterministic UTC date strings", () => {
    assert.equal(formatDate(null), "");
    assert.equal(formatDate(undefined), "");
    assert.equal(formatDate("invalid-date-string"), "");

    // Fixed UTC timestamp: 2026-05-15T00:00:00Z -> 15/05/2026
    const d1 = new Date("2026-05-15T00:00:00.000Z");
    assert.equal(formatDate(d1), "15/05/2026");

    // String date
    assert.equal(formatDate("2026-12-01T12:00:00.000Z"), "01/12/2026");
});

test("renderTemplateText interpolates data variables safely", () => {
    const template = "Dear {{authorName}}, your submission {{paperId}} is received.";
    const result = renderTemplateText(template, {
        authorName: "Dr. Jane Doe",
        paperId: "IJITEST-2026-001",
    });
    assert.equal(result, "Dear Dr. Jane Doe, your submission IJITEST-2026-001 is received.");

    // Unknown variables remain untouched
    const incomplete = renderTemplateText("Hello {{known}} and {{unknown}}", {
        known: "Friend",
    });
    assert.equal(incomplete, "Hello Friend and {{unknown}}");

    // Numbers are converted to string
    const numResult = renderTemplateText("Count: {{count}}", { count: 42 });
    assert.equal(numResult, "Count: 42");
});

test("getErrorMessage extracts human-readable text from unknown errors", () => {
    assert.equal(getErrorMessage(new Error("Network timeout")), "Network timeout");
    assert.equal(getErrorMessage("Raw failure string"), "Raw failure string");
    assert.equal(getErrorMessage(404), "404");
    assert.equal(getErrorMessage({ custom: "obj" }), "[object Object]");
    assert.equal(getErrorMessage(null), "null");
});


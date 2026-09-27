import test from "node:test";
import assert from "node:assert/strict";
import { formatEmailBodyToHtml, emailManuscriptCard, renderBrandedEmail } from "./email-layout";

test("formatEmailBodyToHtml markdown transformations", async (t) => {
    await t.test("converts markdown headings to styled html headers", () => {
        const raw = "### Important Update\nPlease review the attached comments.";
        const html = formatEmailBodyToHtml(raw);
        assert.ok(html.includes("<h3"), "Should output <h3> element");
        assert.ok(html.includes("Important Update"), "Should preserve heading text");
    });

    await t.test("converts bold text into strong tags", () => {
        const raw = "Please submit by **Monday morning**.";
        const html = formatEmailBodyToHtml(raw);
        assert.ok(html.includes("<strong>Monday morning</strong>"));
    });

    await t.test("converts list items into unordered list markup", () => {
        const raw = "- First item\n- Second item\n- Third item";
        const html = formatEmailBodyToHtml(raw);
        assert.ok(html.includes("<ul"), "Should output <ul>");
        assert.ok(html.includes("<li>First item</li>"));
        assert.ok(html.includes("<li>Second item</li>"));
        assert.ok(html.includes("<li>Third item</li>"));
    });

    await t.test("converts blockquotes", () => {
        const raw = "> Reviewer 1 said: Manuscript is ready for acceptance.";
        const html = formatEmailBodyToHtml(raw);
        assert.ok(html.includes('class="email-blockquote"'));
        assert.ok(html.includes("Reviewer 1 said: Manuscript is ready for acceptance."));
    });

    await t.test("auto-links http and https URLs", () => {
        const raw = "Visit https://ijitest.org for details.";
        const html = formatEmailBodyToHtml(raw);
        assert.ok(html.includes('<a href="https://ijitest.org"'));
    });
});

test("emailManuscriptCard renders structured manuscript banner", () => {
    const card = emailManuscriptCard({
        paperId: "IJITEST-1042",
        title: "Quantum Neural Architectures",
        statusBadge: "Under Review",
    });
    assert.ok(card.includes("IJITEST-1042"));
    assert.ok(card.includes("Quantum Neural Architectures"));
    assert.ok(card.includes("Under Review"));
});

test("renderBrandedEmail wraps content in responsive email boilerplate", () => {
    const email = renderBrandedEmail("Your paper has been accepted.", {
        title: "Editorial Acceptance",
        cta: { text: "View Dashboard", url: "https://ijitest.org/author" },
    });
    assert.ok(email.includes("<!DOCTYPE html>"));
    assert.ok(email.includes("Editorial Acceptance"));
    assert.ok(email.includes("View Dashboard"));
    assert.ok(email.includes("https://ijitest.org/author"));
});

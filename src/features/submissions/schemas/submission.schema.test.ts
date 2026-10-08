import test from "node:test";
import assert from "node:assert/strict";
import {
    coAuthorSchema,
    formSchema,
    reviewerSuggestionSchema,
    retractionSchema,
    corrigendumSchema,
    resubmissionCommentsSchema,
} from "./submission.schema";

test("submission schema validation tests", async (t) => {
    await t.test("requires explicit research declarations", () => {
        const result = formSchema.safeParse({
            title: "A sufficiently long research title",
            authorName: "Ada Lovelace",
            authorEmail: "ada@example.org",
            authorDesignation: "Researcher",
            affiliation: "Example Institute",
            abstract: "A sufficiently long abstract about a research study that meets the minimum character requirement.",
            keywords: "engineering, systems",
            termsAccepted: true,
        });
        assert.equal(result.success, false);
    });

    await t.test("accepts complete declarations and optional contributor metadata", () => {
        const result = formSchema.safeParse({
            title: "A sufficiently long research title",
            authorName: "Ada Lovelace",
            authorEmail: "ada@example.org",
            authorDesignation: "Researcher",
            affiliation: "Example Institute",
            authorOrcid: "0000-0002-1825-0097",
            authorCreditRoles: ["Conceptualization", "Writing – Original Draft"],
            abstract: "A sufficiently long abstract about a research study that meets the minimum character requirement.",
            keywords: "engineering, systems",
            competingInterests: "The authors declare no competing interests.",
            fundingStatement: "This research received no external funding.",
            ethicalApproval: "Ethical approval was not applicable to this study.",
            dataAvailability: "Data are available at https://example.org/dataset/1.",
            termsAccepted: true,
        });
        assert.equal(result.success, true);
    });

    await t.test("coAuthorSchema validates valid and invalid authors", () => {
        const valid = coAuthorSchema.safeParse({
            name: "Dr. Alice Smith",
            email: "alice@university.edu",
            phone: "+1-555-1234567",
            designation: "Associate Professor",
            institution: "MIT",
        });
        assert.equal(valid.success, true);

        const invalidEmail = coAuthorSchema.safeParse({
            name: "Dr. Alice Smith",
            email: "not-an-email",
            designation: "Associate Professor",
            institution: "MIT",
        });
        assert.equal(invalidEmail.success, false);

        const validOrcid = coAuthorSchema.safeParse({
            name: "Dr. Alice Smith",
            email: "alice@university.edu",
            designation: "Associate Professor",
            institution: "MIT",
            orcidId: "https://orcid.org/0000-0002-1825-0097",
            creditRoles: ["Methodology"],
        });
        assert.equal(validOrcid.success, true);

        const invalidOrcid = coAuthorSchema.safeParse({
            name: "Dr. Alice Smith",
            email: "alice@university.edu",
            designation: "Associate Professor",
            institution: "MIT",
            orcidId: "0000-0002-1825-0098",
        });
        assert.equal(invalidOrcid.success, false);
    });

    await t.test("reviewerSuggestionSchema validates suggestions and oppositions", () => {
        const valid = reviewerSuggestionSchema.safeParse({
            type: "suggested",
            givenName: "Bob",
            familyName: "Jones",
            email: "bob.jones@lab.org",
            affiliation: "Oxford University",
            suggestionReason: "Domain expert in distributed algorithms",
        });
        assert.equal(valid.success, true);

        const invalidType = reviewerSuggestionSchema.safeParse({
            type: "neutral", // only 'suggested' | 'opposed'
            givenName: "Bob",
            email: "bob@lab.org",
        });
        assert.equal(invalidType.success, false);
    });

    await t.test("retractionSchema requires positive id and rationale", () => {
        const valid = retractionSchema.safeParse({
            submissionId: 42,
            reason: "Data duplication discovered in Figure 4.",
            noticeUrl: "https://ijitest.org/retractions/42",
        });
        assert.equal(valid.success, true);

        const invalidId = retractionSchema.safeParse({
            submissionId: -1,
            reason: "Data duplication.",
        });
        assert.equal(invalidId.success, false);

        const blankReason = retractionSchema.safeParse({
            submissionId: 42,
            reason: "   ",
        });
        assert.equal(blankReason.success, false);
    });

    await t.test("corrigendumSchema requires amendment details", () => {
        const valid = corrigendumSchema.safeParse({
            submissionId: 108,
            amendmentDetails: "Correction in Table 2 column headers.",
        });
        assert.equal(valid.success, true);

        const empty = corrigendumSchema.safeParse({
            submissionId: 108,
            amendmentDetails: "",
        });
        assert.equal(empty.success, false);
    });

    await t.test("resubmissionCommentsSchema trims and enforces length", () => {
        const valid = resubmissionCommentsSchema.safeParse("Please address reviewer #2's question on complexity.");
        assert.equal(valid.success, true);

        const empty = resubmissionCommentsSchema.safeParse("    ");
        assert.equal(empty.success, false);
    });
});

import test from "node:test";
import assert from "node:assert/strict";
import {
    coAuthorSchema,
    reviewerSuggestionSchema,
    retractionSchema,
    corrigendumSchema,
    resubmissionCommentsSchema,
} from "./submission.schema";

test("submission schema validation tests", async (t) => {
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

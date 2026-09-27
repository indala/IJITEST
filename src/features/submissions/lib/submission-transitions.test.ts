import test from "node:test";
import assert from "node:assert/strict";
import {
    canTransitionSubmission,
    getSubmissionStatusLabel,
    ALLOWED_SUBMISSION_TRANSITIONS,
} from "./submission-transitions";

test("submission status transition rules", async (t) => {
    await t.test("allows identity transition (status remains unchanged)", () => {
        assert.equal(canTransitionSubmission("submitted", "submitted"), true);
        assert.equal(canTransitionSubmission("underReview", "underReview"), true);
        assert.equal(canTransitionSubmission("published", "published"), true);
    });

    await t.test("allows valid sequential transitions from submitted", () => {
        assert.equal(canTransitionSubmission("submitted", "editorAssigned"), true);
        assert.equal(canTransitionSubmission("submitted", "underReview"), true);
        assert.equal(canTransitionSubmission("submitted", "rejected"), true);
    });

    await t.test("disallows skipping editorial review directly to published from submitted", () => {
        assert.equal(canTransitionSubmission("submitted", "published"), false);
        assert.equal(canTransitionSubmission("submitted", "retracted"), false);
        assert.equal(canTransitionSubmission("submitted", "paymentPending"), false);
    });

    await t.test("allows post-acceptance progression and payment pending", () => {
        assert.equal(canTransitionSubmission("accepted", "paymentPending"), true);
        assert.equal(canTransitionSubmission("accepted", "published"), true);
        assert.equal(canTransitionSubmission("paymentPending", "published"), true);
    });

    await t.test("handles terminal states correctly", () => {
        // Retracted is terminal
        assert.equal(ALLOWED_SUBMISSION_TRANSITIONS.retracted.length, 0);
        assert.equal(canTransitionSubmission("retracted", "published"), false);
        assert.equal(canTransitionSubmission("retracted", "submitted"), false);

        // Rejected is terminal
        assert.equal(ALLOWED_SUBMISSION_TRANSITIONS.rejected.length, 0);
        assert.equal(canTransitionSubmission("rejected", "accepted"), false);
        assert.equal(canTransitionSubmission("rejected", "underReview"), false);
    });

    await t.test("allows post-publication corrigendum and retraction", () => {
        assert.equal(canTransitionSubmission("published", "corrigendum"), true);
        assert.equal(canTransitionSubmission("published", "retracted"), true);
        assert.equal(canTransitionSubmission("corrigendum", "retracted"), true);
    });
});

test("getSubmissionStatusLabel returns proper human-readable labels", () => {
    assert.equal(getSubmissionStatusLabel("submitted"), "Manuscript Submitted");
    assert.equal(getSubmissionStatusLabel("underReview"), "Under Peer Review");
    assert.equal(getSubmissionStatusLabel("revisionRequested"), "Revision Requested");
    assert.equal(getSubmissionStatusLabel("accepted"), "Accepted for Publication");
    assert.equal(getSubmissionStatusLabel("rejected"), "Declined / Rejected");
    assert.equal(getSubmissionStatusLabel("published"), "Published");
    assert.equal(getSubmissionStatusLabel("retracted"), "Retracted");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
    getRejectionReasonError,
    MIN_REJECTION_REASON_LENGTH,
} from "./application-decision";

test("rejects blank and short decision reasons", () => {
    assert.equal(getRejectionReasonError(" ".repeat(MIN_REJECTION_REASON_LENGTH)), "Rejection reason must be at least 20 characters long.");
    assert.equal(getRejectionReasonError("Needs more detail"), "Rejection reason must be at least 20 characters long.");
});

test("accepts a reason at the minimum length after trimming", () => {
    const reason = `${"A".repeat(MIN_REJECTION_REASON_LENGTH)}   `;
    assert.equal(getRejectionReasonError(reason), null);
});

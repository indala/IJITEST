import assert from "node:assert/strict";
import test from "node:test";
import { filterApplications } from "./filter-applications";

const applications = [
    {
        id: 1,
        fullName: "Asha Rao",
        email: "asha@example.com",
        researchInterests: ["Digital Libraries"],
    },
    {
        id: 2,
        fullName: "David Kim",
        email: "david@example.com",
        researchInterests: ["Secure Systems"],
    },
] as const;

test("returns all applications for an empty search", () => {
    assert.deepEqual(filterApplications(applications, "  "), applications);
});

test("matches names, email addresses, and research interests case-insensitively", () => {
    assert.deepEqual(filterApplications(applications, "ASHA"), [applications[0]]);
    assert.deepEqual(filterApplications(applications, "DAVID@EXAMPLE"), [applications[1]]);
    assert.deepEqual(filterApplications(applications, "secure"), [applications[1]]);
});

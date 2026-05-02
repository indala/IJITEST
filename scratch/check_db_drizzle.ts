import { db } from "../src/lib/db";
import { reviewAssignments, submissions } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function test() {
    const res = await db.select({ id: reviewAssignments.id }).from(reviewAssignments).where(eq(reviewAssignments.submissionId, 11));
    console.log("Assignments for 11:", res.length);
    
    const sub = await db.select().from(submissions).where(eq(submissions.id, 11));
    console.log("Submission 11:", sub.length);
}

test().catch(console.error);

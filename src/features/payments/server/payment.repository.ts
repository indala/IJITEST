import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
    payments,
    submissions,
    submissionVersions,
    userProfiles,
    users,
} from "@/db/schema";
import type { PaymentRow, UnpaidPaperRow } from "@/db/contracts";

const latestVersions = db
    .select({
        submissionId: submissionVersions.submissionId,
        maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as("max_version"),
    })
    .from(submissionVersions)
    .groupBy(submissionVersions.submissionId)
    .as("latest_versions");

export async function listPayments(): Promise<PaymentRow[]> {
    return db
        .select({
            id: payments.id,
            submissionId: payments.submissionId,
            amount: payments.amount,
            currency: payments.currency,
            status: payments.status,
            provider: payments.provider,
            transactionId: payments.transactionId,
            invoiceNumber: payments.invoiceNumber,
            paidAt: payments.paidAt,
            createdAt: payments.createdAt,
            title: submissionVersions.title,
            paperId: submissions.paperId,
            authorName: userProfiles.fullName,
            authorEmail: users.email,
        })
        .from(payments)
        .innerJoin(submissions, eq(payments.submissionId, submissions.id))
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .innerJoin(
            submissionVersions,
            and(
                eq(submissionVersions.submissionId, submissions.id),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion),
            ),
        )
        .orderBy(desc(payments.createdAt))
        .limit(200);
}

export async function listAcceptedUnpaidPapers(): Promise<UnpaidPaperRow[]> {
    return db
        .select({
            id: submissions.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            authorName: userProfiles.fullName,
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .innerJoin(
            submissionVersions,
            and(
                eq(submissionVersions.submissionId, submissions.id),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion),
            ),
        )
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .where(and(eq(submissions.status, "accepted"), isNull(payments.id)));
}

"use server";
import "server-only"

import { db } from "@/lib/db";
import { payments, submissions, submissionVersions, userProfiles, users } from "@/db/schema";
import { eq, desc, and, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { type ActionResponse, type PaymentRow, type UnpaidPaperRow, type PaymentStatus } from "@/db/types";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";



export async function getPayments(): Promise<ActionResponse<PaymentRow[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as('lv');

        const results = await db.select({
            id: payments.id,
            submissionId: payments.submissionId,
            amount: payments.amount,
            currency: payments.currency,
            status: payments.status,
            transactionId: payments.transactionId,
            paidAt: payments.paidAt,
            createdAt: payments.createdAt,
            title: submissionVersions.title,
            paperId: submissions.paperId,
            authorName: userProfiles.fullName,
            authorEmail: users.email
        })
        .from(payments)
        .innerJoin(submissions, eq(payments.submissionId, submissions.id))
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .innerJoin(submissionVersions, and(
            eq(submissionVersions.submissionId, submissions.id),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion)
        ))
        .orderBy(desc(payments.createdAt))
        .limit(200);

        return { success: true, data: results as PaymentRow[] };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Payments Error:", error);
        return { success: false, error: "Failed to fetch payments: " + message };
    }
}

export async function updatePaymentStatus(paymentId: number, status: PaymentStatus, transactionId?: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        await db.transaction(async (tx) => {
            await tx.update(payments)
                .set({ 
                    status, 
                    transactionId: transactionId || null, 
                    paidAt: status === 'paid' || status === 'verified' || status === 'waived' ? new Date() : null
                })
                .where(eq(payments.id, paymentId));

            // Move submission forward when payment is confirmed
            if (status === 'verified' || status === 'waived') {
                const [payment] = await tx.select({ 
                    submissionId: payments.submissionId,
                    currentStatus: submissions.status
                })
                    .from(payments)
                    .innerJoin(submissions, eq(payments.submissionId, submissions.id))
                    .where(eq(payments.id, paymentId))
                    .limit(1);
                
                if (payment && payment.currentStatus !== 'published' && payment.currentStatus !== 'retracted' && payment.currentStatus !== 'rejected') {
                    await tx.update(submissions)
                        .set({ status: 'accepted' })
                        .where(eq(submissions.id, payment.submissionId));
                }
            }
        });

        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Update Payment Error:", error);
        return { success: false, error: "Failed to update payment: " + message };
    }
}

export async function initializePayment(submissionId: number, amount: number, currency: string = 'INR'): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        await db.insert(payments).values({
            submissionId,
            amount: amount.toString(),
            currency,
            status: 'pending'
        });
        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Initialize Payment Error:", error);
        return { success: false, error: "Failed to initialize payment: " + message };
    }
}



export async function getAcceptedUnpaidPapers(): Promise<ActionResponse<UnpaidPaperRow[]>> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || !['admin', 'editor'].includes(session.user.role)) {
            return { success: false, error: "Unauthorized" };
        }

        const latestVersions = db.select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as('max_version')
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as('lv');

        // Find submissions that are 'accepted' but have no entry in 'payments'
        const results = await db.select({
            id: submissions.id,
            paperId: submissions.paperId,
            title: submissionVersions.title,
            authorName: userProfiles.fullName
        })
        .from(submissions)
        .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
        .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
        .innerJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .innerJoin(submissionVersions, and(
            eq(submissionVersions.submissionId, submissions.id),
            eq(submissionVersions.versionNumber, latestVersions.maxVersion)
        ))
        .leftJoin(payments, eq(submissions.id, payments.submissionId))
        .where(and(
            eq(submissions.status, 'accepted'),
            isNull(payments.id)
        ));

        return { success: true, data: results };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Get Accepted Unpaid Error:", error);
        return { success: false, error: "Failed to fetch unpaid papers: " + message };
    }
}

export async function waivePayment(submissionId: number): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'admin') {
            return { success: false, error: "Unauthorized" };
        }

        await db.transaction(async (tx) => {
            await tx.update(payments)
                .set({ status: 'waived', paidAt: new Date() })
                .where(eq(payments.submissionId, submissionId));
            
            // Waived payment — submission is cleared to proceed
            await tx.update(submissions)
                .set({ status: 'accepted' })
                .where(eq(submissions.id, submissionId));
        });

        revalidatePath('/admin/submissions');
        revalidatePath('/admin/submissions/[id]');
        revalidatePath('/admin/payments');
        return { success: true };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("Waive Payment Error:", error);
        return { success: false, error: "Failed to waive payment: " + message };
    }
}

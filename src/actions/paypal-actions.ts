"use server";
import "server-only";

import { db } from "@/lib/db";
import { payments, submissions, journalSettings, userProfiles, users, submissionVersions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createNotification } from "./notifications";
import { sendEmail } from "@/lib/mail";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export interface SubmitPayPalPaymentInput {
    submissionId: number;
    paperId: string;
    paypalTransactionId: string;
    amount?: string;
    currency?: string;
    payerEmail?: string | undefined;
}

export type PayPalPaymentResponse = 
    | { success: true; message: string; invoiceNumber: string }
    | { success: false; error: string };

/**
 * Record a PayPal payment reference submitted by an international author.
 * Official journal PayPal recipient: razh1977@gmail.com
 */
export async function submitPayPalPaymentReference(
    input: SubmitPayPalPaymentInput
): Promise<PayPalPaymentResponse> {
    try {
        const { submissionId, paperId, paypalTransactionId } = input;
        const cleanTxId = (paypalTransactionId || '').trim();

        if (!cleanTxId || cleanTxId.length < 5) {
            return { 
                success: false, 
                error: "Please enter a valid PayPal Transaction ID or Order Reference." 
            };
        }

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return { success: false, error: "Authentication required to submit payment verification." };
        }

        // Verify the requesting user owns this submission (or is staff)
        const [subRecord] = await db.select({ 
            id: submissions.id,
            status: submissions.status,
            correspondingAuthorId: submissions.correspondingAuthorId 
        })
            .from(submissions)
            .where(eq(submissions.id, submissionId))
            .limit(1);

        if (!subRecord) {
            return { success: false, error: "Submission not found." };
        }

        const isAuthorized =
            session.user.role === 'admin' ||
            session.user.role === 'editor' ||
            session.user.id === subRecord.correspondingAuthorId;

        if (!isAuthorized) {
            return { success: false, error: "Unauthorized access for this manuscript." };
        }

        // Fetch journal USD fee setting or use input amount
        const [journalRow] = await db.select({ apcUsd: journalSettings.apcUsd })
            .from(journalSettings)
            .where(eq(journalSettings.id, 1))
            .limit(1);

        let finalAmountStr = input.amount || journalRow?.apcUsd || "50.00";
        let finalCurrencyStr = input.currency || "USD";
        const invoiceNum = `INV-${new Date().getFullYear()}-${submissionId.toString().padStart(5, '0')}`;

        let authorEmail: string | null = null;
        let authorName: string = "Author";
        let paperTitle: string = paperId;

        await db.transaction(async (tx) => {
            // 1. Check if an admin-initialized payment record already exists
            const [existingPayment] = await tx.select({ 
                id: payments.id, 
                status: payments.status,
                amount: payments.amount,
                currency: payments.currency 
            })
                .from(payments)
                .where(eq(payments.submissionId, submissionId))
                .limit(1);

            // Prioritize the exact payment amount requested by the admin/editor
            finalAmountStr = existingPayment?.amount 
                ? existingPayment.amount.toString() 
                : (input.amount || journalRow?.apcUsd || "50.00");
            finalCurrencyStr = existingPayment?.currency || input.currency || "USD";

            if (existingPayment) {
                await tx.update(payments)
                    .set({
                        amount: finalAmountStr,
                        currency: finalCurrencyStr,
                        provider: "paypal",
                        transactionId: cleanTxId,
                        status: "paid",
                        paidAt: new Date(),
                        invoiceNumber: sql`COALESCE(${payments.invoiceNumber}, ${invoiceNum})`
                    })
                    .where(eq(payments.id, existingPayment.id));
            } else {
                await tx.insert(payments).values({
                    submissionId,
                    amount: finalAmountStr,
                    currency: finalCurrencyStr,
                    provider: "paypal",
                    transactionId: cleanTxId,
                    status: "paid",
                    paidAt: new Date(),
                    invoiceNumber: invoiceNum
                });
            }

            // 2. Advance submission status if needed
            if (subRecord.status !== 'published' && subRecord.status !== 'retracted' && subRecord.status !== 'rejected') {
                await tx.update(submissions)
                    .set({
                        status: 'accepted',
                        updatedAt: new Date()
                    })
                    .where(eq(submissions.id, submissionId));
            }

            // 3. Retrieve author details for notification
            if (subRecord.correspondingAuthorId) {
                const [authorUser] = await tx.select({ email: users.email })
                    .from(users)
                    .where(eq(users.id, subRecord.correspondingAuthorId))
                    .limit(1);
                
                const [authorProfile] = await tx.select({ fullName: userProfiles.fullName })
                    .from(userProfiles)
                    .where(eq(userProfiles.userId, subRecord.correspondingAuthorId))
                    .limit(1);

                const [currentVer] = await tx.select({ title: submissionVersions.title })
                    .from(submissionVersions)
                    .where(eq(submissionVersions.submissionId, submissionId))
                    .limit(1);

                if (authorUser?.email) authorEmail = authorUser.email;
                if (authorProfile?.fullName) authorName = authorProfile.fullName;
                if (currentVer?.title) paperTitle = currentVer.title;
            }
        });

        // 4. Send notifications
        if (subRecord.correspondingAuthorId) {
            await createNotification({
                userId: subRecord.correspondingAuthorId,
                type: "payment_verified",
                message: `Your payment of ${finalAmountStr} ${finalCurrencyStr} for ${paperId} (PayPal Ref: ${cleanTxId}) has been registered.`,
                actionLink: `/track?paperId=${paperId}`,
                metadata: { submissionId, paperId }
            });
        }

        // Send confirmation email
        if (authorEmail) {
            try {
                await sendEmail({
                    to: authorEmail,
                    subject: `[IJITEST] Payment Receipt: ${paperId} (PayPal: ${cleanTxId})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                            <h2 style="color: #1e3a8a;">International Journal of Innovative Trends in Engineering, Science and Technology (IJITEST)</h2>
                            <p>Dear ${authorName},</p>
                            <p>We have successfully registered your Article Processing Charge (APC) payment via <strong>PayPal</strong> for your accepted manuscript.</p>
                            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Manuscript ID:</td><td style="padding: 8px;">${paperId}</td></tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Paper Title:</td><td style="padding: 8px;">${paperTitle}</td></tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Amount Paid:</td><td style="padding: 8px;">${finalAmountStr} ${finalCurrencyStr}</td></tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">PayPal Ref:</td><td style="padding: 8px; font-family: monospace;">${cleanTxId}</td></tr>
                                <tr style="border-bottom: 1px solid #e2e8f0;"><td style="padding: 8px; font-weight: bold;">Recipient:</td><td style="padding: 8px;">Dr. Ravi Babu T. (razh1977@gmail.com)</td></tr>
                                <tr><td style="padding: 8px; font-weight: bold;">Invoice Number:</td><td style="padding: 8px; font-family: monospace;">${invoiceNum}</td></tr>
                            </table>
                            <p>Your paper will now proceed to final galley proofing and issue scheduling.</p>
                            <p>Best regards,<br/><strong>Editorial Office</strong><br/>IJITEST | Felix Academic Publications</p>
                        </div>
                    `
                });
            } catch (mailErr) {
                console.error("Failed to send PayPal confirmation email:", mailErr);
            }
        }

        revalidatePath(`/payment/${paperId}`);
        revalidatePath(`/track`);
        revalidatePath(`/admin/payments`);

        return {
            success: true,
            message: "PayPal payment reference recorded and verified successfully.",
            invoiceNumber: invoiceNum
        };
    } catch (error) {
        console.error("Error in submitPayPalPaymentReference:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to record PayPal payment reference."
        };
    }
}

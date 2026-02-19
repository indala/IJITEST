"use server";

import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";
import pool from "@/lib/db";
import { revalidatePath } from "next/cache";

export type CreateOrderResponse =
    | { success: true; order: { id: string; amount: number; currency: string; key: string | undefined } }
    | { success: false; error: string };

export async function createRazorpayOrder(submissionId: number, paperId: string): Promise<CreateOrderResponse> {
    try {
        // 1. Fetch APC amount from settings (or use default from existing logic)
        const [settings]: any = await pool.execute('SELECT setting_value FROM settings WHERE setting_key = "apc_inr"');
        const amountInINR = settings[0]?.setting_value || '2500';
        const amount = parseInt(amountInINR) * 100; // Razorpay expects amount in paise

        // 2. Create Razorpay order
        const options = {
            amount: amount,
            currency: "INR",
            receipt: `receipt_${paperId}_${Date.now()}`,
            notes: {
                submission_id: submissionId,
                paper_id: paperId
            }
        };

        const order = await razorpay.orders.create(options);

        // 3. Create/Update payment record in DB with the Razorpay order ID
        // First check if a payment record exists for this submission
        const [existing]: any = await pool.execute('SELECT id FROM payments WHERE submission_id = ?', [submissionId]);

        if (existing.length > 0) {
            await pool.execute(
                'UPDATE payments SET transaction_id = ?, currency = ?, amount = ? WHERE submission_id = ?',
                [order.id, "INR", amountInINR, submissionId]
            );
        } else {
            await pool.execute(
                'INSERT INTO payments (submission_id, amount, currency, status, transaction_id) VALUES (?, ?, ?, ?, ?)',
                [submissionId, amountInINR, "INR", "unpaid", order.id]
            );
        }

        return {
            success: true,
            order: {
                id: order.id,
                amount: order.amount as number,
                currency: order.currency,
                key: process.env.RAZORPAY_KEY_ID
            }
        };
    } catch (error: any) {
        console.error("Create Razorpay Order Error:", error);
        return { success: false, error: "Failed to create payment order: " + error.message };
    }
}

export async function verifyRazorpayPayment(data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    submissionId: number;
}) {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, submissionId } = data;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET || '';
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return { error: "Invalid payment signature" };
        }

        // 2. Update Payment Status in DB
        await pool.execute(
            "UPDATE payments SET status = 'paid', transaction_id = ?, paid_at = CURRENT_TIMESTAMP WHERE submission_id = ?",
            [razorpay_payment_id, submissionId]
        );

        // 3. Update Submission Status
        await pool.execute("UPDATE submissions SET status = 'published' WHERE id = ?", [submissionId]);

        revalidatePath('/track');
        revalidatePath('/admin/payments');

        return { success: true };
    } catch (error: any) {
        console.error("Verify Razorpay Payment Error:", error);
        return { error: "Failed to verify payment: " + error.message };
    }
}

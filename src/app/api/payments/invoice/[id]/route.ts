import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments, submissions, userProfiles, users, submissionVersions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateInvoicePdf } from "@/lib/invoice-generator";

export async function GET(
    _req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await context.params;
        const paymentId = parseInt(idStr, 10);
        if (isNaN(paymentId)) {
            return new NextResponse("Invalid payment reference", { status: 400 });
        }

        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Authentication required", { status: 401 });
        }

        const rows = await db.select({
            payment: payments,
            submission: submissions,
            authorProfile: userProfiles,
            authorUser: users,
        })
            .from(payments)
            .innerJoin(submissions, eq(payments.submissionId, submissions.id))
            .innerJoin(users, eq(submissions.correspondingAuthorId, users.id))
            .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
            .where(eq(payments.id, paymentId))
            .limit(1);

        const row = rows[0];
        if (!row?.payment) {
            return new NextResponse("Invoice record not found", { status: 404 });
        }

        const isAuthorized =
            session.user.role === "admin" ||
            session.user.role === "editor" ||
            session.user.id === row.submission.correspondingAuthorId;

        if (!isAuthorized) {
            return new NextResponse("Unauthorized access to this invoice", { status: 403 });
        }

        const versionRows = await db
            .select({ title: submissionVersions.title })
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, row.submission.id))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const paperTitle = versionRows[0]?.title || "Research Manuscript";
        const invoiceNumber =
            row.payment.invoiceNumber ||
            `INV-${new Date(row.payment.paidAt || row.payment.createdAt || new Date()).getFullYear()}-${String(row.payment.id).padStart(4, "0")}`;

        const pdfBytes = await generateInvoicePdf({
            invoiceNumber,
            date: row.payment.paidAt || row.payment.createdAt || new Date(),
            paperId: row.submission.paperId,
            paperTitle,
            authorName: row.authorProfile?.fullName || row.authorUser.email,
            authorEmail: row.authorUser.email,
            authorInstitution: row.authorProfile?.institute || undefined,
            amount: row.payment.amount,
            currency: row.payment.currency || "INR",
            transactionId: row.payment.transactionId,
            paymentMethod: row.payment.provider
                ? `${row.payment.provider} Gateway`
                : "Razorpay Secure Gateway",
        });

        const safeFilename = `Invoice_${invoiceNumber}_${row.submission.paperId}.pdf`.replace(/[^a-zA-Z0-9_.-]/g, "_");

        return new NextResponse(Buffer.from(pdfBytes), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${safeFilename}"`,
                "Cache-Control": "private, no-cache, no-store, must-revalidate",
            },
        });
    } catch (error) {
        console.error("Download invoice error:", error);
        return new NextResponse("Failed to generate invoice PDF", { status: 500 });
    }
}

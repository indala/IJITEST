import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { payments, submissions, users, userProfiles, submissionVersions } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import { generateInvoicePdf } from "@/lib/invoice-generator";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ paymentId: string }> }
) {
    try {
        const { paymentId } = await params;
        const numericId = parseInt(paymentId, 10);

        // Fetch payment record
        const paymentWhere = !isNaN(numericId)
            ? or(eq(payments.id, numericId), eq(payments.submissionId, numericId))
            : eq(submissions.paperId, paymentId);

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
        .where(paymentWhere)
        .limit(1);

        const row = rows[0];
        if (!row || !row.payment) {
            return new NextResponse("Invoice not found", { status: 404 });
        }

        // Authorization check: User must be signed in (author or admin/editor)
        const session = await getServerSession(authOptions);
        if (session?.user) {
            const isAuthorized =
                session.user.role === 'admin' ||
                session.user.role === 'editor' ||
                session.user.id === row.submission.correspondingAuthorId;

            if (!isAuthorized) {
                return new NextResponse("Unauthorized to access this receipt", { status: 403 });
            }
        }

        // Fetch latest version for paper title
        const versionRows = await db.select({ title: submissionVersions.title })
            .from(submissionVersions)
            .where(eq(submissionVersions.submissionId, row.submission.id))
            .orderBy(desc(submissionVersions.versionNumber))
            .limit(1);

        const paperTitle = versionRows[0]?.title || "Research Manuscript";
        const invoiceNumber = row.payment.invoiceNumber || `INV-${new Date(row.payment.paidAt || row.payment.createdAt || new Date()).getFullYear()}-${String(row.payment.id).padStart(4, '0')}`;

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
            paymentMethod: row.payment.provider ? `${row.payment.provider} Gateway` : "Razorpay Secure Gateway",
        });

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="APC_Receipt_${row.submission.paperId}.pdf"`,
                "Cache-Control": "public, max-age=3600, s-maxage=3600",
            },
        });
    } catch (error) {
        console.error("Generate Invoice Route Error:", error);
        return new NextResponse("Failed to generate payment invoice", { status: 500 });
    }
}

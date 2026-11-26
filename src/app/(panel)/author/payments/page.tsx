import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { payments, submissions, submissionVersions } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, Download, ExternalLink, CheckCircle, Clock, ShieldCheck } from "lucide-react";

export const metadata = {
    title: "My Payments",
};

const PAYMENT_BADGE: Record<string, string> = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    paid: "bg-blue-50 text-blue-700 border-blue-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    waived: "bg-purple-50 text-purple-700 border-purple-200",
};

export default async function AuthorPaymentsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) redirect("/login");
    if (session.user.role !== "author") redirect(`/${session.user.role}`);

    const latestVersions = db
        .select({
            submissionId: submissionVersions.submissionId,
            maxVersion: sql<number>`MAX(${submissionVersions.versionNumber})`.as("max_version"),
        })
        .from(submissionVersions)
        .groupBy(submissionVersions.submissionId)
        .as("lv");

    const rows = await db
        .select({
            paymentId: payments.id,
            amount: payments.amount,
            currency: payments.currency,
            status: payments.status,
            invoiceNumber: payments.invoiceNumber,
            transactionId: payments.transactionId,
            paidAt: payments.paidAt,
            createdAt: payments.createdAt,
            submissionId: submissions.id,
            paperId: submissions.paperId,
            submissionStatus: submissions.status,
            title: submissionVersions.title,
        })
        .from(payments)
        .innerJoin(submissions, eq(payments.submissionId, submissions.id))
        .leftJoin(latestVersions, eq(submissions.id, latestVersions.submissionId))
        .leftJoin(
            submissionVersions,
            and(
                eq(submissions.id, submissionVersions.submissionId),
                eq(submissionVersions.versionNumber, latestVersions.maxVersion)
            )
        )
        .where(eq(submissions.correspondingAuthorId, session.user.id))
        .orderBy(desc(payments.createdAt));

    return (
        <section className="space-y-3">
            <header className="panel-header">
                <div className="space-y-0.5">
                    <h1 className="panel-title m-0">My Payments</h1>
                    <p className="panel-subtitle m-0">
                        Article Processing Charges (APC) and downloadable invoices for your manuscripts
                    </p>
                </div>
            </header>

            {rows.length === 0 ? (
                <Card className="border-dashed border border-border/70 bg-muted/10 text-center rounded-xl">
                    <CardContent className="py-10 flex flex-col items-center gap-2.5 text-muted-foreground">
                        <CreditCard className="w-8 h-8 opacity-25" />
                        <p className="font-semibold text-body-sm text-foreground m-0">No payment records yet</p>
                        <p className="text-caption max-w-sm m-0">
                            APC invoices appear here once your manuscript is accepted for publication.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                    {rows.map((item) => {
                        const isSettled = ["paid", "verified", "waived"].includes(item.status);
                        return (
                            <Card key={item.paymentId} className="border-border/70 bg-card rounded-xl shadow-2xs">
                                <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="min-w-0 space-y-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                            <Badge variant="outline" className="text-badge font-mono">
                                                {item.paperId}
                                            </Badge>
                                            <Badge className={`text-badge font-semibold capitalize border ${PAYMENT_BADGE[item.status] || "bg-muted text-muted-foreground"}`}>
                                                {item.status}
                                            </Badge>
                                            {item.invoiceNumber && (
                                                <span className="text-meta font-mono text-muted-foreground">
                                                    #{item.invoiceNumber}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1 m-0">
                                            {item.title || "Untitled Manuscript"}
                                        </h3>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-muted-foreground">
                                            <span className="font-bold text-foreground">
                                                {item.currency} {item.amount}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                {isSettled ? (
                                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                                ) : (
                                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                )}
                                                {item.paidAt
                                                    ? `Paid ${new Date(item.paidAt).toLocaleDateString()}`
                                                    : `Initialized ${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}`}
                                            </span>
                                            {item.transactionId && (
                                                <span className="flex items-center gap-1 font-mono text-meta">
                                                    <ShieldCheck className="w-3.5 h-3.5 text-primary/70" />
                                                    {item.transactionId}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                                        {!isSettled && (
                                            <Button asChild size="sm" className="btn-primary h-8 px-3 rounded-lg">
                                                <Link href={`/payment/${item.paperId}`} className="flex items-center gap-1.5">
                                                    <CreditCard className="w-3.5 h-3.5" /> Pay Now
                                                </Link>
                                            </Button>
                                        )}
                                        {isSettled && (
                                            <Button asChild variant="outline" size="sm" className="h-8 px-3 rounded-lg">
                                                <a href={`/api/payments/invoice/${item.paymentId}`} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5">
                                                    <Download className="w-3.5 h-3.5" /> Invoice PDF
                                                </a>
                                            </Button>
                                        )}
                                        <Button asChild variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg">
                                            <Link href={`/author/submissions/${item.submissionId}`} className="flex items-center gap-1">
                                                Details <ExternalLink className="w-3.5 h-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

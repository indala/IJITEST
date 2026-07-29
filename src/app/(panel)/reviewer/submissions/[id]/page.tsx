import { getSubmissionById } from "@/actions/submissions";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
    History,
    FileText,
    Download,
    ArrowLeft,
    Clock,
    Shield,
    Lock,
    Tag,
    ChevronLeft
} from "lucide-react";
import { PdfViewer } from "@/components/reviewer/PdfViewer";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AdminPdfUpload from "@/features/submissions/components/AdminPdfUpload";
import { getSecureUrl } from "@/lib/utils";
import { type SubmissionIdParam } from "@/db/types";

export async function generateMetadata({ params }: { params: Promise<SubmissionIdParam> }): Promise<Metadata> {
    const { id } = await params;
    const response = await getSubmissionById(parseInt(id));
    if (!response.success || !response.data) return { title: 'Manuscript Not Found | Reviewer' };

    const submission = response.data;

    return {
        title: `Review: ${submission.paperId} | IJITEST`,
        description: `Reviewer evaluation for manuscript ${submission.paperId}`,
    };
}

export default async function ReviewerSubmissionView({ params }: { params: Promise<SubmissionIdParam> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const session = await getServerSession(authOptions);
    const user = session?.user;

    if (!user || user.role !== 'reviewer' && user.role !== 'admin' && user.role !== 'editor') {
        redirect('/login');
    }

    if (isNaN(id)) return notFound();

    const response = await getSubmissionById(id);
    if (!response.success || !response.data) return notFound();

    const submission = response.data;

    // Verify assignment for reviewers
    if (user.role === 'reviewer') {
        const isAssigned = submission.allReviews?.some((r) => r.reviewerId === user.id);
        if (!isAssigned) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                    <div className="w-24 h-24 rounded-xl bg-rose-500/10 flex items-center justify-center mb-8 shadow-inner shadow-rose-500/5">
                        <Lock className="w-12 h-12 text-rose-600" />
                    </div>
                    <h2 className="mb-3">Access Restricted</h2>
                    <p className="opacity-60 max-w-sm mb-10">
                        This manuscript has not been assigned to your profile for technical evaluation.
                    </p>
                    <Button asChild variant="outline" className="h-12 px-8 gap-3 font-bold text-[11px] tracking-widest rounded-xl transition-all uppercase shadow-sm cursor-pointer">
                        <Link className="cursor-pointer" href="/reviewer/reviews">
                            <ArrowLeft className="w-4 h-4" /> Back to My Assignments
                        </Link>
                    </Button>
                </div>
            );
        }
    }

    return (
        <section className="space-y-6 pb-20">
            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="ghost" size="sm" className="h-9 px-3 gap-2 text-muted-foreground font-bold text-[10px] uppercase tracking-widest -ml-2 rounded-lg transition-all cursor-pointer">
                    <Link className="cursor-pointer" href="/reviewer/reviews">
                        <ChevronLeft className="w-4 h-4" /> Back to My Assignments
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Metadata (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-primary/5 shadow-vip overflow-hidden sticky top-24 rounded-xl pb-10 2xl:rounded-3xl bg-white">
                        <CardHeader className="p-6 bg-primary/5 border-b border-primary/10">
                            <div className="space-y-3">
                                <Badge className="h-6 px-2.5 text-xs font-bold tracking-wide bg-emerald-600 text-white border-none shadow-xs rounded-md uppercase w-fit">
                                    Assigned for Review
                                </Badge>
                                <CardTitle className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-snug">
                                    {submission.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
                                    <div className="flex items-center gap-1.5 font-semibold text-primary">
                                        <Shield className="w-4 h-4" />
                                        <span>{submission.paperId}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        <span>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Unknown Date'}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 2xl:p-14 space-y-8 2xl:space-y-12">
                            <div className="space-y-4 2xl:space-y-8">
                                <h4 className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 2xl:w-9 2xl:h-9" /> Abstract
                                </h4>
                                <p className="opacity-70 italic">
                                    &quot;{submission.abstract || "No abstract provided."}&quot;
                                </p>
                            </div>

                            <Separator className="bg-primary/5" />

                            {submission.keywords && (
                                <div className="space-y-4">
                                    <h4 className="flex items-center gap-3">
                                        <Tag className="w-5 h-5" /> Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {submission.keywords.split(',').map((k: string) => (
                                            <Badge key={k} variant="outline" className="h-auto py-1 px-3 text-xs font-semibold border-primary/10 bg-primary/5 text-primary rounded-lg">
                                                {k.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {user.role !== 'reviewer' && submission.coAuthors && submission.coAuthors.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-primary/5">
                                    <h4 className="flex items-center gap-3">
                                        <History className="w-5 h-5" /> Collaborating Authors
                                    </h4>
                                    <div className="space-y-3">
                                        {submission.coAuthors.map((author, idx: number) => (
                                            <div key={idx} className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-1 shadow-sm">
                                                <p className="leading-none">{author.name}</p>
                                                <p className="opacity-60 truncate">{author.institution}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-4 2xl:pt-8">
                                {submission.pdfUrl ? (
                                    <>
                                        <Button asChild className="w-full h-11 gap-2.5 font-bold text-xs uppercase tracking-wider shadow-md rounded-lg bg-primary hover:bg-primary/90 transition-all cursor-pointer text-white">
                                            <a href={getSecureUrl(submission.pdfUrl)} download>
                                                <Download className="w-4 h-4" /> Download PDF
                                            </a>
                                        </Button>
                                        <p className="text-xs text-muted-foreground text-center mt-2.5 font-medium">
                                            Official Review Version (Protected)
                                        </p>
                                    </>
                                ) : (
                                    <AdminPdfUpload
                                        submissionId={submission.id}
                                        currentUrl={getSecureUrl(submission.pdfUrl)}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="lg:col-span-8">
                    <Card className="border-border/50 shadow-sm overflow-hidden h-[calc(100vh-140px)] min-h-[600px] sticky top-24 bg-muted/10">
                        <CardContent className="p-0 h-full flex flex-col">
                            {submission.pdfUrl ? (
                                <div className="flex-1 h-full relative group">
                                    <PdfViewer
                                        pdfUrl={getSecureUrl(submission.pdfUrl)}
                                        title={submission.title}
                                    />
                                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                                    <div className="w-20 h-20 rounded-2xl bg-primary/5 flex items-center justify-center shadow-inner">
                                        <Shield className="w-10 h-10 text-primary/30" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3>Secure Preview Pending</h3>
                                        <p className="opacity-60 max-w-xs mx-auto">
                                            The editorial board has not yet synchronized the secure PDF version for this manuscript.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-lg border border-border">
                                        <History className="w-3.5 h-3.5 text-muted-foreground animate-spin-slow" />
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Synchronization in Progress</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </section>
    );
}

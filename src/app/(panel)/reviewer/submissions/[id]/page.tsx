import { getSubmissionById } from "@/actions/submissions";
import { getSession } from "@/actions/session";
import pool from "@/lib/db";
import {
    Calendar,
    User,
    Mail,
    FileText,
    Download,
    ArrowLeft,
    Clock,
    Shield,
    BookOpen,
    Eye,
    Lock,
    Tag,
    ChevronLeft
} from "lucide-react";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmissionById(parseInt(id));
    if (!submission) return { title: 'Manuscript Not Found | Reviewer' };

    return {
        title: `Review: ${submission.paper_id} | IJITEST`,
        description: `Reviewer evaluation for manuscript ${submission.paper_id}`,
    };
}

export default async function ReviewerSubmissionView({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);
    const session = await getSession();

    if (!session || session.role !== 'reviewer' && session.role !== 'admin' && session.role !== 'editor') {
        redirect('/login');
    }

    if (isNaN(id)) return notFound();

    const submission = await getSubmissionById(id);
    if (!submission) return notFound();

    // Verify assignment for reviewers
    if (session.role === 'reviewer') {
        const [assignment]: any = await pool.execute(
            'SELECT id FROM reviews WHERE submission_id = ? AND reviewer_id = ?',
            [id, session.id]
        );
        if (assignment.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-xl font-black text-foreground tracking-tight mb-2">Access Restricted</h2>
                    <p className="text-xs font-medium text-muted-foreground max-w-sm mb-8">
                        This manuscript has not been assigned to your profile for technical evaluation. Please contact the editorial board if you believe this is an error.
                    </p>
                    <Button asChild variant="outline" className="h-11 px-6 font-black text-[11px] uppercase tracking-widest rounded-xl">
                        <Link href="/reviewer/reviews">
                            Back to My Assignments
                        </Link>
                    </Button>
                </div>
            );
        }
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Breadcrumb / Top Bar */}
            <div className="flex items-center justify-between gap-4">
                <Button asChild variant="ghost" size="sm" className="h-9 gap-2 text-muted-foreground hover:text-primary font-black text-[10px] uppercase tracking-widest -ml-2">
                    <Link href="/reviewer/reviews">
                        <ChevronLeft className="w-4 h-4" /> Back to My Assignments
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Column: Metadata (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-border/50 shadow-sm overflow-hidden sticky top-6">
                        <CardHeader className="p-6 bg-muted/20 border-b border-border/50">
                            <div className="space-y-3">
                                <Badge variant="secondary" className="h-5 px-1.5 text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary border-none">
                                    Assigned for Review
                                </Badge>
                                <CardTitle className="text-lg font-black text-foreground tracking-tight leading-tight">
                                    {submission.title}
                                </CardTitle>
                                <div className="flex flex-wrap items-center gap-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5 text-primary">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>{submission.paper_id}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5 opacity-50" />
                                        <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3.5 h-3.5" /> Abstract
                                </h4>
                                <p className="text-xs text-muted-foreground leading-relaxed font-medium italic text-justify">
                                    "{submission.abstract || "No abstract provided."}"
                                </p>
                            </div>

                            <Separator className="bg-border/50" />

                            {submission.keywords && (
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Tag className="w-3.5 h-3.5" /> Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {submission.keywords.split(',').map((k: string) => (
                                            <Badge key={k} variant="outline" className="h-5 px-1.5 text-[8px] font-black uppercase tracking-widest border-border text-muted-foreground">
                                                {k.trim()}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-2">
                                <Button asChild className="w-full h-11 gap-2 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-primary/20">
                                    <a href={submission.file_path} download>
                                        <Download className="w-4 h-4" /> Download Manuscript
                                    </a>
                                </Button>
                                <p className="text-[9px] font-bold text-muted-foreground text-center mt-3 uppercase tracking-widest italic opacity-60">
                                    Recommended for offline in-depth annotation
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Viewer (8 Cols) */}
                <div className="lg:col-span-8">
                    <Card className="border-border/50 shadow-sm overflow-hidden h-full min-h-[85vh]">
                        <CardContent className="p-0 h-full flex flex-col">
                            {submission.file_path ? (
                                <div className="flex-1 min-h-[85vh] relative group">
                                    <iframe
                                        src={`${submission.file_path}#toolbar=0&navpanes=0`}
                                        className="w-full h-full border-none bg-background pointer-events-auto"
                                        title="Manuscript Viewer"
                                    />
                                    {/* Glass Overlay for interactive feel */}
                                    <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-black/5 rounded-none" />
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Preview Unavailable</h3>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic">Manuscript file could not be rendered for online viewing</p>
                                    </div>
                                    <Button asChild variant="outline" size="sm" className="h-9 gap-2 font-black text-[10px] uppercase tracking-widest">
                                        <a href={submission.file_path} download>
                                            <Download className="w-3.5 h-3.5" /> Use Manual Download
                                        </a>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

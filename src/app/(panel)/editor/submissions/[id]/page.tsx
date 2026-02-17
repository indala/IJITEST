import { getSubmissionById, updateSubmissionStatus, decideSubmission } from "@/actions/submissions";
import { getVolumesIssues, assignPaperToIssue } from "@/actions/publications";
import { waivePayment } from "@/actions/payments";
import pool from "@/lib/db";
import DeleteSubmissionButton from "@/features/submissions/components/DeleteSubmissionButton";
import {
    Calendar,
    User,
    Mail,
    FileText,
    Download,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Shield,
    BookOpen,
    FileCheck,
    AlertCircle,
    ChevronRight,
    Globe,
    Edit3,
    Eye,
    History,
    MoreVertical,
    Share2,
    Lock,
    ExternalLink,
    ChevronDown
} from "lucide-react";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import type { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params;
    const submission = await getSubmissionById(parseInt(id));
    if (!submission) return { title: 'Submission Not Found | Editor' };

    return {
        title: `Editorial: ${submission.paper_id} | IJITEST`,
        description: `Editorial management for manuscript ${submission.paper_id}: ${submission.title}`,
    };
}

export default async function SubmissionDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="p-20 text-center bg-background rounded-2xl border border-border shadow-sm">
                <h2 className="text-xl font-black text-foreground mb-4 tracking-tight">Invalid Reference</h2>
                <p className="text-xs font-medium text-muted-foreground mb-8">The submission ID provided is not a valid technical node.</p>
                <Button asChild className="h-10 px-6 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20">
                    <Link href="/editor/submissions">
                        Return to Submissions
                    </Link>
                </Button>
            </div>
        );
    }

    const submission = await getSubmissionById(id);

    if (!submission) {
        return (
            <div className="p-20 text-center bg-background rounded-2xl border border-border shadow-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h2 className="text-xl font-black text-foreground mb-2 tracking-tight">Node Not Found</h2>
                <p className="text-xs font-medium text-muted-foreground mb-8 max-w-sm mx-auto uppercase tracking-widest leading-loose">The manuscript with ID #{id} could not be located in the current sector.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-black text-[10px] uppercase tracking-widest border-border/50">
                    <Link href="/editor/submissions">
                        Back to Submissions List
                    </Link>
                </Button>
            </div>
        );
    }

    // Helper for status colors
    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-indigo-500/10 text-indigo-600 border-none';
            case 'under_review': return 'bg-amber-500/10 text-amber-600 border-none';
            case 'accepted': return 'bg-purple-500/10 text-purple-600 border-none';
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'published': return 'bg-cyan-500/10 text-cyan-600 border-none';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <Button asChild variant="ghost" className="h-9 px-0 hover:bg-transparent text-muted-foreground hover:text-primary gap-2 font-black text-[10px] uppercase tracking-widest">
                    <Link href="/editor/submissions">
                        <ArrowLeft className="w-4 h-4" /> Editorial Queue
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 px-2 text-[9px] font-black uppercase tracking-widest bg-muted/50 border-none text-muted-foreground animate-pulse">Live Monitoring</Badge>
                </div>
            </div>

            <Card className="border-border/50 shadow-sm overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                        <div className="space-y-4 flex-1">
                            <div className="flex items-center gap-2">
                                <Badge className={`h-5 px-2 text-[8px] font-black uppercase tracking-widest ${getStatusStyle(submission.status)}`}>
                                    {submission.status.replace('_', ' ')}
                                </Badge>
                                <span className="text-[10px] font-mono font-black text-muted-foreground/60 tracking-tighter">NODE: {submission.paper_id}</span>
                            </div>
                            <h1 className="text-2xl font-black text-foreground leading-tight tracking-tight">
                                {submission.title}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 opacity-50" />
                                    <span>Ingested: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 opacity-50" />
                                    <span>Ref: {submission.paper_id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="shrink-0">
                            {submission.file_path && (
                                <Button asChild className="h-11 px-6 gap-2 bg-primary text-white font-black text-[11px] uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20">
                                    <a href={submission.file_path} download>
                                        <Download className="w-4.5 h-4.5" /> Download Source
                                    </a>
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
                        <div className="lg:col-span-2 p-8 space-y-8">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-3 bg-secondary rounded-full" />
                                    Abstract Intelligence
                                </h3>
                                <div className="bg-muted/30 p-6 rounded-2xl border border-border/20">
                                    <p className="text-xs font-medium text-foreground leading-relaxed text-justify selection:bg-primary/10">
                                        {submission.abstract || "No abstract intelligence provided for this node."}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                    <div className="w-1 h-3 bg-orange-500 rounded-full" />
                                    Technical Feedback Nodes
                                </h3>

                                <div className="space-y-4">
                                    {(async () => {
                                        const [reviews]: any = await pool.execute(
                                            'SELECT r.*, u.full_name as reviewer_name FROM reviews r JOIN users u ON r.reviewer_id = u.id WHERE r.submission_id = ? AND r.status = "completed"',
                                            [submission.id]
                                        );

                                        if (reviews.length === 0) return (
                                            <div className="p-8 border border-dashed border-border/50 rounded-2xl flex flex-col items-center justify-center text-center">
                                                <AlertCircle className="w-6 h-6 text-muted-foreground/20 mb-2" />
                                                <p className="text-[10px] font-black text-muted-foreground uppercase italic letter-spacing-widest">No evaluation feedback detected</p>
                                            </div>
                                        );

                                        return reviews.map((r: any, i: number) => (
                                            <Card key={r.id} className="border-border/50 shadow-none bg-muted/5 group">
                                                <CardContent className="p-5 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="h-5 px-1.5 text-[8px] font-black uppercase tracking-widest bg-orange-500/10 text-orange-600 border-none">Reviewer {i + 1}</Badge>
                                                            <span className="text-[9px] font-bold text-muted-foreground/50">{r.reviewer_name}</span>
                                                        </div>
                                                        <Badge variant="outline" className="h-4 px-1 text-[7px] font-black uppercase opacity-30 border-none">{new Date(r.updated_at).toLocaleDateString()}</Badge>
                                                    </div>
                                                    <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed whitespace-pre-wrap">"{r.feedback}"</p>
                                                </CardContent>
                                            </Card>
                                        ));
                                    })()}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-muted/5 space-y-8 flex flex-col">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 opacity-50" /> Originator Detail
                                </h3>
                                <div className="space-y-3">
                                    <div className="bg-background p-4 rounded-xl border border-border/50 space-y-3 shadow-sm">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Primary Author</p>
                                            <p className="text-xs font-black text-foreground">{submission.author_name}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">Secure Email</p>
                                            <p className="text-xs font-bold text-primary break-all lowercase">{submission.author_email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 flex-1">
                                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest px-1 flex items-center gap-2">
                                    <Lock className="w-3.5 h-3.5 opacity-50" /> Administrative Decision
                                </h3>
                                <div className="space-y-3">
                                    {submission.status === 'submitted' && (
                                        <div className="space-y-3 group p-4 rounded-2xl bg-orange-500/5 border border-orange-500/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-orange-600/60 text-center">Stage: Ingested</p>
                                            <Button asChild className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20">
                                                <Link href={`/editor/reviews?assign=${submission.id}`}>
                                                    Delegate Evaluation
                                                </Link>
                                            </Button>
                                        </div>
                                    )}

                                    {submission.status === 'under_review' && (
                                        <div className="space-y-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-primary/60 text-center">Stage: Technical Audit</p>
                                            <form action={async () => { 'use server'; await decideSubmission(submission.id, 'accepted'); }}>
                                                <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-600/10">
                                                    <CheckCircle className="w-4 h-4 mr-2" /> Authorize Accept
                                                </Button>
                                            </form>
                                            <form action={async () => { 'use server'; await decideSubmission(submission.id, 'rejected'); }}>
                                                <Button variant="outline" className="w-full h-10 border-red-500/20 text-red-600 hover:bg-red-500/5 font-black text-[10px] uppercase tracking-widest">
                                                    <XCircle className="w-4 h-4 mr-2" /> Finalize Reject
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {submission.status === 'accepted' && (
                                        <div className="space-y-3 p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                                            <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Status: Verified Accepted</p>
                                            <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-tighter italic">Awaiting Author Transaction Pool</p>
                                            <Separator className="bg-emerald-500/10 my-4" />
                                            <form action={async () => { 'use server'; await waivePayment(submission.id); }}>
                                                <Button variant="ghost" className="w-full h-8 text-[8px] font-black uppercase tracking-widest text-emerald-600 hover:bg-emerald-500/5">
                                                    Authorise Waiver Control
                                                </Button>
                                            </form>
                                        </div>
                                    )}

                                    {submission.status === 'paid' && (
                                        <div className="space-y-4 p-6 rounded-3xl bg-emerald-900 text-white shadow-xl shadow-emerald-900/10 relative overflow-hidden">
                                            <div className="relative z-10 space-y-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                                                        <FileCheck className="w-5 h-5 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest leading-tight">Sector Cleared</p>
                                                        <h3 className="text-sm font-black tracking-tight">Ready for Archival</h3>
                                                    </div>
                                                </div>

                                                <form action={async (formData) => {
                                                    'use server';
                                                    const issueId = parseInt(formData.get('issueId') as string);
                                                    if (issueId) await assignPaperToIssue(submission.id, issueId);
                                                }} className="space-y-6">
                                                    <div className="space-y-2">
                                                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400 px-1 italic">Target Archive Volume</Label>
                                                        <div className="relative group/select">
                                                            <select
                                                                name="issueId"
                                                                required
                                                                defaultValue={submission.issue_id || ""}
                                                                className="w-full h-14 bg-white/5 border border-white/10 hover:border-emerald-500/30 rounded-2xl px-5 text-[11px] font-black uppercase tracking-[0.15em] appearance-none outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all text-white cursor-pointer italic"
                                                            >
                                                                <option value="" className="bg-emerald-950">Select Archival Issue...</option>
                                                                {(await getVolumesIssues()).map((vi: any) => (
                                                                    <option key={vi.id} value={vi.id} className="bg-emerald-950">
                                                                        V{vi.volume_number} I{vi.issue_number} ({vi.year}) — {vi.month_range}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500/40 pointer-events-none group-hover/select:text-emerald-500 transition-colors" />
                                                        </div>
                                                    </div>
                                                    <Button className="w-full h-16 bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-black/20 italic rounded-2xl">
                                                        Commit to Global Archive
                                                    </Button>
                                                </form>
                                            </div>
                                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
                                        </div>
                                    )}

                                    {submission.status === 'published' && (
                                        <div className="space-y-4 p-6 rounded-3xl bg-foreground text-background shadow-xl relative overflow-hidden group">
                                            <div className="relative z-10 space-y-5">
                                                <div className="flex items-center gap-3">
                                                    <Globe className="w-6 h-6 text-primary group-hover:rotate-12 transition-transform" />
                                                    <div>
                                                        <p className="text-[9px] font-black text-primary uppercase tracking-widest">Public Domain</p>
                                                        <h3 className="text-base font-black tracking-tight italic">Journal Published</h3>
                                                    </div>
                                                </div>
                                                <div className="pt-4 border-t border-background/10">
                                                    <div className="flex justify-between items-end">
                                                        <div>
                                                            <p className="text-[8px] font-black uppercase text-background/40 tracking-widest mb-1">Archival Node</p>
                                                            <p className="text-[11px] font-black">
                                                                {submission.volume_number && `VOL ${submission.volume_number} ISSUE ${submission.issue_number}`}
                                                            </p>
                                                        </div>
                                                        <Button asChild size="sm" variant="outline" className="h-8 rounded-lg border-background/10 hover:bg-background/5 font-black text-[9px] uppercase tracking-widest px-3">
                                                            <Link href="/archives">Inspect Live</Link>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator className="bg-border/50" />

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">Infrastructure Control</h3>
                                {submission.status !== 'paid' && submission.status !== 'published' ? (
                                    <DeleteSubmissionButton submissionId={submission.id} status={submission.status} variant="full" />
                                ) : (
                                    <div className="p-4 bg-muted/50 rounded-xl border border-dashed border-border/50 text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest text-center italic">
                                        Protected Node (Transaction Detected)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

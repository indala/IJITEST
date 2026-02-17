import {
    Search,
    Filter,
    MoreVertical,
    Download,
    Eye,
    Paperclip,
    CheckCircle2,
    Clock,
    AlertTriangle,
    MessageSquare,
    FileText,
    Plus,
    ChevronDown,
    Calendar,
    User
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import pool from '@/lib/db';
import Link from 'next/link';
import DeleteSubmissionButton from "@/features/submissions/components/DeleteSubmissionButton";
import SubmissionTabs from '@/features/submissions/components/SubmissionTabs';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const dynamic = 'force-dynamic';

export default async function Submissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams;
    const currentStatus = status || 'all';

    // Fetch submissions from MySQL with optional status filtering
    let query = `
        SELECT s.*, 
        (SELECT COUNT(*) FROM reviews r WHERE r.submission_id = s.id AND r.status = 'completed') as completed_reviews 
        FROM submissions s
    `;
    let params: any[] = [];

    if (currentStatus === 'pending') {
        query += ' WHERE s.status IN ("under_review", "accepted")';
    } else if (currentStatus !== 'all') {
        query += ' WHERE s.status = ?';
        params.push(currentStatus);
    }

    query += ' ORDER BY s.submitted_at DESC';

    const [rows]: any = await pool.execute(query, params);
    const submissions = rows;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-indigo-500/10 text-indigo-600 border-none';
            case 'under_review': return 'bg-amber-500/10 text-amber-600 border-none';
            case 'accepted': return 'bg-purple-500/10 text-purple-600 border-none';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-none';
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-none';
            case 'published': return 'bg-cyan-500/10 text-cyan-600 border-none';
            default: return 'bg-muted text-muted-foreground border-none';
        }
    };

    return (
        <div className="space-y-6 pb-20">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-primary/5 pb-8">
                <div>
                    <h1 className="text-3xl font-black text-primary tracking-tighter italic">Manuscripts Registry</h1>
                    <p className="text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mt-1 italic">Global submission pipeline & editorial oversight</p>
                </div>
                <div className="flex gap-4">
                    <Button asChild className="h-16 px-10 gap-3 bg-primary text-white font-black text-xs uppercase tracking-[0.3em] rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all italic">
                        <Link href="/submit">
                            <Plus className="w-5 h-5" /> Add Manuscript
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="border-primary/5 shadow-vip overflow-hidden bg-white">
                <CardContent className="p-0">
                    {/* Search & Tabs Header */}
                    <div className="p-6 border-b border-primary/5 space-y-6 bg-primary/[0.02]">
                        <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                            <div className="relative flex-1 w-full max-w-sm group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30 group-focus-within:text-primary transition-colors" />
                                <Input
                                    className="pl-11 h-12 bg-white border-primary/10 focus-visible:ring-1 focus-visible:ring-primary/20 text-xs font-bold rounded-xl italic shadow-inner"
                                    placeholder="Search Paper ID, Title, or Author..."
                                />
                            </div>
                            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-xl border border-primary/10 shrink-0 shadow-sm">
                                <FileText className="w-4 h-4 text-primary/40" />
                                <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] italic">{submissions.length} Total Records</span>
                            </div>
                        </div>
                        <Separator className="bg-primary/5" />
                        <SubmissionTabs currentStatus={currentStatus} />
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-primary/[0.01]">
                                <TableRow className="hover:bg-transparent border-primary/5">
                                    <TableHead className="h-12 px-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic w-32">Registry ID</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic">Manuscript Dossier</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic w-36 text-center">Protocol Status</TableHead>
                                    <TableHead className="h-12 px-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] italic w-32 text-right">Operations</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub: any) => (
                                    <TableRow key={sub.id} className="hover:bg-primary/[0.02] border-primary/5 group transition-colors">
                                        <TableCell className="px-6 py-5">
                                            <span className="font-mono font-black text-[9px] bg-primary/5 px-2.5 py-1.5 rounded-lg border border-primary/10 text-primary/60 shadow-inner">
                                                {sub.paper_id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex flex-col gap-1.5">
                                                <h4 className="font-black text-primary text-xs leading-tight tracking-tight group-hover:text-secondary transition-colors line-clamp-1 italic">
                                                    {sub.title}
                                                </h4>
                                                <div className="flex items-center gap-4 text-[10px] font-black text-primary/30 uppercase tracking-[0.1em] italic">
                                                    <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 opacity-50" /> {sub.author_name}</span>
                                                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-50" /> {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5">
                                            <div className="flex flex-col gap-2 items-center">
                                                <Badge className={`h-6 px-2 text-[8px] font-black uppercase tracking-widest italic border-none shadow-sm ${getStatusVariant(sub.status)}`}>
                                                    {sub.status.replace('_', ' ')}
                                                </Badge>
                                                {sub.status === 'under_review' && sub.completed_reviews > 0 && (
                                                    <div className="flex items-center gap-2 text-[8px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-500/5 px-2 py-0.5 rounded-full border border-emerald-500/10 italic">
                                                        <MessageSquare className="w-3 h-3" />
                                                        Feedback ({sub.completed_reviews})
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button asChild variant="ghost" size="icon" className="h-10 w-10 text-primary/40 hover:text-primary hover:bg-primary/5 rounded-xl shadow-inner border border-transparent hover:border-primary/10 transition-all group/btn">
                                                                <Link href={`/admin/submissions/${sub.id}`}>
                                                                    <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                                                                </Link>
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent className="bg-primary text-white text-[10px] font-black uppercase tracking-widest border-none px-4 py-2 italic rounded-xl shadow-2xl">
                                                            View Parameters
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-primary/30 hover:text-primary rounded-xl transition-colors">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-primary/5 bg-white">
                                                        <DropdownMenuItem asChild className="rounded-xl h-11 gap-3 cursor-pointer focus:bg-primary/5 focus:text-primary transition-all px-4">
                                                            <Link href={`/admin/submissions/${sub.id}`}>
                                                                <FileText className="w-4.5 h-4.5 text-primary/40" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest italic">Decision Protocol</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <Separator className="my-2 bg-primary/5" />
                                                        {sub.status !== 'paid' && sub.status !== 'published' && (
                                                            <div className="px-1 py-1">
                                                                <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                                                            </div>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Stats */}
                    <div className="p-6 border-t border-primary/5 flex items-center justify-between bg-primary/[0.01]">
                        <p className="text-[9px] font-black text-primary/20 uppercase tracking-[0.4em] italic">
                            Secure Data Segment End
                        </p>
                        <div className="flex gap-4">
                            <Button variant="ghost" size="sm" disabled className="h-9 px-5 text-[9px] font-black uppercase tracking-widest opacity-20 italic">
                                Previous Sector
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 px-5 text-[9px] font-black uppercase tracking-[0.2em] text-primary hover:bg-primary/5 rounded-xl italic">
                                Next Sector
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground/20 mb-4" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No active records in this database segment</p>
                </div>
            )}
        </div>
    );
}

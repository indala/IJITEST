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
    Plus,
    FileText,
    MessageSquare
} from 'lucide-react';
import pool from '@/lib/db';
import Link from 'next/link';
import SubmissionTabs from '@/features/submissions/components/SubmissionTabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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

export const dynamic = 'force-dynamic';

export default async function Submissions({
    searchParams
}: {
    searchParams: Promise<{ status?: string }>
}) {
    const { status } = await searchParams;
    const currentStatus = status || 'all';

    // Fetch submissions from MySQL with optional status filtering
    let query = 'SELECT * FROM submissions';
    let params: any[] = [];

    if (currentStatus === 'pending') {
        query += ' WHERE status IN ("under_review", "accepted")';
    } else if (currentStatus !== 'all') {
        query += ' WHERE status = ?';
        params.push(currentStatus);
    }

    query += ' ORDER BY submitted_at DESC';

    const [rows]: any = await pool.execute(query, params);
    const submissions = rows;

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-indigo-500/10 text-indigo-600 border-none hover:bg-indigo-500/20';
            case 'under_review': return 'bg-amber-500/10 text-amber-600 border-none hover:bg-amber-500/20';
            case 'accepted': return 'bg-purple-500/10 text-purple-600 border-none hover:bg-purple-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-none hover:bg-rose-500/20';
            case 'paid': return 'bg-emerald-500/10 text-emerald-600 border-none hover:bg-emerald-500/20';
            default: return 'bg-cyan-500/10 text-cyan-600 border-none hover:bg-cyan-500/20';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-black text-foreground tracking-tight">Editorial Queue</h1>
                    <p className="text-xs font-medium text-muted-foreground">Manage and track the lifecycle of assigned manuscripts.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-9 px-3 gap-2 text-[10px] font-black uppercase tracking-widest rounded-lg">
                        <Filter className="w-4 h-4" /> Filter
                    </Button>
                    <Button asChild size="sm" className="h-9 px-3 gap-2 bg-primary text-white font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-primary/20">
                        <Link href="/submit">
                            <Plus className="w-4 h-4" /> Manual Add
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <Card className="border-border/50 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                    {/* Search & Tabs Header */}
                    <div className="p-4 border-b border-border/50 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                className="pl-10 h-10 bg-muted/30 border-none focus-visible:ring-1 focus-visible:ring-primary/20 text-xs font-bold"
                                placeholder="Search by Paper ID, Title, or Author..."
                            />
                        </div>
                        <SubmissionTabs currentStatus={currentStatus} />
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="h-10 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Paper ID</TableHead>
                                    <TableHead className="h-10 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Manuscript Details</TableHead>
                                    <TableHead className="h-10 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Submitted</TableHead>
                                    <TableHead className="h-10 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Status</TableHead>
                                    <TableHead className="h-10 px-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {submissions.map((sub: any) => (
                                    <TableRow key={sub.id} className="hover:bg-muted/10 border-border/50 group">
                                        <TableCell className="px-4 py-3 text-[10px]">
                                            <span className="font-mono font-black bg-muted px-2 py-1 rounded-md text-muted-foreground border border-border/50">
                                                {sub.paper_id}
                                            </span>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="max-w-md">
                                                <h4 className="font-black text-foreground text-xs leading-tight tracking-tight mb-1 group-hover:text-primary transition-colors truncate">
                                                    {sub.title}
                                                </h4>
                                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                    Author: {sub.author_name}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                                                <Clock className="w-3.5 h-3.5 text-primary/60" />
                                                {new Date(sub.submitted_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-4 py-3">
                                            <Badge className={`h-5 px-1.5 text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${getStatusVariant(sub.status)}`}>
                                                {sub.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="px-4 py-3 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/5">
                                                    <Link href={`/editor/submissions/${sub.id}`}>
                                                        <Eye className="w-4 h-4" />
                                                    </Link>
                                                </Button>

                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 rounded-xl p-1 shadow-xl">
                                                        <DropdownMenuItem asChild className="rounded-lg h-9 gap-2 cursor-pointer">
                                                            <Link href={`/editor/submissions/${sub.id}`}>
                                                                <FileText className="w-4 h-4 text-muted-foreground" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest">View Details</span>
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        {sub.file_path && (
                                                            <DropdownMenuItem asChild className="rounded-lg h-9 gap-2 cursor-pointer">
                                                                <a href={sub.file_path} download>
                                                                    <Download className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Download Asset</span>
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem className="rounded-lg h-9 gap-2 cursor-pointer">
                                                            <MessageSquare className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">Assign Reviewer</span>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Footer */}
                    <div className="p-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/10">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            Showing {submissions.length} Total Records
                        </p>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled className="h-8 px-4 text-[10px] font-black uppercase tracking-widest opacity-50 cursor-not-allowed border-muted-foreground/20">
                                Previous
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 px-4 text-[10px] font-black uppercase tracking-widest border-muted-foreground/20 hover:bg-primary hover:text-white transition-all">
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {submissions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-muted/20 border border-dashed border-border/50 rounded-2xl">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground/20 mb-4" />
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">No active submissions found in this category</p>
                </div>
            )}
        </div>
    );
}

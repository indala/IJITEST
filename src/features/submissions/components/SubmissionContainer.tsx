'use client';

import React, { useState, useMemo } from 'react';
import {
    User,
    Calendar,
    MessageSquare,
    MoreVertical,
    FileText,
    Eye,
    Download
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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


import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import SubmissionSearch from './SubmissionSearch';
import DeleteSubmissionButton from './DeleteSubmissionButton';
import type { SubmissionUI } from '@/db/types';

const getStatusVariant = (status: string) => {
    switch (status) {
        case 'submitted': return 'bg-blue-600 text-white border-blue-700 shadow-sm';
        case 'underReview': return 'bg-amber-600 text-white border-amber-700 shadow-sm';
        case 'accepted': return 'bg-purple-600 text-white border-purple-700 shadow-sm';
        case 'rejected': return 'bg-rose-600 text-white border-rose-700 shadow-sm';
        case 'retracted': return 'bg-red-700 text-white border-red-800 shadow-sm';
        case 'paymentPending': return 'bg-emerald-600 text-white border-emerald-700 shadow-sm';
        case 'published': return 'bg-cyan-600 text-white border-cyan-700 shadow-sm';
        default: return 'bg-muted text-muted-foreground border-none';
    }
};

const SubmissionMobileCard = React.memo(({ sub, role }: { sub: SubmissionUI, role: string }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={sub.id}
        className="p-3.5 sm:p-4 space-y-2.5 bg-card border-b border-border/70 active:bg-muted/50 transition-colors"
    >
        <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs border border-border/70 text-muted-foreground font-semibold">
                        {sub.paperId}
                    </span>
                    <Badge className={`h-5 px-2.5 rounded-md text-[10px] font-semibold border-none ${getStatusVariant(sub.status)}`}>
                        {sub.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Badge>
                </div>
                <h4 className="font-medium text-foreground text-sm leading-snug">
                    {sub.title}
                </h4>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" aria-label="More options">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-border/70 bg-card">
                    <DropdownMenuItem asChild className="rounded-lg h-9 gap-2.5 px-3 text-xs sm:text-sm font-medium focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                        <Link href={`/${role}/submissions/${sub.id}`}>
                            <Eye className="w-4 h-4 text-primary" />
                            <span>Inspect Manuscript</span>
                        </Link>
                    </DropdownMenuItem>
                    <Separator className="my-1 border-border/50" />
                    {role === 'admin' && sub.status !== 'published' && (
                        <div className="px-1 py-1">
                            <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                        </div>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-0.5">
                <span className="text-meta">Author</span>
                <p className="text-foreground truncate flex items-center gap-1.5 font-medium">
                    <User className="w-3.5 h-3.5 text-primary" /> {sub.authorName}
                </p>
            </div>
            <div className="space-y-0.5">
                <span className="text-meta">Date</span>
                <p className="text-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-primary" /> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString() : 'N/A'}
                </p>
            </div>
        </div>

        <div className="pt-2 border-t border-border/50 flex justify-end gap-2">
            <Button asChild size="sm" className="h-8 px-3 btn-primary text-xs font-semibold rounded-lg">
                <Link href={`/${role}/submissions/${sub.id}`}>
                    Examine
                </Link>
            </Button>
        </div>
    </motion.div>
));

SubmissionMobileCard.displayName = 'SubmissionMobileCard';

const SubmissionDesktopRow = React.memo(({ sub, role }: { sub: SubmissionUI, role: string }) => (
    <TableRow className="hover:bg-muted/30 transition-colors border-b border-border/50 group">
        <TableCell className="px-3.5 py-3">
            <span className="font-mono text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/60">
                {sub.paperId}
            </span>
        </TableCell>
        <TableCell className="px-3.5 py-3">
            <div className="space-y-1">
                <h4 className="font-medium text-foreground text-sm leading-snug group-hover:text-primary transition-colors wrap-break-word">
                    {sub.title}
                </h4>
                <div className="flex items-center gap-4 text-meta">
                    <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary" /> {sub.authorName}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {sub.submittedAt ? new Date(sub.submittedAt).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                    </span>
                </div>
            </div>
        </TableCell>
        <TableCell className="px-3.5 py-3">
            <div className="flex flex-col gap-1.5 items-center">
                <Badge className={`h-5 px-2 text-[10px] font-semibold rounded-md border-none ${getStatusVariant(sub.status)}`}>
                    {sub.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Badge>
                {sub.status === 'underReview' && (sub.completedReviews ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 text-[10px] font-semibold">
                        <MessageSquare className="w-3 h-3" />
                        {sub.completedReviews} Reviews
                    </div>
                )}
            </div>
        </TableCell>
        <TableCell className="px-3.5 py-3 text-right">
            <div className="flex items-center justify-end gap-2">
                <Button asChild size="sm" className="h-8 px-3 btn-primary text-xs font-semibold rounded-lg">
                    <Link href={`/${role}/submissions/${sub.id}`}>
                        Examine
                    </Link>
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer" aria-label="More options">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-border/70 bg-card">
                        <DropdownMenuItem asChild className="rounded-lg h-9 gap-2.5 px-3 text-xs sm:text-sm font-medium focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer">
                            <Link href={`/${role}/submissions/${sub.id}`}>
                                <FileText className="w-4 h-4 text-primary" />
                                <span>Decision Protocol</span>
                            </Link>
                        </DropdownMenuItem>
                        <Separator className="my-1 border-border/50" />
                        {role === 'admin' && sub.status !== 'published' && (
                            <div className="px-1 py-1">
                                <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                            </div>
                        )}
                        {role === 'editor' && sub.filePath && (
                            <DropdownMenuItem asChild className="rounded-lg h-9 gap-2.5 px-3 text-xs sm:text-sm font-medium group cursor-pointer">
                                <a href={sub.filePath} download className="flex items-center gap-2.5">
                                    <Download className="w-4 h-4 text-emerald-600" />
                                    <span>Download MS</span>
                                </a>
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </TableCell>
    </TableRow>
));

SubmissionDesktopRow.displayName = 'SubmissionDesktopRow';

interface SubmissionContainerProps {
    submissions: SubmissionUI[];
    role: 'admin' | 'editor';
}

export default function SubmissionContainer({ submissions, role }: SubmissionContainerProps) {
    const [filterQuery, setFilterQuery] = useState('');

    const filteredSubmissions = useMemo(() => {
        if (!filterQuery) return submissions;
        const q = filterQuery.toLowerCase();
        return submissions.filter(sub =>
            sub.paperId.toLowerCase().includes(q) ||
            sub.title.toLowerCase().includes(q) ||
            sub.authorName.toLowerCase().includes(q) ||
            (sub.coAuthors && sub.coAuthors.some((a) => a.name.toLowerCase().includes(q)))
        );
    }, [submissions, filterQuery]);

    return (
        <div className="flex flex-col">
            {/* Search & Stats Header */}
            <div className="p-4 sm:p-5 border-b border-border/70 bg-muted/10">
                <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
                    <div className="flex-1 max-w-md">
                        <SubmissionSearch
                            placeholder="Search manuscripts..."
                            onLocalFilter={setFilterQuery}
                        />
                    </div>
                    <div className="flex items-center gap-3 px-3.5 py-2 bg-card rounded-xl border border-border/70 shrink-0 shadow-2xs self-start sm:self-auto">
                        <div className="flex flex-col items-end">
                            <span className="text-meta">Active Records</span>
                            <span className="text-sm font-bold text-primary">
                                {filteredSubmissions.length} <span className="text-muted-foreground/50 font-normal">/</span> {submissions.length}
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-4 h-4" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-border/70">
                {filteredSubmissions.map((sub) => (
                    <SubmissionMobileCard key={sub.id} sub={sub} role={role} />
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-visible">
                <Table>
                    <TableHeader className="bg-muted/40">
                        <TableRow className="border-b border-border/70">
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-36">System ID</TableHead>
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground">Manuscript Dossier</TableHead>
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-40 text-center">Status</TableHead>
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-36 text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.map((sub) => (
                            <SubmissionDesktopRow key={sub.id} sub={sub} role={role} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

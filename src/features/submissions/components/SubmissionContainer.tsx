'use client';

import React, { useState, useMemo } from 'react';
import {
    User,
    Calendar,
    MessageSquare,
    MoreVertical,
    FileText,
    Download
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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

const canDeleteSubmission = (status: string) => status === 'submitted' || status === 'rejected';

const SubmissionMobileCard = React.memo(({ sub, role }: { sub: SubmissionUI, role: string }) => {
    const router = useRouter();
    const detailHref = `/${role}/submissions/${sub.id}`;

    const openDetails = () => router.push(detailHref);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    };

    return (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        key={sub.id}
        role="link"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={handleKeyDown}
        className="p-3.5 sm:p-4 space-y-2.5 bg-card border-b border-border/70 active:bg-muted/50 hover:bg-muted/20 transition-colors cursor-pointer"
    >
        <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-muted px-2 py-0.5 rounded text-meta border border-border/70 text-muted-foreground font-semibold">
                        {sub.paperId}
                    </span>
                    <Badge className={`h-5 px-2.5 rounded-md text-badge font-semibold border-none ${getStatusVariant(sub.status)} `}>
                        {sub.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </Badge>
                </div>
                <h4 className="font-medium text-foreground leading-snug">
                    {sub.title}
                </h4>
            </div>
            {role === 'admin' && canDeleteSubmission(sub.status) && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={event => event.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg" aria-label="More options">
                            <MoreVertical className="w-4 h-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-border/70 bg-card">
                        <div className="px-1 py-1">
                            <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-body-sm">
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
            <span className="text-meta text-muted-foreground">Open manuscript details</span>
        </div>
    </motion.div>
    );
});

SubmissionMobileCard.displayName = 'SubmissionMobileCard';

const SubmissionDesktopRow = React.memo(({ sub, role, hasActions }: { sub: SubmissionUI, role: string, hasActions: boolean }) => {
    const router = useRouter();
    const detailHref = `/${role}/submissions/${sub.id}`;

    const openDetails = () => router.push(detailHref);
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openDetails();
        }
    };

    return (
    <TableRow
        className="hover:bg-muted/30 transition-colors border-b border-border/50 group cursor-pointer"
        tabIndex={0}
        onClick={openDetails}
        onKeyDown={handleKeyDown}
    >
        <TableCell className="px-3.5 py-3">
            <span className="font-mono text-muted-foreground bg-muted/60 px-2 py-0.5 rounded border border-border/60">
                {sub.paperId}
            </span>
        </TableCell>
        <TableCell className="px-3.5 py-3 whitespace-normal">
            <div className="min-w-0 space-y-1">
                <h4 className="font-medium text-foreground leading-snug group-hover:text-primary transition-colors wrap-break-word break-words">
                    {sub.title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-meta">
                    <span className="flex min-w-0 items-center gap-1.5 break-words">
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
                <Badge className={`h-5 px-2 text-badge font-semibold rounded-md border-none ${getStatusVariant(sub.status)} `}>
                    {sub.status.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Badge>
                {sub.status === 'underReview' && (sub.completedReviews ?? 0) > 0 && (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 text-badge font-semibold">
                        <MessageSquare className="w-3 h-3" />
                        {sub.completedReviews} Reviews
                    </div>
                )}
            </div>
        </TableCell>
        {hasActions && (
            <TableCell className="px-3.5 py-3 text-right">
                <div className="flex items-center justify-end gap-2">
                    {((role === 'admin' && canDeleteSubmission(sub.status)) || (role === 'editor' && !!sub.filePath)) && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={event => event.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer" aria-label="More options">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" onClick={event => event.stopPropagation()} className="w-56 rounded-xl p-1.5 shadow-xl border-border/70 bg-card">
                            {role === 'admin' && canDeleteSubmission(sub.status) && (
                                <div className="px-1 py-1">
                                    <DeleteSubmissionButton submissionId={sub.id} status={sub.status} variant="full" />
                                </div>
                            )}
                            {role === 'editor' && sub.filePath && (
                                <DropdownMenuItem asChild className="rounded-lg h-9 gap-2.5 px-3 font-medium group cursor-pointer">
                                    <a href={sub.filePath} download className="flex items-center gap-2.5">
                                        <Download className="w-4 h-4 text-emerald-600" />
                                        <span>Download MS</span>
                                    </a>
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </TableCell>
        )}
    </TableRow>
    );
});

SubmissionDesktopRow.displayName = 'SubmissionDesktopRow';

interface SubmissionContainerProps {
    submissions: SubmissionUI[];
    role: 'admin' | 'editor';
}

export default function SubmissionContainer({ submissions, role }: SubmissionContainerProps) {
    const [filterQuery, setFilterQuery] = useState('');
    const hasActions = submissions.some(sub =>
        (role === 'admin' && canDeleteSubmission(sub.status)) ||
        (role === 'editor' && !!sub.filePath)
    );

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
                            <span className="text-body-sm font-bold text-primary">
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
                <Table className="table-fixed">
                    <TableHeader className="bg-muted/40">
                        <TableRow className="border-b border-border/70">
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-44">System ID</TableHead>
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground">Manuscript Dossier</TableHead>
                            <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-40 text-center">Status</TableHead>
                            {hasActions && (
                                <TableHead className="font-semibold h-11 px-4 text-label uppercase text-muted-foreground w-36 text-right">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSubmissions.map((sub) => (
                            <SubmissionDesktopRow key={sub.id} sub={sub} role={role} hasActions={hasActions} />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

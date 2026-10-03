import { Suspense } from "react";
import { getSubmissionById } from "@/actions/submissions";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { type SubmissionIdParam } from "@/db/types";
import SubmissionDetailContainer from "@/features/submissions/components/SubmissionDetailContainer";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: 'Submission Management',
        description: 'Administrative manuscript management for IJITEST.',
    };
}

function SubmissionDetailSkeleton() {
    return (
        <div className="space-y-6 animate-pulse p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded-md" />
                    <div className="h-8 w-64 bg-muted rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-10 w-28 bg-muted rounded-xl" />
                    <div className="h-10 w-28 bg-muted rounded-xl" />
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-44 bg-muted/40 rounded-2xl border border-border/50" />
                    <div className="h-64 bg-muted/40 rounded-2xl border border-border/50" />
                </div>
                <div className="space-y-6">
                    <div className="h-72 bg-muted/40 rounded-2xl border border-border/50" />
                </div>
            </div>
        </div>
    );
}

async function SubmissionDetailsContent({ params }: { params: Promise<SubmissionIdParam> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h2 className="font-semibold text-foreground tracking-wider mb-2">Invalid Identification</h2>
                <p className="text-caption font-medium text-muted-foreground mb-6">The manuscript reference provided is not in a valid numerical format.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-semibold tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Return to Repository</Link>
                </Button>
            </div>
        );
    }

    const response = await getSubmissionById(id);
    if (!response.success || !response.data) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h2 className="font-semibold text-foreground tracking-wider mb-2">Manuscript Not Found</h2>
                <p className="text-caption font-medium text-muted-foreground mb-6 max-w-sm">The requested manuscript (Ref: {id}) could not be located in the primary database node.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-semibold tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Back to Submissions</Link>
                </Button>
            </div>
        );
    }
    const submission = response.data;

    return (
        <SubmissionDetailContainer role="admin" submission={submission} />
    );
}

export default function SubmissionDetails({ params }: { params: Promise<SubmissionIdParam> }) {
    return (
        <Suspense fallback={<SubmissionDetailSkeleton />}>
            <SubmissionDetailsContent params={params} />
        </Suspense>
    );
}

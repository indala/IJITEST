import { getSubmissionById } from "@/actions/submissions";
import { AlertCircle, FileText } from "lucide-react";
import Link from "next/link";
import type { Metadata } from 'next';
import { Button } from "@/components/ui/button";
import { type SubmissionIdParam } from "@/db/types";
import SubmissionDetailContainer from "@/features/submissions/components/SubmissionDetailContainer";

export async function generateMetadata({ params }: { params: Promise<SubmissionIdParam> }): Promise<Metadata> {
    const { id } = await params;
    const response = await getSubmissionById(parseInt(id));
    const submission = response.data;
    if (!response.success || !submission) return { title: 'Submission Not Found | Admin' };

    return {
        title: `Manage: ${submission.paperId} | IJITEST Admin`,
        description: `Administrative oversight for manuscript ${submission.paperId}: ${submission.title}`,
    };
}

export default async function SubmissionDetails({ params }: { params: Promise<SubmissionIdParam> }) {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    if (isNaN(id)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h2 className=" font-semibold text-foreground tracking-wider mb-2">Invalid Identification</h2>
                <p className="text-xs font-medium text-muted-foreground mb-6">The manuscript reference provided is not in a valid numerical format.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-semibold text-[10px]  tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Return to Repository</Link>
                </Button>
            </div>
        );
    }

    const response = await getSubmissionById(id);
    const submission = response.data;

    if (!response.success || !submission) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                    <FileText className="w-8 h-8 text-muted-foreground/30" />
                </div>
                <h2 className=" font-semibold text-foreground tracking-wider mb-2">Manuscript Not Found</h2>
                <p className="text-xs font-medium text-muted-foreground mb-6 max-w-sm">The requested manuscript (Ref: {id}) could not be located in the primary database node.</p>
                <Button asChild variant="outline" className="h-10 px-6 font-semibold text-[10px]  tracking-widest rounded-xl cursor-pointer">
                    <Link className="cursor-pointer" href="/admin/submissions">Back to Submissions</Link>
                </Button>
            </div>
        );
    }

    return (
        <SubmissionDetailContainer role="admin" submission={submission} />
    );
}

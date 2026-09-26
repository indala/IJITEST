import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getApplicationById } from "@/actions/applications";
import type { SubmissionIdParam } from "@/db/types";
import { ApplicationDetailReview } from "@/features/applications/components/ApplicationDetailReview";

export const metadata: Metadata = {
    title: "Application Review | IJITEST Admin",
};

export default function AdminApplicationDetailPage({
    params,
}: {
    params: Promise<SubmissionIdParam>;
}) {
    return (
        <Suspense fallback={<div className="min-h-64 animate-pulse rounded-2xl bg-muted/50" aria-label="Loading application details" />}>
            <ApplicationDetailContent params={params} />
        </Suspense>
    );
}

async function ApplicationDetailContent({
    params,
}: {
    params: Promise<SubmissionIdParam>;
}) {
    const { id: idParam } = await params;
    const id = Number(idParam);
    if (!Number.isSafeInteger(id) || id < 1) notFound();

    const result = await getApplicationById(id);
    if (!result.success || !result.data) notFound();

    return <ApplicationDetailReview application={result.data} />;
}

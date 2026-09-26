"use client";

import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, BriefcaseBusiness, Building2, CalendarDays, Check, Download, FileText, Globe2, Mail, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { approveApplication, rejectApplication } from "@/actions/applications";
import type { Application } from "@/db/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { applicationKeys } from "@/features/applications";

const statusClasses: Record<Application["status"], string> = {
    pending: "border-amber-300 bg-amber-50 text-amber-900",
    approved: "border-emerald-300 bg-emerald-50 text-emerald-800",
    rejected: "border-rose-300 bg-rose-50 text-rose-800",
};

export function ApplicationDetailReview({
    application,
    applicationsPath = "/admin/applications",
}: {
    application: Application;
    applicationsPath?: string;
}) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [isPending, startTransition] = useTransition();
    const [rejectionReason, setRejectionReason] = useState("");
    const [confirmingApproval, setConfirmingApproval] = useState(false);
    const isPendingApplication = application.status === "pending";

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveApplication(application.id);
            if (!result.success) {
                toast.error(result.error || "Could not approve this application.");
                return;
            }
            toast.success("Application approved and invitation sent.");
            await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
            router.push(applicationsPath);
            router.refresh();
        });
    };

    const handleReject = () => {
        if (rejectionReason.trim().length < 20) {
            toast.error("Please provide a rejection reason of at least 20 characters.");
            return;
        }
        startTransition(async () => {
            const result = await rejectApplication(application.id, rejectionReason.trim());
            if (!result.success) {
                toast.error(result.error || "Could not reject this application.");
                return;
            }
            toast.success("Application rejected.");
            await queryClient.invalidateQueries({ queryKey: applicationKeys.all });
            router.push(applicationsPath);
            router.refresh();
        });
    };

    return (
        <div className="mx-auto w-full max-w-7xl space-y-6 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <Button asChild variant="ghost" className="-ml-3 gap-2 text-muted-foreground">
                    <Link href={applicationsPath}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to applications
                    </Link>
                </Button>
                <Badge variant="outline" className={`px-3 py-1 font-semibold capitalize ${statusClasses[application.status]}`}>
                    {application.status}
                </Badge>
            </div>

            <header className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted">
                        {application.photoUrl ? (
                            <Image
                                src={application.photoUrl}
                                alt={`${application.fullName} profile`}
                                fill
                                sizes="80px"
                                className="object-cover"
                            />
                        ) : (
                            <UserRound className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="mb-1 text-label font-semibold uppercase tracking-widest text-muted-foreground">
                            {application.type} application
                        </p>
                        <h1 className="mb-2 break-words text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                            {application.fullName}
                        </h1>
                        <a href={`mailto:${application.email}`} className="inline-flex items-center gap-2 text-body-sm font-medium text-primary hover:underline">
                            <Mail className="h-4 w-4" aria-hidden="true" />
                            {application.email}
                        </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button asChild variant="outline" className="gap-2">
                            <a href={`mailto:${application.email}`}>
                                <Mail className="h-4 w-4" aria-hidden="true" />
                                Contact applicant
                            </a>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle as="h2" className="text-lg">Applicant profile</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                            <ProfileField icon={<Building2 />} label="Institution" value={application.institute} />
                            <ProfileField icon={<BriefcaseBusiness />} label="Designation" value={application.designation} />
                            <ProfileField icon={<Globe2 />} label="Nationality" value={application.nationality || "Not provided"} />
                            <ProfileField
                                icon={<CalendarDays />}
                                label="Application received"
                                value={application.createdAt ? new Date(application.createdAt).toLocaleDateString() : "Date unavailable"}
                            />
                        </CardContent>
                    </Card>

                    <Card className="border-border shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle as="h2" className="text-lg">Research interests</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {application.researchInterests?.length ? (
                                <ul className="flex flex-wrap gap-2" aria-label="Research interests">
                                    {application.researchInterests.map((interest) => (
                                        <li key={interest}>
                                            <Badge variant="outline" className="border-primary/20 bg-primary/5 px-3 py-1 text-primary">
                                                {interest}
                                            </Badge>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="m-0 text-body-sm text-muted-foreground">No research interests were provided.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden border-border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border">
                            <div>
                                <CardTitle as="h2" className="text-lg">Curriculum vitae</CardTitle>
                                <p className="mt-1 text-caption text-muted-foreground">Review the applicant&apos;s uploaded supporting document.</p>
                            </div>
                            {application.cvUrl && (
                                <Button asChild variant="outline" size="sm" className="shrink-0 gap-2">
                                    <a href={application.cvUrl} download>
                                        <Download className="h-4 w-4" aria-hidden="true" />
                                        Download
                                    </a>
                                </Button>
                            )}
                        </CardHeader>
                        <CardContent className="p-0">
                            {application.cvUrl?.toLowerCase().includes(".pdf") ? (
                                <iframe
                                    src={application.cvUrl}
                                    title={`CV document for ${application.fullName}`}
                                    className="h-[65vh] min-h-[480px] w-full border-0 bg-muted"
                                />
                            ) : application.cvUrl ? (
                                <div className="flex min-h-52 flex-col items-center justify-center gap-4 p-8 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                                    <p className="m-0 text-body-sm text-muted-foreground">Preview is unavailable for this file type. Download it to review the document.</p>
                                    <Button asChild variant="outline">
                                        <a href={application.cvUrl} download>
                                            <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                                            Download CV
                                        </a>
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex min-h-52 flex-col items-center justify-center gap-3 p-8 text-center">
                                    <FileText className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
                                    <p className="m-0 text-body-sm text-muted-foreground">No CV document was uploaded with this application.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-6">
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle as="h2" className="text-lg">Review decision</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!isPendingApplication ? (
                                <div className={`rounded-xl border p-4 ${statusClasses[application.status]}`}>
                                    <p className="mb-1 font-semibold capitalize">Application {application.status}</p>
                                    <p className="m-0 text-body-sm">This application has already been reviewed. No further decision is available.</p>
                                </div>
                            ) : (
                                <>
                                    {confirmingApproval ? (
                                        <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                            <p className="m-0 font-semibold text-emerald-900">Approve this application?</p>
                                            <p className="m-0 text-body-sm text-emerald-800">An account invitation will be emailed to {application.email}.</p>
                                            <div className="flex gap-2">
                                                <Button type="button" variant="outline" className="flex-1" onClick={() => setConfirmingApproval(false)} disabled={isPending}>
                                                    Cancel
                                                </Button>
                                                <Button type="button" className="flex-1 bg-emerald-700 text-white hover:bg-emerald-800" onClick={handleApprove} disabled={isPending}>
                                                    <Check className="mr-2 h-4 w-4" aria-hidden="true" />
                                                    Confirm
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button type="button" className="w-full gap-2 bg-emerald-700 text-white hover:bg-emerald-800" onClick={() => setConfirmingApproval(true)} disabled={isPending}>
                                            <Check className="h-4 w-4" aria-hidden="true" />
                                            Approve and invite
                                        </Button>
                                    )}

                                    <div className="space-y-3 border-t border-border pt-4">
                                        <label htmlFor="application-rejection-reason" className="text-label font-semibold text-foreground">
                                            Rejection reason
                                        </label>
                                        <Textarea
                                            id="application-rejection-reason"
                                            value={rejectionReason}
                                            onChange={(event) => setRejectionReason(event.target.value)}
                                            placeholder="Give the applicant a clear reason for the decision."
                                            rows={5}
                                            maxLength={2000}
                                            disabled={isPending}
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="m-0 text-caption text-muted-foreground">At least 20 characters; included in the rejection email.</p>
                                            <span className="shrink-0 text-caption tabular-nums text-muted-foreground">{rejectionReason.length}/2000</span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full gap-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                                            onClick={handleReject}
                                            disabled={isPending || rejectionReason.trim().length < 20}
                                        >
                                            <X className="h-4 w-4" aria-hidden="true" />
                                            Reject application
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function ProfileField({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <div className="flex gap-3">
            <span className="mt-0.5 text-muted-foreground [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{icon}</span>
            <div className="min-w-0 space-y-1">
                <p className="m-0 text-label font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="m-0 break-words text-body-sm font-medium text-foreground">{value}</p>
            </div>
        </div>
    );
}

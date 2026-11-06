import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { publications, submissions, volumesIssues } from "@/db/schema";
import { getSubmissionById } from "@/actions/submissions";
import { getSettingsData } from "@/actions/settings";
import { triggerPdfBranding } from "@/lib/fs-utils";

function formatPublicationDate(value: Date | string | null | undefined): string | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime())
        ? null
        : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

export async function rebrandPublishedPaperWithDoi(submissionId: number, doi: string | null): Promise<void> {
    const [row] = await db.select({
        publication: publications,
        submission: submissions,
        issue: volumesIssues,
    })
        .from(publications)
        .innerJoin(submissions, eq(publications.submissionId, submissions.id))
        .innerJoin(volumesIssues, eq(publications.issueId, volumesIssues.id))
        .where(eq(publications.submissionId, submissionId))
        .limit(1);

    if (!row) throw new Error(`Publication ${submissionId} was not found for DOI branding.`);

    const submissionResult = await getSubmissionById(submissionId);
    if (!submissionResult.success || !submissionResult.data) {
        throw new Error(submissionResult.success ? "Submission details were not found." : submissionResult.error);
    }

    const originalPdf = submissionResult.data.allFiles.find(file => file.fileType === "pdfVersion");
    if (!originalPdf) throw new Error("Original styled PDF is missing from the submission version records.");

    const settings = await getSettingsData();
    const submission = submissionResult.data;
    const firstAuthor = submission.authors?.length
        ? [...submission.authors].sort((a, b) => a.orderIndex - b.orderIndex)[0]?.name?.trim()
        : submission.authorName;
    const title = submission.title?.trim() || "";

    await triggerPdfBranding(originalPdf.fileUrl, row.publication.finalPdfUrl, {
        journalName: settings["journalName"] || "International Journal of Innovative Trends in Engineering Science and Technology",
        journalShortName: settings["journalShortName"] || "IJITEST",
        volume: row.issue.volumeNumber,
        issue: row.issue.issueNumber,
        year: row.issue.year,
        monthRange: row.issue.monthRange || "",
        issn: settings["issnNumber"] || "3139-6887",
        website: settings["journalWebsite"] || "https://ijitest.org",
        paperId: row.submission.paperId,
        startPage: row.publication.startPage,
        endPage: row.publication.endPage,
        doi,
        license: "Creative Commons Attribution 4.0 International (CC BY 4.0)",
        receivedDate: formatPublicationDate(submission.submittedAt),
        acceptedDate: formatPublicationDate(submission.decisionAt),
        firstAuthor: firstAuthor || null,
        runningTitle: title.length > 80 ? `${title.slice(0, 77)}...` : title || null,
    });
}

"use server";

import { getPaperById } from "@/actions/archives";
import { getSettingsData } from "@/actions/settings";
import { generatePublicationCertificate } from "@/lib/certificate-generator";

export interface CertificateActionResult {
    success: boolean;
    error?: string;
    pdfBase64?: string;
    filename?: string;
    paperTitle?: string;
}

/**
 * Server Action to generate a publication certificate for a given paper ID.
 * Returns the PDF document encoded as base64 for client-side download or inspection.
 */
export async function generateCertificateAction(paperId: string): Promise<CertificateActionResult> {
    try {
        if (!paperId || typeof paperId !== "string") {
            return { success: false, error: "Paper ID is required" };
        }

        const [paperRes, settings] = await Promise.all([
            getPaperById(paperId.toUpperCase().trim()),
            getSettingsData()
        ]);

        if (!paperRes.success || !paperRes.data) {
            return { success: false, error: "Paper not found or not published" };
        }

        const paper = paperRes.data;
        const authors = Array.isArray(paper.authorsList) && paper.authorsList.length > 0
            ? paper.authorsList
            : [paper.authorName];

        const pdfBytes = await generatePublicationCertificate({
            paperId: paper.paperId,
            title: paper.title,
            authors,
            volume: paper.volumeNumber || 1,
            issue: paper.issueNumber || 1,
            year: paper.publicationYear || new Date().getFullYear(),
            monthRange: paper.monthRange,
            doi: paper.doi || null,
            publishedDate: paper.publishedAt || paper.updatedAt,
            issn: settings['issnNumber'] || "3139-6887",
            journalTitle: settings['journalName'] || "International Journal of Innovative Trends in Engineering Science and Technology",
            baseUrl: settings['journalWebsite'] || "https://ijitest.org",
        });

        const safeFilename = `Certificate-${paper.paperId}.pdf`;
        const pdfBase64 = Buffer.from(pdfBytes).toString("base64");

        return {
            success: true,
            pdfBase64,
            filename: safeFilename,
            paperTitle: paper.title,
        };
    } catch (error) {
        console.error("[generateCertificateAction] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to generate certificate",
        };
    }
}

function normalizeTitle(title: string): string {
    return title.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function isCrossrefWorkForDoi(response: unknown, doi: string, expectedTitle?: string): boolean {
    if (typeof response !== "object" || response === null) return false;

    const message = (response as Record<string, unknown>)["message"];
    if (typeof message !== "object" || message === null) return false;

    const record = message as Record<string, unknown>;
    const returnedDoi = record["DOI"];
    if (typeof returnedDoi !== "string" || returnedDoi.toLowerCase() !== doi.toLowerCase()) return false;
    if (!expectedTitle) return true;

    const titles = record["title"];
    const normalizedExpectedTitle = normalizeTitle(expectedTitle);
    return Array.isArray(titles) && titles.some(
        title => typeof title === "string" && normalizeTitle(title) === normalizedExpectedTitle
    );
}

export interface CrossrefReportResult {
    status: 'registered' | 'failed' | 'pending';
    recordCount?: number;
    successCount?: number;
    failureCount?: number;
    warningCount?: number;
    message?: string;
    raw?: string;
}

/**
 * Parses the Crossref submissionDownload diagnostic XML or text log
 * returned for a specific batch submission.
 */
export function parseCrossrefSubmissionReport(reportText: string): CrossrefReportResult {
    if (!reportText || typeof reportText !== "string") {
        return { status: "pending", message: "No diagnostic report content received." };
    }

    const trimmed = reportText.trim();

    // Check for failure count in diagnostic XML
    const failureCountMatch = trimmed.match(/<failure_count>\s*(\d+)\s*<\/failure_count>/i);
    const successCountMatch = trimmed.match(/<success_count>\s*(\d+)\s*<\/success_count>/i);
    const failureCount = failureCountMatch ? parseInt(failureCountMatch[1]!, 10) : 0;
    const successCount = successCountMatch ? parseInt(successCountMatch[1]!, 10) : 0;

    // Check for explicit record_diagnostic failure
    const failureDiagMatch = trimmed.match(/<record_diagnostic[^>]*status=["']Failure["'][^>]*>([\s\S]*?)<\/record_diagnostic>/i);
    const msgMatch = trimmed.match(/<msg>([\s\S]*?)<\/msg>/i);
    const generalMsg = msgMatch ? msgMatch[1]!.trim() : undefined;

    if (failureCount > 0 || failureDiagMatch) {
        let errorMsg = generalMsg;
        if (!errorMsg && failureDiagMatch) {
            const innerMsg = failureDiagMatch[1]!.match(/<msg>([\s\S]*?)<\/msg>/i);
            errorMsg = innerMsg ? innerMsg[1]!.trim() : failureDiagMatch[1]!.replace(/<[^>]+>/g, "").trim();
        }
        return {
            status: "failed",
            failureCount: failureCount || 1,
            successCount,
            message: errorMsg || "Crossref reported a deposit processing error.",
            raw: trimmed,
        };
    }

    if (successCount > 0 || /<record_diagnostic[^>]*status=["']Success["']/i.test(trimmed)) {
        return {
            status: "registered",
            failureCount: 0,
            successCount: successCount || 1,
            message: generalMsg || "Deposit successfully accepted and registered by Crossref.",
            raw: trimmed,
        };
    }

    // Check for known non-XML or queued status responses from Crossref servlet
    const lower = trimmed.toLowerCase();
    if (lower.includes("unknown submission") || lower.includes("not found") || lower.includes("in progress") || lower.includes("processing")) {
        return {
            status: "pending",
            message: "Deposit batch is currently being processed by Crossref.",
            raw: trimmed,
        };
    }

    // Default to pending if report doesn't indicate completion
    return {
        status: "pending",
        message: "Awaiting Crossref diagnostic report.",
        raw: trimmed,
    };
}


import { NextResponse } from "next/server";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { publications } from "@/db/schema";
import { isCrossrefWorkForDoi } from "@/lib/crossref-status";
import { logSubmissionEvent } from "@/actions/event-log";
import { revalidatePath } from "next/cache";
import { purgeCacheTags } from "@/lib/cache-invalidation";
import { CACHE_TAGS } from "@/lib/cache-tags";

const LOOKUP_TIMEOUT_MS = 15_000;
const LOOKUP_BATCH_SIZE = 5;
const MAX_DOIS_PER_RUN = 50;

interface PendingCrossrefDoi {
    id: number;
    submissionId: number;
    doi: string;
    batchId: string | null;
}

export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env["CRON_SECRET"];

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const pending = await db.select({
            id: publications.id,
            submissionId: publications.submissionId,
            doi: publications.doi,
            batchId: publications.doiRegistrationBatchId,
        })
            .from(publications)
            .where(and(
                eq(publications.doiProvider, "crossref"),
                eq(publications.doiRegistrationStatus, "pending"),
                isNotNull(publications.doi),
            ))
            .limit(MAX_DOIS_PER_RUN);

        const result = {
            checked: pending.length,
            registered: 0,
            stillPending: 0,
            errors: 0,
        };

        for (let offset = 0; offset < pending.length; offset += LOOKUP_BATCH_SIZE) {
            const batch = pending.slice(offset, offset + LOOKUP_BATCH_SIZE) as PendingCrossrefDoi[];
            const batchResults = await Promise.all(batch.map(async (publication) => {
                try {
                    const url = new URL(
                        `https://api.crossref.org/works/${encodeURIComponent(publication.doi)}`
                    );
                    const depositorEmail = process.env["CROSSREF_DEPOSITOR_EMAIL"] || "editor@ijitest.org";
                    url.searchParams.set("mailto", depositorEmail);

                    const response = await fetch(url, {
                        headers: { Accept: "application/json" },
                        signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
                    });

                    if (response.status === 404) {
                        return "pending" as const;
                    }
                    if (!response.ok) {
                        throw new Error(`Crossref lookup returned HTTP ${response.status}`);
                    }

                    const body: unknown = await response.json();
                    if (!isCrossrefWorkForDoi(body, publication.doi)) {
                        return "pending" as const;
                    }

                    const update = await db.update(publications)
                        .set({ doiRegistrationStatus: "registered" })
                        .where(and(
                            eq(publications.id, publication.id),
                            eq(publications.doiProvider, "crossref"),
                            eq(publications.doiRegistrationStatus, "pending"),
                            eq(publications.doi, publication.doi),
                        ));

                    if (update[0].affectedRows > 0) {
                        await logSubmissionEvent({
                            submissionId: publication.submissionId,
                            eventType: "doi_registered",
                            description: `Crossref confirmed DOI ${publication.doi} is registered.`,
                            metadata: {
                                doi: publication.doi,
                                ...(publication.batchId ? { batchId: publication.batchId } : {}),
                            },
                        });
                        return "registered" as const;
                    }

                    return "pending" as const;
                } catch (error) {
                    console.error(`Crossref status lookup failed for ${publication.doi}:`, error);
                    return "error" as const;
                }
            }));

            for (const batchResult of batchResults) {
                if (batchResult === "registered") result.registered++;
                else if (batchResult === "pending") result.stillPending++;
                else result.errors++;
            }
        }

        if (result.registered > 0) {
            purgeCacheTags(CACHE_TAGS.PUBLICATIONS, CACHE_TAGS.ARCHIVES, CACHE_TAGS.LATEST_ISSUE);
            revalidatePath("/admin/publications");
            revalidatePath("/admin/submissions");
        }

        return NextResponse.json({
            success: result.errors === 0,
            ...result,
            maxPerRun: MAX_DOIS_PER_RUN,
            timestamp: new Date().toISOString(),
        }, { status: result.errors === 0 ? 200 : 503 });
    } catch (error) {
        console.error("Cron Crossref status check failed:", error);
        return NextResponse.json(
            { success: false, error: "Crossref status check failed." },
            { status: 500 }
        );
    }
}

import { redirect } from "next/navigation";
import type { PaperDetailParams } from "@/db/types";

/**
 * Permanent canonical redirect from current-issue paper path to authoritative archive repository URL.
 * Preserves backlink equity and prevents duplicate indexing penalties in search engines.
 */
export default async function CurrentIssuePaperRedirect({
    params,
}: {
    params: Promise<PaperDetailParams>;
}) {
    const { volume, issue, paperId } = await params;
    redirect(`/archives/${volume}/${issue}/${paperId.toUpperCase()}`);
}

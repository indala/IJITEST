import { getPaperById } from "@/actions/archives";
import { notFound, redirect } from "next/navigation";

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const res = await getPaperById(id);
    
    const paper = res.success ? res.data : null;

    if (!paper) notFound();

    // Redirect to the new SEO-friendly URL
    const volume = `volume${paper.volume_number}`;
    const issue = `issue${paper.issue_number}`;
    const paperId = paper.paper_id;

    redirect(`/current-issue/${volume}/${issue}/${paperId}`);
}

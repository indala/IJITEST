import { getPaperById } from "@/actions/archives";
import { notFound, redirect } from "next/navigation";
import { getPublishedPapers } from "@/actions/archives";

export async function generateStaticParams() {
    try {
        const res = await getPublishedPapers();
        if (!res.success || !res.data) return [];

        return res.data.map((paper: any) => ({
            id: paper.id.toString(),
        }));
    } catch (error) {
        console.error("Generate Static Params Error:", error);
        return [];
    }
}

export default async function PaperDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const paperRes = await getPaperById(id);

    const paper = paperRes.success ? paperRes.data : null;

    if (!paper) notFound();

    // Redirect to the new SEO-friendly URL
    const volume = `volume${paper.volume_number}`;
    const issue = `issue${paper.issue_number}`;
    const paperId = paper.paper_id;
    
    redirect(`/archives/${volume}/${issue}/${paperId}`);
}

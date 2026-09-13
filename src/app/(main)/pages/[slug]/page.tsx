import { permanentRedirect, notFound } from "next/navigation";
import type { Metadata } from "next";

const SLUG_REDIRECTS: Record<string, string> = {
    "aims-scope": "/aims-scope",
    "copyright-policy": "/copyright-policy",
    "licensing-policy": "/licensing-policy",
    "apc-fees": "/apc-fees",
    "plagiarism-policy": "/plagiarism-policy",
    "conflict-of-interest": "/conflict-of-interest",
    "research-misconduct": "/research-misconduct",
    "corrections-retractions": "/corrections-retractions",
    "archiving-policy": "/archiving-policy",
    "ai-policy": "/ai-policy",
    "publisher-info": "/publisher-info",
    "open-access-policy": "/open-access",
    "open-access": "/open-access",
    "ethics-and-malpractice": "/ethics",
    "ethics": "/ethics",
    "peer-review-process": "/peer-review",
    "peer-review": "/peer-review",
    "author-guidelines": "/guidelines",
    "guidelines": "/guidelines",
};

export async function generateStaticParams() {
    return Object.keys(SLUG_REDIRECTS).map((slug) => ({ slug }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const { slug } = await params;
    const target = SLUG_REDIRECTS[slug.trim().toLowerCase()];
    if (!target) return { title: "Page Not Found" };
    return {
        alternates: {
            canonical: target,
        },
    };
}

export default async function LegacyStaticPageRedirect({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;
    const cleanSlug = slug.trim().toLowerCase();
    const destination = SLUG_REDIRECTS[cleanSlug];

    if (destination) {
        permanentRedirect(destination);
    }

    notFound();
}

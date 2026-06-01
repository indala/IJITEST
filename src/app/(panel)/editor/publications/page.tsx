"use client";

export const metadata = {
    title: "Publications | IJITEST",
};

import { PublicationsRegistry } from '@/features/publications/components/PublicationsRegistry';

export default function EditorPublicationsPage() {
    return <PublicationsRegistry role="editor" />;
}

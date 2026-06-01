"use client";

export const metadata = {
    title: "Publications | IJITEST",
};

import { PublicationsRegistry } from '@/features/publications/components/PublicationsRegistry';

export default function AdminPublicationsPage() {
    return <PublicationsRegistry role="admin" />;
}

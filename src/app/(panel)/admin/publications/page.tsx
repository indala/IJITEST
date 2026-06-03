import { PublicationsRegistry } from '@/features/publications/components/PublicationsRegistry';

export const metadata = {
    title: "Publications | IJITEST",
};

export default function AdminPublicationsPage() {
    return <PublicationsRegistry role="admin" />;
}

import { PublicationsRegistry } from '@/features/publications/components/PublicationsRegistry';

export const metadata = {
    title: "Publications Registry",
};

export default function AdminPublicationsPage() {
    return <PublicationsRegistry role="admin" />;
}

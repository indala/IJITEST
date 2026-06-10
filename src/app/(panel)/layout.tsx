import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PanelShell } from './PanelShell';
import AuthProvider from '@/components/providers/AuthProvider';

export default async function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) ?? null;

    return (
        <AuthProvider session={session}>
            <PanelShell session={session}>{children}</PanelShell>
        </AuthProvider>
    );
}

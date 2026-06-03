import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PanelShell } from './PanelShell';

export default async function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) ?? null;

    return <PanelShell session={session}>{children}</PanelShell>;
}

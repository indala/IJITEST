import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { PanelShell } from './PanelShell';
import AuthProvider from '@/components/providers/AuthProvider';
import SocketProvider from '@/components/providers/SocketProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    robots: 'noindex',
};

function PanelShellFallback() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin opacity-20" />
            <p className="text-[10px] font-semibold capitalize tracking-widest animate-pulse">Initializing panel clearance...</p>
        </div>
    );
}

async function PanelLayoutContent({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getServerSession(authOptions) ?? null;

    return (
        <AuthProvider session={session}>
            <SocketProvider>
                <PanelShell session={session}>{children}</PanelShell>
            </SocketProvider>
        </AuthProvider>
    );
}

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <Suspense fallback={<PanelShellFallback />}>
            <PanelLayoutContent>{children}</PanelLayoutContent>
        </Suspense>
    );
}

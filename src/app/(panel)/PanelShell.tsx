"use client";

import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sidebarItems, getFullHref } from '@/lib/navigation';
import { updateUserLastActive } from '@/actions/users';
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PanelSidebar } from './_components/PanelSidebar';
import { PanelHeader } from './_components/PanelHeader';

import type { Session } from 'next-auth';

interface PanelShellProps {
    children: React.ReactNode;
    session: Session | null;
}

export function PanelShell({ children, session }: PanelShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { status } = useSession();
    const queryClient = useQueryClient();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.replace('/login');
        }
    }, [status, router]);

    const user = session?.user ?? null;
    const role = user?.role ?? 'reviewer';

    // Track user active status
    useEffect(() => {
        if (!user?.id || status !== 'authenticated') return;

        const updateActivity = () => {
            if (document.visibilityState === 'visible' && status === 'authenticated') {
                void updateUserLastActive();
            }
        };

        updateActivity();
        document.addEventListener('visibilitychange', updateActivity);
        const interval = setInterval(updateActivity, 5 * 60 * 1000);

        return () => {
            document.removeEventListener('visibilitychange', updateActivity);
            clearInterval(interval);
        };
    }, [user?.id, status]);

    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    const handleLogout = async () => {
        queryClient.clear();
        await signOut({ redirect: false });
        router.replace('/login');
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="panel-shell flex min-h-screen bg-muted/30 w-full transition-colors duration-500">
                <PanelSidebar
                    pathname={pathname}
                    user={user}
                    filteredItems={filteredItems}
                    handleLogout={handleLogout}
                />

                <SidebarInset className="flex flex-col min-w-0 bg-transparent">
                    <PanelHeader
                        filteredItems={filteredItems}
                        pathname={pathname}
                        user={user}
                        handleLogout={handleLogout}
                    />

                    <section className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5 max-w-7xl mx-auto w-full space-y-4">
                        {children}
                    </section>
                </SidebarInset>

            </div>
        </SidebarProvider>
    );
}
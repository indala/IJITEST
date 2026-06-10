"use client";

import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useEffect } from 'react';
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

    const user = session?.user ?? null;
    const role = user?.role ?? 'reviewer';

    // Track user active status
    useEffect(() => {
        if (!user?.id) return;

        const updateActivity = () => {
            if (document.visibilityState === 'visible') {
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
    }, [user?.id]);

    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <SidebarProvider defaultOpen={true}>
            <div className="flex min-h-screen bg-muted/30 w-full transition-colors duration-500">
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

                    <section className="p-3 lg:p-6 2xl:p-8 max-w-screen-2xl 2xl:max-w-[1600px] mx-auto w-full transition-all duration-500">
                        {children}
                    </section>
                </SidebarInset>

            </div>
        </SidebarProvider>
    );
}

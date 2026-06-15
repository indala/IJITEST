"use client";

import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { sidebarItems, getFullHref } from '@/lib/navigation';
import { updateUserLastActive } from '@/actions/users';

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PanelSidebar } from './_components/PanelSidebar';
import { PanelHeader } from './_components/PanelHeader';
import { NotificationBanner } from '@/components/panels/NotificationBanner';

import type { Session } from 'next-auth';

interface PanelShellProps {
    children: React.ReactNode;
    session: Session | null;
}

export function PanelShell({ children, session }: PanelShellProps) {
    const pathname = usePathname();
    const queryClient = useQueryClient();

    const user = session?.user ?? null;
    const role = user?.role ?? 'reviewer';

    // Track user active status
    useEffect(() => {
        if (!user?.id) return;

        const updateActivity = async () => {
            if (document.visibilityState === 'visible') {
                try {
                    await updateUserLastActive();
                } catch (err) {
                    console.warn("Failed to update active status:", err);
                }
            }
        };

        void updateActivity();
        document.addEventListener('visibilitychange', updateActivity);
        const interval = setInterval(updateActivity, 5 * 60 * 1000);

        return () => {
            document.removeEventListener('visibilitychange', updateActivity);
            clearInterval(interval);
        };
    }, [user?.id]);

    // Handle bfcache restoration by forcing a page reload, triggering server-side proxy.ts redirects if the session is gone
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                window.location.reload();
            }
        };
        window.addEventListener('pageshow', handlePageShow);
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
        };
    }, []);

    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    const handleLogout = async () => {
        queryClient.clear();

        try {
            if (typeof window !== "undefined" && "serviceWorker" in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    const { deletePushSubscription } = await import('@/actions/push');
                    await deletePushSubscription(subscription.endpoint);
                    await subscription.unsubscribe();
                }
            }
        } catch (error) {
            console.warn("Failed to delete push subscription on logout:", error);
        }

        await signOut({ callbackUrl: '/login' });
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
                <NotificationBanner />
            </div>
        </SidebarProvider>
    );
}

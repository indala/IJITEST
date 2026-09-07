import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import NotificationCenter from '@/features/shared/components/NotificationCenter';
import { UserNav } from './UserNav';

import type { Session } from "next-auth";

interface PanelHeaderProps {
    filteredItems: { name: string; fullHref: string; [key: string]: unknown }[];
    pathname: string;
    user: Session['user'] | null;
    handleLogout: () => Promise<void>;
}

export function PanelHeader({
    filteredItems,
    pathname,
    user,
    handleLogout,
}: PanelHeaderProps) {
    const activeItem = filteredItems.find(i => pathname === i.fullHref);

    return (
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/70 flex items-center justify-between px-4 sm:px-6 h-16 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="lg:hidden h-10 w-10 cursor-pointer text-primary" />
                <div className="flex flex-col">
                    <h1 className="panel-title text-lg sm:text-xl font-bold tracking-tight text-foreground m-0">
                        {activeItem?.name || 'Overview'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <NotificationCenter />
                <Separator orientation="vertical" className="mx-2 h-6 hidden sm:block bg-primary/10" />
                <UserNav
                    user={user}
                    handleLogout={handleLogout}
                />
            </div>
        </header>
    );
}

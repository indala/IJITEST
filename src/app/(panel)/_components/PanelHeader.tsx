import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator";
import NotificationCenter from '@/features/notifications/components/NotificationCenter';
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
    const activeItem = filteredItems.find(i => 
        pathname === i.fullHref || 
        (i.fullHref !== '/author' && i.fullHref !== '/editor' && i.fullHref !== '/reviewer' && i.fullHref !== '/admin' && pathname.startsWith(i.fullHref + '/'))
    );

    return (
        <header className="bg-background/95 backdrop-blur-sm border-b border-border/70 flex items-center justify-between px-3 sm:px-6 2xl:px-8 h-14 sm:h-16 2xl:h-20 sticky top-0 z-30 transition-colors">
            <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                <SidebarTrigger className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 cursor-pointer text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                    <h1 className="text-base sm:text-xl 2xl:text-2xl font-bold tracking-tight text-primary truncate max-w-[190px] sm:max-w-none m-0">
                        {activeItem?.name || 'Overview'}
                    </h1>
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <NotificationCenter />
                <Separator orientation="vertical" className="mx-1 sm:mx-2 h-5 sm:h-6 hidden sm:block bg-primary/10" />
                <UserNav
                    user={user}
                    handleLogout={handleLogout}
                />
            </div>
        </header>
    );
}

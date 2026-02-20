"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LogOut,
    ChevronRight,
    Menu,
    X,
    User,
    Settings,
    Bell,
    Layers
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { getSession } from '@/actions/session';
import { useState, useEffect } from 'react';
import { sidebarItems, getFullHref } from '@/lib/navigation';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function PanelLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        async function loadSession() {
            const session = await getSession();
            if (!session) {
                router.push('/login');
                return;
            }
            setUser(session);
        }
        loadSession();
    }, []);

    // Don't show sidebar for login page
    if (pathname === '/login') return <>{children}</>;

    const role = user?.role || 'reviewer';

    const filteredItems = sidebarItems.filter(item =>
        item.roles.includes(role)
    ).map(item => ({
        ...item,
        fullHref: getFullHref(item, role)
    }));

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-muted/30 flex">
                <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMobileMenuOpen(false)} />

                <aside className={`w-64 bg-background border-r border-border flex flex-col fixed lg:sticky top-0 h-screen z-50 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-border">
                        <Link href="/admin" className="flex items-center gap-2 group">
                            <div className="bg-primary w-8 h-8 rounded-lg flex items-center justify-center shadow-md shadow-primary/10 group-hover:scale-105 transition-transform">
                                <Layers className="w-5 h-5 text-white stroke-[2.5]" />
                            </div>
                            <div>
                                <h2 className="font-black text-foreground text-base leading-none tracking-tight">IJITEST</h2>
                                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Panel</span>
                            </div>
                        </Link>
                        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden h-8 w-8">
                            <X className="w-4 h-4" />
                        </Button>
                    </div>

                    <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto mt-2">
                        {filteredItems.map((item: any) => {
                            const isActive = pathname === item.fullHref;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.fullHref}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg group transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-primary text-white' : 'bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground'
                                            }`}>
                                            {item.icon}
                                        </div>
                                        <span className="font-bold text-xs tracking-tight">
                                            {item.labelOverrides?.[user?.role || ''] || item.name}
                                        </span>
                                    </div>
                                    <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isActive ? 'translate-x-0' : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-3 border-t border-border mt-auto">
                        <Button
                            variant="destructive"
                            className="w-full justify-start gap-3 h-10 px-3 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white rounded-lg transition-all border-none font-bold"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-xs">Log Out</span>
                        </Button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0">
                    <header className="bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 lg:px-8 h-16 sticky top-0 z-30">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden h-9 w-9">
                                <Menu className="w-5 h-5" />
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-black text-foreground uppercase tracking-widest hidden sm:block">
                                    {filteredItems.find(i => pathname === i.fullHref)?.name || 'Dashboard'}
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                                        <Bell className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Notifications</TooltipContent>
                            </Tooltip>

                            <Separator orientation="vertical" className="mx-1 h-6 hidden sm:block" />

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-10 px-2 gap-2 hover:bg-muted rounded-lg outline-none">
                                        <div className="text-right hidden sm:block mr-1">
                                            <p className="text-[11px] font-black text-foreground leading-none mb-1">{user?.fullName || 'Loading...'}</p>
                                            <p className="text-[9px] font-bold text-primary uppercase tracking-tighter leading-none">{user?.role || 'Staff'}</p>
                                        </div>
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src="" />
                                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-black">
                                                {user?.fullName?.charAt(0) || 'J'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-xl p-1 shadow-xl">
                                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground font-black px-2 py-1.5">My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer">
                                        <User className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-bold">Profile Settings</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer">
                                        <Settings className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-xs font-bold">Preferences</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="rounded-lg h-9 gap-3 cursor-pointer text-destructive focus:bg-destructive focus:text-white" onClick={handleLogout}>
                                        <LogOut className="w-4 h-4" />
                                        <span className="text-xs font-bold">Sign Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </header>

                    <div className="p-4 lg:p-8 max-w-screen-2xl mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
        </TooltipProvider>
    );
}

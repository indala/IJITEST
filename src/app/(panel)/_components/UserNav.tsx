"use client";

import Link from 'next/link';
import { LogOut, User as UserIcon } from 'lucide-react';
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

import type { Session } from "next-auth";

interface UserNavProps {
    user: Session['user'] | null;
    handleLogout: () => Promise<void>;
}

export function UserNav({ user, handleLogout }: UserNavProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-10 px-2.5 gap-3 hover:bg-muted rounded-lg outline-none transition-all group cursor-pointer">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-semibold text-foreground leading-none mb-1 capitalize group-hover:text-primary transition-colors">{user?.name || 'Loading...'}</p>
                        <p className="text-[10px] font-medium text-muted-foreground tracking-wider leading-none capitalize">{user?.role || 'Staff'}</p>
                    </div>
                    <Avatar className="size-8 2xl:size-12 border border-primary/20 shadow-xs">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {user?.name?.charAt(0) || 'J'}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-1.5 shadow-xl border-border/50">
                <DropdownMenuLabel className="text-xs text-muted-foreground font-semibold px-3 py-2 capitalize">Account Operations</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/40" />
                <Link className="cursor-pointer" href={`/${user?.role || 'reviewer'}/profile`}>
                    <DropdownMenuItem className="rounded-lg h-9 gap-2.5 cursor-pointer px-3 font-medium text-xs sm:text-sm hover:bg-primary/10 transition-colors">
                        <UserIcon className="w-4 h-4 text-primary" />
                        <span>Profile settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-border/40" />
                <DropdownMenuItem className="rounded-lg h-9 gap-2.5 cursor-pointer text-destructive focus:bg-destructive focus:text-white px-3 font-medium text-xs sm:text-sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

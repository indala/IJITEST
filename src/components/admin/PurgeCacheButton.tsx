'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { purgeAllSystemCaches } from "@/actions/cache";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PurgeCacheButtonProps {
    variant?: "header" | "card" | "outline";
    className?: string;
}

export default function PurgeCacheButton({ variant = "header", className }: PurgeCacheButtonProps) {
    const [isLoading, setIsLoading] = useState(false);
    const queryClient = useQueryClient();
    const router = useRouter();

    const handlePurge = async () => {
        setIsLoading(true);
        const toastId = toast.loading("Purging all Next.js data caches and route trees...");
        try {
            const res = await purgeAllSystemCaches();
            if (res.success) {
                // Clear client-side React Query cache so active pages refetch fresh data
                await queryClient.clear();
                await queryClient.invalidateQueries();

                // Force Next.js client router refresh
                router.refresh();

                toast.success(
                    `Cache purged successfully! (${res.data?.purgedTagsCount ?? 'All'} tags & routes re-synced)`,
                    { id: toastId }
                );
            } else {
                toast.error(res.error || "Failed to purge caches", { id: toastId });
            }
        } catch (err) {
            console.error("Purge cache error:", err);
            toast.error("Failed to purge system caches", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    if (variant === "card") {
        return (
            <Button
                type="button"
                onClick={handlePurge}
                disabled={isLoading}
                className={className || "h-10 px-4 gap-2 bg-primary text-white font-semibold rounded-xl hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"}
            >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>{isLoading ? "Purging Caches..." : "Purge All System Caches"}</span>
            </Button>
        );
    }

    return (
        <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handlePurge}
            disabled={isLoading}
            className={`h-9 px-2.5 sm:px-3 gap-1.5 text-xs font-semibold rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/50 cursor-pointer transition-all ${className || ''}`}
            title="Purge all Next.js & system caches (after direct DB changes)"
        >
            {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
            ) : (
                <RefreshCw className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="hidden md:inline">
                {isLoading ? "Purging..." : "Purge Cache"}
            </span>
        </Button>
    );
}

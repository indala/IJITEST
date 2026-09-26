"use client"

import { Search, Inbox, CheckCircle, Archive, LayoutGrid } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import type { ContactStatus } from "@/db/types"

export type InboxFilterTab = "all" | ContactStatus

interface InboxFiltersProps {
    status: InboxFilterTab
    search: string
    onStatusChange: (status: InboxFilterTab) => void
    onSearchChange: (search: string) => void
    counts: Record<InboxFilterTab, number>
}

export function InboxFilters({
    status,
    search,
    onStatusChange,
    onSearchChange,
    counts
}: InboxFiltersProps) {
    const tabs: Array<{ id: InboxFilterTab; label: string; icon: typeof LayoutGrid; count: number; color?: string }> = [
        { id: "all", label: "all", icon: LayoutGrid, count: counts.all },
        { id: "pending", label: "pending", icon: Inbox, count: counts.pending, color: "bg-amber-500" },
        { id: "resolved", label: "resolved", icon: CheckCircle, count: counts.resolved, color: "bg-emerald-600" },
        { id: "archived", label: "archived", icon: Archive, count: counts.archived, color: "bg-slate-500" },
    ]

    return (
        <div className="flex w-full flex-col gap-2 rounded-xl border border-border bg-muted/10 p-1.5 sm:p-2 md:flex-row md:items-center md:justify-between md:gap-3">
            <div className="grid w-full grid-cols-4 items-center gap-1 md:flex md:w-auto">
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = status === tab.id
                    
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onStatusChange(tab.id)}
                            aria-label={`${tab.label} messages, ${tab.count}`}
                            aria-pressed={isActive}
                            className={cn(
                                "flex min-w-0 items-center justify-center gap-1.5 rounded-lg px-1.5 py-2 transition-all duration-200 group text-body-sm whitespace-nowrap md:justify-start md:px-3 md:py-1.5",
                                isActive
                                    ? "bg-primary text-white font-bold shadow-sm"
                                    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn(
                                "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                                isActive ? "text-current" : "text-muted-foreground"
                            )} />
                            <span className="sr-only md:not-sr-only md:lowercase">{tab.label}</span>
                            <span className={cn(
                                "ml-0.5 min-w-6 rounded-md px-1.5 py-0.5 text-center text-caption font-semibold tabular-nums md:ml-1",
                                isActive
                                    ? "bg-white/20 text-white"
                                    : "border border-border bg-background text-foreground"
                            )}>
                                {tab.count}
                            </span>
                        </button>
                    )
                })}
            </div>

            <div className="relative w-full md:max-w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                    placeholder="search messages" 
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    aria-label="Search messages"
                    className="h-10 rounded-lg border-border bg-background pl-9 text-body-sm placeholder:text-muted-foreground focus:border-primary/50 transition-colors md:h-9"
                />
            </div>
        </div>
    )
}

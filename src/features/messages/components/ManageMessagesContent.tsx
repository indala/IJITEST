"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { InboxFilters } from "./InboxFilters"
import { MessageList } from "./MessageList"
import { MessageDetail } from "./MessageDetail"
import { useMessages } from "@/hooks/queries/useMessages"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function ManageMessagesContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const pathname = usePathname()

    const activeStatus = searchParams.get('status') || 'all'
    const queryStatus = activeStatus === 'all' ? undefined : (activeStatus as 'pending' | 'resolved' | 'archived')
    const search = searchParams.get('search') || ""

    const { data: messages = [], isLoading } = useMessages({ search })

    const [selectedMessage, setSelectedMessage] = useState<any>(null)

    // Sync selected message with latest data from list
    useEffect(() => {
        if (selectedMessage) {
            const updated = messages.find(m => m.id === selectedMessage.id)
            if (updated) setSelectedMessage(updated)
        }
    }, [messages, selectedMessage?.id])

    const messagesData = messages || []

    const counts = useMemo(() => ({
        all: messagesData.length,
        pending: messagesData.filter(m => m.status === 'pending').length,
        resolved: messagesData.filter(m => m.status === 'resolved').length,
        archived: messagesData.filter(m => m.status === 'archived').length
    }), [messagesData])

    const filteredMessages = useMemo(() => {
        if (activeStatus === 'all') return messagesData
        return messagesData.filter(m => m.status === activeStatus)
    }, [messagesData, activeStatus])

    const updateFilters = useCallback((newFilters: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(newFilters).forEach(([key, value]) => {
            if (value === 'all' || !value) params.delete(key)
            else params.set(key, value)
        })
        router.push(`${pathname}?${params.toString()}`)
    }, [searchParams, pathname, router])

    const handleSelectMessage = useCallback((message: any) => {
        setSelectedMessage(message)
    }, [])

    return (
        <div className="flex-1 flex flex-col lg:flex-row gap-2 overflow-hidden min-h-0">
            {/* Main Content Pane */}
            <section className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative">
                {/* Horizontal Filters at Top */}
                <div className="p-1 border-b border-white/5 bg-muted/5">
                    <InboxFilters 
                        status={activeStatus}
                        search={search}
                        onStatusChange={(s) => updateFilters({ status: s })}
                        onSearchChange={(s) => updateFilters({ search: s })}
                        counts={counts}
                    />
                </div>

                <div className="flex-1 min-h-0 relative">
                    <MessageList 
                        messages={filteredMessages}
                        loading={isLoading}
                        selectedId={selectedMessage?.id}
                        onSelect={handleSelectMessage}
                    />
                </div>
            </section>

            {/* Right: Message Detail Detail (Desktop/Large) */}
            <section className="hidden lg:block w-[360px] xl:w-[400px] 2xl:w-[480px] shrink-0 bg-card rounded-2xl border border-white/5 shadow-inner overflow-hidden relative">
                <MessageDetail 
                    message={selectedMessage}
                />
            </section>

            {/* Mobile Overlay: Detail Pane (Full Screen Dialog ideally, handled here via absolute UI for simplicity) */}
            {selectedMessage && (
                <div className="lg:hidden fixed inset-0 z-50 bg-background animate-in slide-in-from-bottom duration-500 flex flex-col">
                    <div className="absolute top-4 left-4 z-50">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setSelectedMessage(null)}
                            className="w-10 h-10 bg-muted/50 rounded-xl"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                    <div className="flex-1 min-h-0 pt-16">
                        <MessageDetail 
                            message={selectedMessage}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

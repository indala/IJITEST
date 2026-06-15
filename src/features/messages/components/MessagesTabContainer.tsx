"use client";

import dynamic from 'next/dynamic';
import { useState } from "react";
import { useSocket } from "@/components/providers/SocketProvider";
import { useQuery } from "@tanstack/react-query";
import { getNotificationCounts } from "@/actions/notifications";
import { useSession } from "next-auth/react";

const ManageMessagesContent = dynamic(() => import("@/features/messages/components/ManageMessagesContent").then(m => m.ManageMessagesContent), { ssr: false });
const LiveChatContent = dynamic(() => import("@/features/chat/components/LiveChatContent").then(m => m.LiveChatContent), { ssr: false });
import { MessageSquare, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagesTabContainerProps {
    defaultTab?: 'inquiry' | 'chat';
}

export function MessagesTabContainer({ defaultTab = 'inquiry' }: MessagesTabContainerProps) {
    const [activeTab, setActiveTab] = useState<'inquiry' | 'chat'>(defaultTab);
    const { data: session } = useSession();
    const { unreadCount } = useSocket();

    const { data: counts = { messages: 0, submissions: 0 } } = useQuery({
        queryKey: ['notificationCounts'],
        queryFn: getNotificationCounts,
        enabled: !!session?.user,
        select: (res) => res.success ? res.data : { messages: 0, submissions: 0 },
        refetchInterval: 30000, 
        staleTime: 30000,
    });

    const inquiryUnread = counts.messages;

    return (
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Sleek Custom Tab Switcher */}
            <div className="flex gap-2 p-1.5 bg-slate-900/10 rounded-2xl w-fit mb-4 border border-white/5">
                <button
                    onClick={() => setActiveTab('inquiry')}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer",
                        activeTab === 'inquiry'
                            ? "bg-card text-foreground shadow-lg shadow-black/10 border border-white/5"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 border border-transparent"
                    )}
                >
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    <span>Inquiry Messages</span>
                    {inquiryUnread > 0 && (
                        <span className="ml-2 bg-secondary text-secondary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none">
                            {inquiryUnread}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('chat')}
                    className={cn(
                        "flex items-center gap-2 px-5 py-2 text-xs font-bold tracking-widest uppercase rounded-xl transition-all duration-300 cursor-pointer",
                        activeTab === 'chat'
                            ? "bg-card text-foreground shadow-lg shadow-black/10 border border-white/5"
                            : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/10 border border-transparent"
                    )}
                >
                    <MessageCircle className="w-3.5 h-3.5 text-primary" />
                    <span>Live Chat</span>
                    {unreadCount > 0 && (
                        <span className="ml-2 bg-secondary text-secondary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-4 text-center leading-none animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {activeTab === 'inquiry' ? (
                    <ManageMessagesContent />
                ) : (
                    <LiveChatContent />
                )}
            </div>
        </div>
    );
}

"use client";

import dynamic from 'next/dynamic';
import { useState } from "react";

const ManageMessagesContent = dynamic(() => import("@/features/messages/components/ManageMessagesContent").then(m => m.ManageMessagesContent), { ssr: false });
const LiveChatContent = dynamic(() => import("@/features/chat/components/LiveChatContent").then(m => m.LiveChatContent), { ssr: false });
import { MessageSquare, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessagesTabContainerProps {
    defaultTab?: 'inquiry' | 'chat';
}

export function MessagesTabContainer({ defaultTab = 'inquiry' }: MessagesTabContainerProps) {
    const [activeTab, setActiveTab] = useState<'inquiry' | 'chat'>(defaultTab);

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
                    Inquiry Messages
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
                    Live Chat
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

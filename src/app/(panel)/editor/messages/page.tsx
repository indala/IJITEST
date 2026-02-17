"use client";

import { MessageSquare, Mail, Calendar, CheckCircle, Eye, Archive, Trash2, User, Clock, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { getMessages, updateMessageStatus } from '@/actions/messages';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Messages() {
    const [messages, setMessages] = useState<any[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        const data = await getMessages();
        setMessages(data);
        setLoading(false);
    }

    async function handleStatusChange(id: number, status: string) {
        await updateMessageStatus(id, status);
        if (selectedMessage?.id === id) {
            setSelectedMessage({ ...selectedMessage, status });
        }
        fetchData();
    }

    if (loading) return <div className="p-20 text-center font-black text-muted-foreground uppercase tracking-widest text-xs animate-pulse italic">Synchronizing with Messaging Node...</div>;

    const unreadCount = messages.filter(m => m.status === 'unread').length;

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col lg:flex-row gap-6 pb-6">
            {/* Sidebar List */}
            <Card className="lg:w-80 flex flex-col border-border/50 shadow-sm overflow-hidden bg-background shrink-0">
                <CardHeader className="p-4 bg-muted/20 border-b border-border/50 space-y-1">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-black text-foreground uppercase tracking-widest">Inbox</CardTitle>
                        {unreadCount > 0 && (
                            <Badge className="h-5 px-1.5 bg-primary text-white text-[9px] font-black border-none animate-pulse">
                                {unreadCount} New
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="text-[10px] font-medium text-muted-foreground uppercase tracking-tighter">Editorial inquiries queue</CardDescription>
                </CardHeader>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-border/30">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                onClick={() => {
                                    setSelectedMessage(m);
                                    if (m.status === 'unread') handleStatusChange(m.id, 'read');
                                }}
                                className={`p-4 cursor-pointer transition-all hover:bg-muted/50 relative overflow-hidden group ${selectedMessage?.id === m.id ? 'bg-primary/5' : ''}`}
                            >
                                {selectedMessage?.id === m.id && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                                )}
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter truncate max-w-[120px]">
                                        {m.subject || 'Editorial Inquiry'}
                                    </span>
                                    <span className="text-[8px] font-bold text-muted-foreground opacity-50">
                                        {new Date(m.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className={`text-[11px] tracking-tight mb-0.5 truncate ${m.status === 'unread' ? 'font-black text-foreground' : 'font-bold text-muted-foreground'}`}>
                                    {m.name}
                                </h3>
                                <p className="text-[10px] text-muted-foreground line-clamp-1 italic font-medium opacity-70">
                                    {m.message}
                                </p>
                            </div>
                        ))}
                    </div>
                    {messages.length === 0 && (
                        <div className="p-12 text-center space-y-3">
                            <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Node isolated</p>
                        </div>
                    )}
                </ScrollArea>
            </Card>

            {/* Message Detail */}
            <Card className="flex-1 border-border/50 shadow-sm flex flex-col overflow-hidden bg-background">
                {selectedMessage ? (
                    <>
                        <CardHeader className="p-6 bg-muted/20 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
                                    <User className="w-6 h-6 text-primary/40" />
                                </div>
                                <div className="space-y-0.5">
                                    <h2 className="text-base font-black text-foreground tracking-tight">{selectedMessage.name}</h2>
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedMessage.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                                    className={`h-9 w-9 rounded-lg border-border/50 ${selectedMessage.status === 'archived' ? 'bg-orange-500/10 text-orange-600' : 'text-muted-foreground hover:text-orange-600'}`}
                                    title={selectedMessage.status === 'archived' ? "Unarchive" : "Archive"}
                                >
                                    <Archive className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-9 w-9 rounded-lg border-border/50 text-muted-foreground hover:text-red-600"
                                    title="Move to Trash"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-1 px-8 py-6">
                            <div className="space-y-8 max-w-3xl mx-auto">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60">
                                        <AlertCircle className="w-3.5 h-3.5" /> Core Content
                                    </div>
                                    <Card className="border-border/30 bg-muted/5 shadow-none overflow-hidden rounded-2xl">
                                        <CardContent className="p-6">
                                            <div className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-wrap selection-bg-primary/20">
                                                {selectedMessage.message}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                <div className="flex flex-wrap items-center gap-8 py-4 px-6 bg-muted/20 rounded-xl border border-border/30">
                                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        <Calendar className="w-3.5 h-3.5 opacity-50" />
                                        <span>Timestamp: {new Date(selectedMessage.created_at).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                                        <Clock className="w-3.5 h-3.5 opacity-50" />
                                        <span>State: <Badge variant="secondary" className="h-4 px-1 text-[8px] bg-primary/10 text-primary border-none">{selectedMessage.status}</Badge></span>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>
                        <div className="p-6 border-t border-border/50 bg-muted/5 flex justify-end">
                            <Button className="h-10 px-6 gap-2 font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-primary/20 rounded-lg">
                                <Send className="w-4 h-4" /> Compose Reply
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                            <Eye className="w-8 h-8 text-muted-foreground/20" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">Feed Standby</h3>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest italic max-w-xs mx-auto">Click any transmission record to inspect the payload and respond from this interface.</p>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}

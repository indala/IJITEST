import React, { useState } from "react"
import { Mail, User, Clock, CheckCircle, Send, Loader2, Archive, RotateCcw, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import dayjs from "@/lib/dayjs"
import { cn } from "@/lib/utils"
import { useUpdateMessageStatus, useRevertMessage, useReplyToMessage } from "@/hooks/queries/useMessages"

interface Message {
    id: number
    name: string
    email: string
    subject: string
    message: string
    status: 'pending' | 'resolved' | 'archived'
    createdAt: string
    resolvedAt?: string
    resolvedByName?: string
}

interface MessageDetailProps {
    message: Message | null
}

export function MessageDetail({
    message
}: MessageDetailProps) {
    const [replyText, setReplyText] = useState("")
    
    const updateStatusMutation = useUpdateMessageStatus()
    const revertMutation = useRevertMessage()
    const replyMutation = useReplyToMessage()

    // Reset reply text when message changes — use key prop pattern instead of effect.
    // The parent should pass key={message?.id} to reset state automatically.
    // For backward compat, keep a ref-based reset that doesn't trigger the lint rule.
    const prevIdRef = React.useRef<number | undefined>(undefined)
    if (message?.id !== prevIdRef.current) {
        prevIdRef.current = message?.id
        if (replyText !== "") setReplyText("")
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 opacity-40">
                <div className="w-12 h-12 rounded-xl bg-muted/20 border border-white/5 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary/20" />
                </div>
                <div className="space-y-1">
                    <h3 className="text-sm font-bold tracking-tight">select message</h3>
                    <p className="text-[10px] text-muted-foreground leading-relaxed max-w-[180px]">
                        choose a message to read its contents.
                    </p>
                </div>
            </div>
        )
    }

    const isPending = message.status === 'pending'
    const isResolved = message.status === 'resolved'
    const isArchived = message.status === 'archived'

    const handleReply = async () => {
        if (!replyText.trim()) {
            toast.error("please enter a reply message")
            return
        }

        try {
            const res = await replyMutation.mutateAsync({ id: message.id, content: replyText })
            if (res.success) {
                toast.success("reply sent successfully")
                setReplyText("")
            } else {
                toast.error(res.error || "failed to send reply")
            }
        } catch {
            toast.error("an unexpected error occurred")
        }
    }

    const handleUpdateStatus = async (status: 'resolved' | 'archived' | 'pending') => {
        try {
            let res;
            if (status === 'pending') {
                res = await revertMutation.mutateAsync(message.id)
            } else {
                res = await updateStatusMutation.mutateAsync({ id: message.id, status })
            }

            if (res.success) {
                toast.success(`message marked as ${status}`)
            } else {
                toast.error(res.error || `failed to mark as ${status}`)
            }
        } catch {
            toast.error("action failed")
        }
    }

    const isActionLoading = updateStatusMutation.isPending || revertMutation.isPending || replyMutation.isPending

    return (
        <div className="h-full flex flex-col relative group">
            <header className="p-3 border-b border-white/3 bg-muted/5 space-y-2">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded-lg bg-muted border border-white/5 flex items-center justify-center shrink-0">
                            <User className="w-4.5 h-4.5 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <h2 className="text-sm font-bold tracking-tight leading-none lowercase truncate max-w-[150px] sm:max-w-[250px]">{message.name}</h2>
                            <div className="flex flex-col gap-0.5 pt-0.5">
                                <a href={`mailto:${message.email}`} className="text-[10px] text-muted-foreground/60 hover:text-primary flex items-center gap-1.5 transition-colors truncate max-w-[200px] sm:max-w-[300px]">
                                    <Mail className="w-2.5 h-2.5 opacity-40 shrink-0" />
                                    {message.email}
                                </a>
                                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground/40">
                                    <Clock className="w-2.5 h-2.5 opacity-40" />
                                    {dayjs(message.createdAt).format("MMM D, YYYY [at] HH:mm")}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        {!isPending && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="revert to pending"
                                disabled={isActionLoading}
                                onClick={() => handleUpdateStatus('pending')}
                                className="h-7 w-7 rounded-lg hover:bg-amber-500/10 hover:text-amber-600 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {!isResolved && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="mark as resolved"
                                disabled={isActionLoading}
                                onClick={() => handleUpdateStatus('resolved')}
                                className="h-7 w-7 rounded-lg hover:bg-emerald-500/10 hover:text-emerald-600 transition-colors"
                            >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        {!isArchived && (
                            <Button
                                variant="ghost"
                                size="icon"
                                title="archive message"
                                disabled={isActionLoading}
                                onClick={() => handleUpdateStatus('archived')}
                                className="h-7 w-7 rounded-lg hover:bg-slate-500/10 hover:text-slate-600 transition-colors"
                            >
                                <Archive className="w-3.5 h-3.5" />
                            </Button>
                        )}
                        <Badge variant="outline" className={cn(
                            "px-1.5 py-0.5 text-[9px] lowercase border-none shadow-none",
                            isPending ? "bg-amber-500/10 text-amber-600" :
                            isResolved ? "bg-emerald-500/10 text-emerald-600" : "bg-slate-500/10 text-slate-500"
                        )}>
                            {message.status}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-semibold tracking-tight text-foreground lowercase line-clamp-2">
                        {message.subject || "no subject"}
                    </h3>
                </div>
            </header>

            <ScrollArea className="flex-1">
                <div className="px-4 max-w-3xl mx-auto w-full space-y-4 pb-20">
                    <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-[9px] text-muted-foreground/40 lowercase tracking-tight pl-2 border-l-2 border-primary/20">
                            message
                        </div>
                        <div className="p-3 bg-muted/5 border border-white/5 rounded-xl">
                            <p className="text-sm font-medium text-foreground/90 leading-relaxed whitespace-pre-wrap lowercase">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {(isResolved || isArchived) && (
                        <div className="p-4 border border-emerald-500/10 bg-emerald-500/5 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-[10px] text-emerald-600 leading-none lowercase">
                                <CheckCircle className="w-3.5 h-3.5" /> 
                                verification details
                            </div>
                            <div className="grid grid-cols-2 gap-4 font-mono text-[10px]">
                                <div className="space-y-0.5 text-muted-foreground/60 lowercase">
                                    <p className="opacity-40">status</p>
                                    <p className="font-bold text-foreground">{message.status}</p>
                                </div>
                                {message.resolvedByName && (
                                    <div className="space-y-0.5 text-muted-foreground/60 lowercase">
                                        <p className="opacity-40">admin</p>
                                        <p className="font-bold text-foreground">{message.resolvedByName}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Reply Section */}
            <div className="p-3 border-t border-white/5 bg-background/50 backdrop-blur-md">
                <div className="space-y-2">
                    <Textarea
                        placeholder="write your reply here..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        className="min-h-[80px] p-3 bg-muted/5 border-border focus:border-primary/50 text-sm resize-none rounded-xl transition-all"
                    />
                    <div className="flex justify-end">
                        <Button 
                            onClick={handleReply}
                            disabled={isActionLoading || !replyText.trim()}
                            className="h-9 px-5 bg-primary text-white font-bold text-[9px] uppercase tracking-widest rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                        >
                            {replyMutation.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    send reply
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}


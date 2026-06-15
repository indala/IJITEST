"use client";

import { useState, useEffect, useRef, useCallback, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import { 
  sendChatMessage, 
  getChatHistory, 
  searchChatUsers
} from "@/actions/chat";
import { useSocket } from "@/components/providers/SocketProvider";
import { 
  type ChatMessageRow, 
  type ChatUser, 
  type UserRole
} from "@/db/types";
import { 
  Send, 
  Search, 
  MessageSquare, 
  Loader2, 
  MessageCircle,
  Hash,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function LiveChatContent() {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const { 
    socket, 
    isConnected, 
    onlineUsers, 
    unreadCountsByPartner, 
    setActiveChatPartnerId,
    clearUnreadCount 
  } = useSocket();

  const [contacts, setContacts] = useState<ChatUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: ChatMessageRow) => {
      if (state.some((m) => m.id === newMessage.id)) return state;
      return [...state, newMessage];
    }
  );
  const [, startTransition] = useTransition();
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [lastMessageTime, setLastMessageTime] = useState<Record<ChatUser['id'], Date | null>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom helper
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, []);

  // Fetch initial contacts list
  const fetchContacts = useCallback(async (query = "") => {
    setIsSearching(true);
    const response = await searchChatUsers(query);
    setIsSearching(false);
    if (response.success && response.data) {
      setContacts(response.data);
      // Initialize lastMessageTime from backend database records
      setLastMessageTime((prev) => {
        const next = { ...prev };
        response.data.forEach((user) => {
          if (user.lastMessageAt) {
            next[user.id] = new Date(user.lastMessageAt);
          }
        });
        return next;
      });
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      queueMicrotask(() => {
        void fetchContacts("");
      });
    }
  }, [currentUserId, fetchContacts]);

  // Handle Search Input Change
  useEffect(() => {
    if (!currentUserId) return;
    const delayDebounce = setTimeout(() => {
      fetchContacts(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, currentUserId, fetchContacts]);

  // Listen for real-time messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (msg: ChatMessageRow) => {
      console.log("Received message via socket:", msg);
      const isFromOrToSelected = selectedUser && 
        (msg.senderId === selectedUser.id || msg.receiverId === selectedUser.id);

      if (isFromOrToSelected) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => scrollToBottom("smooth"), 100);
      }

      // Update last message time for the sender
      setLastMessageTime((prev) => ({
        ...prev,
        [msg.senderId]: msg.createdAt ? new Date(msg.createdAt) : new Date(),
      }));
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [socket, selectedUser, scrollToBottom]);

  // Fetch history when active user changes
  useEffect(() => {
    if (!selectedUser) {
      queueMicrotask(() => {
        setMessages([]);
      });
      setActiveChatPartnerId(null);
      return;
    }

    const targetUserId = selectedUser.id;
    setActiveChatPartnerId(targetUserId);
    clearUnreadCount(targetUserId);

    let isCurrent = true;

    async function fetchHistory() {
      setIsLoadingHistory(true);
      const response = await getChatHistory(targetUserId);
      
      if (!isCurrent) return;

      setIsLoadingHistory(false);
      if (response.success && response.data) {
        setMessages(response.data);
        setTimeout(() => scrollToBottom("auto"), 50);

        // Update last message time from history
        const lastMsg = response.data[response.data.length - 1];
        const createdAt = lastMsg?.createdAt;
        if (createdAt) {
          setLastMessageTime((prev) => ({
            ...prev,
            [targetUserId]: new Date(createdAt),
          }));
        }
      }
    }

    void fetchHistory();

    return () => {
      isCurrent = false;
    };
  }, [selectedUser, scrollToBottom, setActiveChatPartnerId, clearUnreadCount]);

  // Send Message implementation
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim() || !currentUserId) return;

    const textToSend = newMessage.trim();
    setNewMessage("");

    // Create temporary optimistic message
    const tempMsg: ChatMessageRow = {
      id: -Date.now(),
      senderId: currentUserId,
      receiverId: selectedUser.id,
      messageText: textToSend,
      createdAt: new Date(),
      senderName: session?.user?.name || "Me",
      submissionId: null,
      isRead: false,
    };

    startTransition(async () => {
      // 1. Instantly display in UI via optimistic state
      addOptimisticMessage(tempMsg);
      setTimeout(() => scrollToBottom("smooth"), 50);

      // 2. Save to database via Next.js Server Action
      const response = await sendChatMessage(selectedUser.id, textToSend);
      if (response.success && response.data) {
        const savedMsg = response.data;
        
        // Inject sender details for local UI consistency
        const fullMsg: ChatMessageRow = {
          ...savedMsg,
          senderName: session?.user?.name || "Me",
        };

        // 3. Add permanently to state (this replaces the optimistic message once the transition ends)
        setMessages((prev) => {
          if (prev.some((m) => m.id === fullMsg.id)) return prev;
          return [...prev, fullMsg];
        });
        setTimeout(() => scrollToBottom("smooth"), 50);

        // 4. Update last message time for sorting
        setLastMessageTime((prev) => ({
          ...prev,
          [selectedUser.id]: fullMsg.createdAt ? new Date(fullMsg.createdAt) : new Date(),
        }));

        // 5. Emit via socket to relay instantly
        if (socket && isConnected) {
          console.log("Emitting sendMessage via socket:", fullMsg);
          socket.emit("sendMessage", fullMsg);
        } else {
          console.warn("Socket emission skipped. socket:", !!socket, "isConnected:", isConnected);
        }
      }
    });
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "editor":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "reviewer":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-4 h-[calc(100vh-140px)] md:h-[calc(100vh-220px)] min-h-0 bg-slate-900/10 rounded-2xl overflow-hidden">
      
      {/* 👥 Left Panel: Users & Search */}
      <div className={cn(
        "w-full md:w-80 shrink-0 flex flex-col bg-card/45 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl",
        selectedUser ? "hidden md:flex" : "flex"
      )}>
        
        {/* Search Header */}
        <div className="p-4 border-b border-white/5 bg-slate-950/10 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-widest uppercase text-muted-foreground flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-primary" /> Active Chats
            </h2>
            <div className="flex items-center gap-1.5">
              <span className={cn("w-2 h-2 rounded-full", isConnected ? "bg-emerald-500 animate-pulse" : "bg-rose-500")} />
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                {isConnected ? "online" : "offline"}
              </span>
            </div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search staff & reviewers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950/20 border border-white/5 rounded-xl placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-primary/30 transition-all text-foreground"
            />
          </div>
        </div>

        {/* Users List */}
        <div data-lenis-prevent className="flex-1 overflow-y-auto p-2 space-y-1">
          {isSearching ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-muted-foreground/50">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-[10px] tracking-wider uppercase">Loading users...</span>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-10 text-xs text-muted-foreground/40">
              No chat partners found.
            </div>
          ) : (
            [...contacts].sort((a, b) => {
              const aTime = lastMessageTime[a.id]?.getTime() ?? 0;
              const bTime = lastMessageTime[b.id]?.getTime() ?? 0;
              return bTime - aTime;
            }).map((user) => {
              const isSelected = selectedUser?.id === user.id;
              const isOnline = onlineUsers.includes(user.id);
              const unread = unreadCountsByPartner[user.id] || 0;

              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 relative text-left",
                    isSelected 
                      ? "bg-primary/10 border border-primary/20 shadow-md shadow-primary/5" 
                      : "hover:bg-muted/10 border border-transparent"
                  )}
                >
                  {/* User Profile / Status Indicator */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-xs font-bold text-primary-foreground uppercase shadow-inner">
                      {user.fullName.substring(0, 2)}
                    </div>
                    <span 
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card",
                        isOnline ? "bg-emerald-500" : "bg-slate-600"
                      )} 
                    />
                  </div>

                  {/* Name and Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold truncate text-foreground">
                        {user.fullName}
                      </span>
                      <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border shrink-0", getRoleBadgeClass(user.role))}>
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>

                  {/* Unread Message Badge */}
                  {unread > 0 && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 min-w-5 h-5 px-1 bg-secondary text-secondary-foreground text-[10px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 💬 Right Panel: Messages Stream */}
      <div className={cn(
        "flex-1 flex flex-col bg-card/45 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-xl min-w-0",
        selectedUser ? "flex" : "hidden md:flex"
      )}>
        {selectedUser ? (
          <>
            {/* Active Header */}
            <div className="px-4 md:px-6 py-4 border-b border-white/5 bg-slate-950/10 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                {/* Back Button for Mobile Viewports (WhatsApp / Instagram style) */}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="Back to chat list"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-sm font-bold text-primary-foreground uppercase shadow-md">
                    {selectedUser.fullName.substring(0, 2)}
                  </div>
                  <span 
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card",
                      onlineUsers.includes(selectedUser.id) ? "bg-emerald-500" : "bg-slate-600"
                    )} 
                  />
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-black tracking-wider text-foreground">
                      {selectedUser.fullName}
                    </h3>
                    <span className={cn("text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-sm border", getRoleBadgeClass(selectedUser.role))}>
                      {selectedUser.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 block">
                    {selectedUser.email}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex text-[10px] text-muted-foreground items-center gap-1.5 bg-slate-950/20 px-3 py-1.5 rounded-lg border border-white/5">
                <Hash className="w-3.5 h-3.5 text-primary/60" />
                <span className="font-mono">Direct Communication Channel</span>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div 
              ref={messagesContainerRef}
              data-lenis-prevent
              className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-950/5"
            >
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">Decoding encrypted logs...</p>
                </div>
              ) : optimisticMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-2 opacity-50 p-4">
                  <MessageSquare className="w-10 h-10 text-primary/30" />
                  <p className="text-xs font-bold text-foreground">Secure Thread Initialized</p>
                  <p className="text-[10px] text-muted-foreground max-w-xs">
                    Send a message to start conversation. Messages are stored securely and pruned monthly.
                  </p>
                </div>
              ) : (
                optimisticMessages.map((msg, index) => {
                  const isSelf = msg.senderId === currentUserId;
                  const formattedTime = msg.createdAt
                    ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                    : "";

                  return (
                    <div
                      key={msg.id || index}
                      className={cn(
                        "flex flex-col max-w-[75%] space-y-1 transition-all duration-300",
                        isSelf ? "ml-auto items-end" : "mr-auto items-start"
                      )}
                    >
                      {/* Optional Sender Name (for other user) */}
                      {!isSelf && (
                        <span className="text-[9px] font-mono text-muted-foreground/60 px-1">
                          {msg.senderName || selectedUser.fullName}
                        </span>
                      )}
                      
                      {/* Message Bubble */}
                      <div
                        className={cn(
                          "px-4 py-2.5 text-xs rounded-2xl shadow-xs leading-relaxed border transition-all duration-300",
                          isSelf
                            ? "bg-primary border-primary/20 rounded-tr-none"
                            : "bg-secondary border-border/50 rounded-tl-none"
                        )}
                      >
                        <p className=" text-white whitespace-pre-wrap wrap-break-word">{msg.messageText}</p>
                      </div>

                      {/* Timestamp */}
                      <span className="text-[8px] font-mono text-muted-foreground/40 px-1">
                        {formattedTime}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
              onSubmit={handleSendMessage}
              className="p-4 border-t border-white/5 bg-slate-950/15 flex gap-2 shrink-0 items-center"
            >
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (newMessage.trim() && isConnected) {
                      handleSendMessage(e);
                    }
                  }
                }}
                placeholder="Type your message here... (Enter to send)"
                rows={1}
                className="flex-1 bg-slate-950/20 border border-white/5 rounded-xl px-4 py-2 text-xs placeholder:text-muted-foreground/40 resize-none min-h-[38px] max-h-[80px] focus:outline-hidden focus:ring-1 focus:ring-primary/30 transition-all text-foreground"
              />
              <Button
                type="submit"
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
                className="w-10 h-10 rounded-xl bg-primary text-primary-foreground hover:scale-105 transition-transform shrink-0 shadow-lg shadow-primary/10 disabled:opacity-50 disabled:hover:scale-100"
                aria-label="Send message"
              >
                <Send className="w-4.5 h-4.5" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 opacity-40">
            <div className="w-16 h-16 bg-muted/20 border border-white/5 rounded-2xl flex items-center justify-center text-muted-foreground animate-pulse shadow-inner">
              <MessageCircle className="w-8 h-8" />
            </div>
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-foreground">Select a Conversation</p>
              <p className="text-[10px] text-muted-foreground max-w-sm mt-1">
                Choose a team member or reviewer from the sidebar to establish a direct communication channel.
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { io, Socket } from "socket.io-client";
import { getSocketToken, getUnreadChatCount } from "@/actions/chat";
import { 
  type ChatMessageRow, 
  type ServerToClientEvents, 
  type ClientToServerEvents 
} from "@/db/types";

interface SocketContextType {
  socket: Socket<ServerToClientEvents, ClientToServerEvents> | null;
  isConnected: boolean;
  onlineUsers: string[];
  unreadCount: number;
  unreadCountsByPartner: Record<string, number>;
  activeChatPartnerId: string | null;
  setActiveChatPartnerId: (id: string | null) => void;
  clearUnreadCount: (partnerId: string) => void;
  decrementUnreadCount: (partnerId: string, amount: number) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

// Synthesize a short, pleasant browser chime using Web Audio API (no external file assets required)
function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    // Soft dual-tone chime (D5 then A5)
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08); // A5
    
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (err) {
    console.warn("Failed to play notification sound:", err);
  }
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const currentUserId = session?.user?.id;

  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadCountsByPartner, setUnreadCountsByPartner] = useState<Record<string, number>>({});
  const [activeChatPartnerId, setActiveChatPartnerId] = useState<string | null>(null);

  // Use ref to keep active partner accessible inside event listeners without rebuilding effect
  const activePartnerRef = useRef<string | null>(null);
  useEffect(() => {
    activePartnerRef.current = activeChatPartnerId;
  }, [activeChatPartnerId]);

  // Fetch initial unread counts from the database on mount/login
  useEffect(() => {
    if (!currentUserId) return;

    async function fetchInitialUnread() {
      const response = await getUnreadChatCount();
      if (response.success && response.data) {
        setUnreadCount(response.data.count);
        setUnreadCountsByPartner(response.data.byPartner);
      }
    }

    void fetchInitialUnread();
  }, [currentUserId]);

  // Request native browser notification permission on login
  useEffect(() => {
    if (!currentUserId) return;
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        try {
          const promise = Notification.requestPermission();
          if (promise && typeof promise.then === "function") {
            promise.catch(err => {
              console.warn("Failed to request notification permission:", err);
            });
          }
        } catch (err) {
          console.warn("Failed to request notification permission:", err);
        }
      }
    }
  }, [currentUserId]);

  // Initialize Socket.io Connection
  useEffect(() => {
    if (!currentUserId) {
      // Clean up socket if user logs out
      setSocket(prev => {
        if (prev) prev.disconnect();
        return null;
      });
      setIsConnected(false);
      return;
    }

    let activeSocket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
    let isMounted = true;

    async function initSocket() {
      const response = await getSocketToken();
      if (!isMounted) return;
      if (!response.success || !response.data) {
        console.warn("Failed to get socket token:", response.error);
        return;
      }

      const { token, socketUrl } = response.data;

      activeSocket = io(socketUrl, {
        auth: { token },
        transports: ["polling", "websocket"],
      }) as Socket<ServerToClientEvents, ClientToServerEvents>;

      activeSocket.on("connect", () => {
        setIsConnected(true);
        activeSocket?.emit("getOnlineUsers");
      });

      activeSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      activeSocket.on("onlineUsers", (userIds: string[]) => {
        setOnlineUsers(userIds);
      });

      // Handle real-time incoming messages globally
      activeSocket.on("receiveMessage", (msg: ChatMessageRow) => {
        // Only trigger alerts if the message is from someone other than the current user,
        // and they are not actively looking at their chat thread.
        if (msg.senderId !== currentUserId && msg.senderId !== activePartnerRef.current) {
          
          // Increment local unread indicators
          setUnreadCountsByPartner(prev => {
            const count = (prev[msg.senderId] || 0) + 1;
            return { ...prev, [msg.senderId]: count };
          });
          setUnreadCount(prev => prev + 1);

          // Play dynamic Web Audio chime
          playNotificationSound();

          // Native Browser Push Notification
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            try {
              new Notification(`New message from ${msg.senderName || "Team Member"}`, {
                body: msg.messageText,
                icon: "/favicon_io/apple-touch-icon.png",
              });
            } catch (err) {
              console.warn("Native browser Notification failed to build:", err);
            }
          }
        }
      });

      setSocket(activeSocket);
    }

    void initSocket();

    return () => {
      isMounted = false;
      if (activeSocket) {
        activeSocket.disconnect();
      }
    };
  }, [currentUserId]);

  const clearUnreadCount = useCallback((partnerId: string) => {
    setUnreadCountsByPartner(prev => {
      const copy = { ...prev };
      const countToClear = copy[partnerId] || 0;
      copy[partnerId] = 0;
      setUnreadCount(total => Math.max(0, total - countToClear));
      return copy;
    });
  }, []);

  const decrementUnreadCount = useCallback((partnerId: string, amount: number) => {
    setUnreadCountsByPartner(prev => {
      const copy = { ...prev };
      const current = copy[partnerId] || 0;
      const actualAmount = Math.min(current, amount);
      copy[partnerId] = Math.max(0, current - actualAmount);
      setUnreadCount(total => Math.max(0, total - actualAmount));
      return copy;
    });
  }, []);

  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    onlineUsers,
    unreadCount,
    unreadCountsByPartner,
    activeChatPartnerId,
    setActiveChatPartnerId,
    clearUnreadCount,
    decrementUnreadCount,
  }), [
    socket,
    isConnected,
    onlineUsers,
    unreadCount,
    unreadCountsByPartner,
    activeChatPartnerId,
    clearUnreadCount,
    decrementUnreadCount
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
}

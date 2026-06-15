"use client";

import { useEffect, useState } from "react";
import { Bell, X, ShieldCheck, Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { savePushSubscription } from "@/actions/push";

// Helper to convert base64 VAPID public key to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationBanner() {
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const vapidPublicKey = process.env['NEXT_PUBLIC_VAPID_PUBLIC_KEY'];

  // Initialize and check permission state
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermissionState("unsupported");
      return;
    }

    const currentPermission = Notification.permission;
    setPermissionState(currentPermission);

    let timer: ReturnType<typeof setTimeout> | undefined;

    // If permission is already granted, silently update/refresh subscription in the background
    if (currentPermission === "granted") {
      void refreshPushSubscription();
    } else if (currentPermission === "default") {
      // Show the opt-in banner after a slight delay to allow dashboard to load
      timer = setTimeout(() => setIsVisible(true), 2500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const refreshPushSubscription = async () => {
    if (!vapidPublicKey || !("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.ready;
      // Get current subscription or create new one
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
        });
      }

      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;
      const p256dh = keys?.["p256dh"];
      const auth = keys?.["auth"];

      if (subscription.endpoint && p256dh && auth) {
        await savePushSubscription(subscription.endpoint, p256dh, auth);
      }
    } catch (err) {
      console.warn("Silent push subscription refresh failed:", err);
    }
  };

  const handleEnableNotifications = async () => {
    if (permissionState === "unsupported" || !vapidPublicKey) return;

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission === "granted") {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as unknown as BufferSource,
        });

        const subscriptionJson = subscription.toJSON();
        const keys = subscriptionJson.keys;
        const p256dh = keys?.["p256dh"];
        const auth = keys?.["auth"];

        if (subscription.endpoint && p256dh && auth) {
          const res = await savePushSubscription(subscription.endpoint, p256dh, auth);
          if (res.success) {
            // Test locally
            new Notification("Notifications Enabled!", {
              body: "You're successfully subscribed to IJITEST updates.",
              icon: "/favicon_io/apple-touch-icon.png"
            });
          }
        }
        setIsVisible(false);
      }
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (permissionState === "unsupported" || !vapidPublicKey || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="fixed bottom-6 right-6 z-50 max-w-sm w-full p-4 rounded-2xl bg-card/85 backdrop-blur-xl border border-white/10 shadow-2xl flex gap-3.5 items-start"
      >
        {/* Pulsing Bell Icon Indicator */}
        <div className="relative shrink-0 mt-1">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <Bell className="w-5 h-5 animate-pulse" />
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-card" />
        </div>

        {/* Text Details */}
        <div className="flex-1 space-y-1">
          <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5 leading-none">
            Enable Live Updates
          </h4>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Opt-in to push notifications to get real‑time updates on reviewer assignments, decisions, and chat messages.
          </p>
          
          <div className="flex items-center gap-2 pt-2">
            <Button
              size="sm"
              disabled={isLoading}
              onClick={handleEnableNotifications}
              className="h-7 px-3 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-lg cursor-pointer flex items-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Enable
                </>
              )}
            </Button>
            
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="h-7 px-3 text-[10px] font-bold text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
            >
              Later
            </button>
          </div>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleClose}
          disabled={isLoading}
          className="text-muted-foreground/40 hover:text-foreground/80 p-1 -mr-1.5 -mt-1.5 transition-colors cursor-pointer rounded-lg hover:bg-muted/10"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

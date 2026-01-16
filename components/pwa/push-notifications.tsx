"use client";

/**
 * Push Notifications Infrastructure
 *
 * Implements Web Push API base infrastructure for notifications.
 * Used for alerting users about admin interventions in chat.
 *
 * @see Phase 4 requirements - Push Notifications
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, BellRinging, BellSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ===========================================
// TYPES
// ===========================================

export type NotificationPermission = "default" | "granted" | "denied";

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  requireInteraction?: boolean;
}

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Check if push notifications are supported
 */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  );
}

/**
 * Get current notification permission
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isPushSupported()) return "denied";
  return Notification.permission as NotificationPermission;
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushSupported()) return "denied";

  try {
    const permission = await Notification.requestPermission();
    return permission as NotificationPermission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

/**
 * Send a local notification (for simulation purposes)
 */
export async function sendLocalNotification(
  options: PushNotificationOptions
): Promise<boolean> {
  if (!isPushSupported()) return false;

  const permission = getNotificationPermission();
  if (permission !== "granted") return false;

  try {
    // Use ServiceWorker registration for notifications if available
    const registration = await navigator.serviceWorker.ready;
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || "/icons/icon-192x192.svg",
      badge: options.badge || "/icons/icon-72x72.svg",
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction ?? false,
    });
    return true;
  } catch (error) {
    // Fallback to regular Notification API
    try {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon || "/icons/icon-192x192.svg",
        tag: options.tag,
        data: options.data,
      });
      return true;
    } catch (fallbackError) {
      console.error("Error sending notification:", fallbackError);
      return false;
    }
  }
}

/**
 * Send notification when admin intervenes in chat
 */
export async function notifyAdminIntervention(
  sessionId: string,
  adminName: string
): Promise<boolean> {
  return sendLocalNotification({
    title: "Atendimento Transferido",
    body: `${adminName} assumiu seu atendimento para ajudá-lo melhor.`,
    tag: `intervention-${sessionId}`,
    data: { sessionId, type: "intervention" },
    requireInteraction: true,
  });
}

// ===========================================
// COMPONENTS
// ===========================================

interface NotificationPermissionButtonProps {
  className?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

/**
 * Button to request notification permission
 * For use in profile/settings page
 */
export function NotificationPermissionButton({
  className,
  onPermissionChange,
}: NotificationPermissionButtonProps) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = useCallback(async () => {
    setIsLoading(true);
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    onPermissionChange?.(newPermission);
    setIsLoading(false);

    // Send test notification if granted
    if (newPermission === "granted") {
      await sendLocalNotification({
        title: "Notificações ativadas!",
        body: "Você receberá atualizações importantes do Pulse.",
      });
    }
  }, [onPermissionChange]);

  const getIcon = () => {
    switch (permission) {
      case "granted":
        return <BellRinging className="w-5 h-5" weight="duotone" />;
      case "denied":
        return <BellSlash className="w-5 h-5" weight="duotone" />;
      default:
        return <Bell className="w-5 h-5" weight="duotone" />;
    }
  };

  const getText = () => {
    switch (permission) {
      case "granted":
        return "Notificações ativadas";
      case "denied":
        return "Notificações bloqueadas";
      default:
        return "Ativar notificações";
    }
  };

  const isDisabled = permission === "granted" || permission === "denied";

  return (
    <Button
      variant={permission === "granted" ? "secondary" : "outline"}
      className={cn(
        "min-h-11 gap-2",
        permission === "granted" && "text-emerald-600 border-emerald-200 bg-emerald-50",
        permission === "denied" && "text-slate-400 border-slate-200",
        className
      )}
      onClick={handleRequestPermission}
      disabled={isDisabled || isLoading}
    >
      {getIcon()}
      <span>{getText()}</span>
    </Button>
  );
}

// ===========================================
// HOOKS
// ===========================================

/**
 * Hook for managing notification permission
 */
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(isPushSupported());
    setPermission(getNotificationPermission());
  }, []);

  const requestPermission = useCallback(async () => {
    const newPermission = await requestNotificationPermission();
    setPermission(newPermission);
    return newPermission;
  }, []);

  return {
    permission,
    isSupported,
    isGranted: permission === "granted",
    isDenied: permission === "denied",
    requestPermission,
    sendNotification: sendLocalNotification,
  };
}

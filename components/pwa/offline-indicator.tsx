"use client";

/**
 * Offline Indicator Component
 *
 * Shows a visual badge when the user loses internet connection.
 * Implements the "Feedback" requirement from Phase 4.
 *
 * @see .github/agents/Master.agent.md - Section 2 (Design Engineering)
 */

import { useEffect, useState } from "react";
import { WifiSlash, WifiHigh } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showRestored, setShowRestored] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      // Hide "connection restored" after 3 seconds
      setTimeout(() => setShowRestored(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Don't render anything if online and not showing restored message
  if (isOnline && !showRestored) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50",
        "flex items-center gap-2 px-4 py-2 rounded-full",
        "text-sm font-medium shadow-lg",
        "transition-all duration-300 ease-out",
        isOnline
          ? "bg-emerald-500 text-white"
          : "bg-slate-800 text-white",
        className
      )}
    >
      {isOnline ? (
        <>
          <WifiHigh className="w-4 h-4" weight="bold" />
          <span>Conexão restaurada</span>
        </>
      ) : (
        <>
          <WifiSlash className="w-4 h-4" weight="bold" />
          <span>Você está offline</span>
        </>
      )}
    </div>
  );
}

/**
 * Hook for checking online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

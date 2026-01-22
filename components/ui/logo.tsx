"use client";

/**
 * Logo Component
 *
 * Automatically switches between light and dark logo versions
 * based on the current theme.
 *
 * - Light theme: pulse-logo-blue.webp
 * - Dark theme: pulse-logo.png
 */

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

interface LogoProps {
  className?: string;
  alt?: string;
}

export function Logo({ className = "h-8 w-auto object-contain", alt = "Pulse" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Show default logo during SSR to prevent flash
    return (
      <img 
        src="/logos/pulse-logo.png" 
        alt={alt} 
        className={className}
      />
    );
  }

  const logoSrc = resolvedTheme === "dark" 
    ? "/logos/pulse-logo.png" 
    : "/logos/pulse-logo-blue.webp";

  return (
    <img 
      src={logoSrc} 
      alt={alt} 
      className={className}
    />
  );
}

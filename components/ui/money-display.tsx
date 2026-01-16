/**
 * Money Display Component
 *
 * Displays monetary values with privacy control.
 * Respects global privacy settings (hide/show toggle).
 */

"use client";

import { usePrivacyStore } from "@/lib/store/privacy-store";

interface MoneyDisplayProps {
  value: number;
  /** Optional: Force hide regardless of global setting */
  forceHide?: boolean;
  /** Optional: Custom className */
  className?: string;
}

export function MoneyDisplay({ value, forceHide = false, className = "" }: MoneyDisplayProps) {
  const hideMoneyValues = usePrivacyStore((state) => state.hideMoneyValues);
  const shouldHide = forceHide || hideMoneyValues;

  const formattedValue = value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <span className={`font-mono tabular-nums ${className}`}>
      {shouldHide ? "R$ •••••" : formattedValue}
    </span>
  );
}

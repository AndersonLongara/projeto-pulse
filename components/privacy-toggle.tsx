/**
 * Privacy Toggle Button
 *
 * Global button to show/hide sensitive monetary values.
 * Displays in header/navbar for quick access.
 */

"use client";

import { Eye, EyeSlash } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { usePrivacyStore } from "@/lib/store/privacy-store";

export function PrivacyToggle() {
  const { hideMoneyValues, toggleMoneyVisibility } = usePrivacyStore();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleMoneyVisibility}
      className="relative"
      title={hideMoneyValues ? "Mostrar valores" : "Ocultar valores"}
    >
      {hideMoneyValues ? (
        <EyeSlash className="w-5 h-5" weight="duotone" />
      ) : (
        <Eye className="w-5 h-5" weight="duotone" />
      )}
      <span className="sr-only">
        {hideMoneyValues ? "Mostrar valores monetários" : "Ocultar valores monetários"}
      </span>
    </Button>
  );
}
